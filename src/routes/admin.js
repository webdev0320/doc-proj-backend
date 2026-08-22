const express = require('express');
const { prisma } = require('../lib/prisma');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { updateEnv } = require('../utils/env');

const router = express.Router();

// Temporary helper to seed production database from backend environment variables
router.get('/temp-seed', async (req, res) => {
  try {
    const s = await prisma.storageSettings.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        provider: 'SFTP',
        sftpHost: process.env.SFTP_HOST,
        sftpPort: parseInt(process.env.SFTP_PORT || '22'),
        sftpUser: process.env.SFTP_USERNAME,
        sftpPass: process.env.SFTP_PASSWORD
      },
      update: {
        provider: 'SFTP',
        sftpHost: process.env.SFTP_HOST,
        sftpPort: parseInt(process.env.SFTP_PORT || '22'),
        sftpUser: process.env.SFTP_USERNAME,
        sftpPass: process.env.SFTP_PASSWORD
      }
    });
    res.json({ success: true, message: 'Production DB seeded successfully!', provider: s.provider, sftpHost: s.sftpHost, sftpUser: s.sftpUser });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Apply auth protection to all routes in this file
router.use(authMiddleware);

// --- USER MANAGEMENT ---

// GET /api/admin/users - List all employees
router.get('/users', adminMiddleware, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { blobs: true, documents: true }
        }
      }
    });
    // Remove passwords before sending
    const safeUsers = users.map(u => {
      const { password, ...safe } = u;
      return safe;
    });
    res.json({ success: true, data: safeUsers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/users - Create new user (Admin only, does NOT set session)
router.post('/users', adminMiddleware, async (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    const bcrypt = require('bcryptjs');
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ success: false, message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'OPERATOR',
      },
    });

    const { password: _, ...safeUser } = user;
    res.json({ success: true, data: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/users/:id/reset-password - Reset user password
router.post('/users/:id/reset-password', adminMiddleware, async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ success: false, message: 'Password is required' });

  try {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: req.params.id },
      data: { password: hashedPassword }
    });
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/admin/users/:id - Update user role or status
router.patch('/users/:id', adminMiddleware, async (req, res) => {
  const { role, status, name } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role, status, name }
    });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/admin/users/:id - Remove user
router.delete('/users/:id', adminMiddleware, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- DOCUMENT TEMPLATES (SCHEMA CONFIG) ---

// GET /api/admin/doc-types
router.get('/doc-types', async (req, res) => {
  try {
    const types = await prisma.configuredDocType.findMany({
      orderBy: { label: 'asc' }
    });
    res.json({ success: true, data: types });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/doc-types - Add new template
router.post('/doc-types', adminMiddleware, async (req, res) => {
  const { code, label, description, isCommon } = req.body;
  try {
    const type = await prisma.configuredDocType.create({
      data: { code, label, description, isCommon }
    });
    res.json({ success: true, data: type });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/admin/doc-types/:id - Update template
router.patch('/doc-types/:id', adminMiddleware, async (req, res) => {
  const { code, label, description, isCommon } = req.body;
  try {
    const type = await prisma.configuredDocType.update({
      where: { id: req.params.id },
      data: { code, label, description, isCommon }
    });
    res.json({ success: true, data: type });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/admin/doc-types/:id
router.delete('/doc-types/:id', adminMiddleware, async (req, res) => {
  try {
    await prisma.configuredDocType.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- CHECKLISTS ---

// GET /api/admin/checklists
router.get('/checklists', async (req, res) => {
  try {
    const items = await prisma.checklistItem.findMany({
      orderBy: { createdAt: 'asc' }
    });
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/checklists
router.post('/checklists', adminMiddleware, async (req, res) => {
  const { text } = req.body;
  try {
    const item = await prisma.checklistItem.create({
      data: { text }
    });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/admin/checklists/:id
router.delete('/checklists/:id', adminMiddleware, async (req, res) => {
  try {
    await prisma.checklistItem.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- STORAGE SETTINGS ---

// GET /api/admin/storage-settings
router.get('/storage-settings', adminMiddleware, async (req, res) => {
  try {
    let settings = await prisma.storageSettings.findUnique({ where: { id: 'default' } });
    if (!settings) {
      settings = await prisma.storageSettings.create({ data: { id: 'default' } });
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- ENGINE / PROCESSING INSIGHTS ---

// GET /api/admin/engine/errors - recent engine-related audit logs
router.get('/engine/errors', adminMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const logs = await prisma.auditLog.findMany({
      where: { action: { in: ['ENGINE_FAILED', 'ENGINE_FAILED_TRIGGER', 'ENGINE_ATTEMPT', 'ENGINE_REQUEUE', 'ENGINE_TRIGGERED'] } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { blob: { select: { id: true, filename: true, status: true } } }
    });
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/engine/failed-blobs - list blobs currently marked FAILED
router.get('/engine/failed-blobs', adminMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '100', 10);
    const blobs = await prisma.blob.findMany({
      where: { status: 'FAILED' },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      include: { _count: { select: { pages: true, documents: true } } }
    });
    res.json({ success: true, data: blobs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/admin/storage-settings
router.put('/storage-settings', adminMiddleware, async (req, res) => {
  try {
    const data = req.body;
    // Don't update id
    delete data.id;
    delete data.updatedAt;

    const settings = await prisma.storageSettings.upsert({
      where: { id: 'default' },
      create: { id: 'default', ...data },
      update: { ...data }
    });

    // Update .env file
    const envUpdates = {};
    if (data.provider === 'SFTP') {
      if (data.sftpHost) envUpdates.SFTP_HOST = data.sftpHost;
      if (data.sftpPort) envUpdates.SFTP_PORT = data.sftpPort;
      if (data.sftpUser) envUpdates.SFTP_USERNAME = data.sftpUser;
      if (data.sftpPass) envUpdates.SFTP_PASSWORD = data.sftpPass;
    } else if (data.provider === 'S3') {
      if (data.s3Bucket) envUpdates.S3_BUCKET = data.s3Bucket;
      if (data.s3Region) envUpdates.S3_REGION = data.s3Region;
      if (data.s3AccessKey) envUpdates.S3_ACCESS_KEY = data.s3AccessKey;
      if (data.s3SecretKey) envUpdates.S3_SECRET_KEY = data.s3SecretKey;
    }
    
    if (Object.keys(envUpdates).length > 0) {
      updateEnv(envUpdates);
    }

    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- DOCUMENT INDEXING (Per-Blob View) ---

// GET /api/admin/blobs - List all blobs with document counts (searchable, paginated)
router.get('/blobs', adminMiddleware, async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = search
      ? {
          OR: [
            { filename: { contains: search, mode: 'insensitive' } },
            { batchNo: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [blobs, total] = await Promise.all([
      prisma.blob.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: parseInt(limit),
        include: {
          _count: { select: { documents: true, pages: true } },
        },
      }),
      prisma.blob.count({ where }),
    ]);

    res.json({ success: true, data: blobs, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/blobs/:id/documents - Get all documents for a blob with pages and extracted data
router.get('/blobs/:id/documents', adminMiddleware, async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      where: { blobId: req.params.id },
      include: {
        pages: {
          include: { page: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const blob = await prisma.blob.findUnique({
      where: { id: req.params.id },
      select: { id: true, filename: true, batchNo: true, pageCount: true, status: true },
    });

    res.json({ success: true, data: { blob, documents } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/admin/documents/:id/rename - Update document name and/or documentType
router.patch('/documents/:id/rename', adminMiddleware, async (req, res) => {
  const { name, documentType } = req.body;
  try {
    const doc = await prisma.$transaction(async (tx) => {
      const updated = await tx.document.update({
        where: { id: req.params.id },
        data: {
          ...(name !== undefined && { name }),
          ...(documentType !== undefined && { documentType }),
        },
        include: { pages: { include: { page: true }, orderBy: { order: 'asc' } } },
      });

      await tx.auditLog.create({
        data: {
          blobId: updated.blobId,
          documentId: updated.id,
          action: 'ADMIN_RENAME',
          payload: JSON.stringify({ name, documentType, performedBy: req.user?.id }),
        },
      });

      return updated;
    });

    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/admin/documents/:id/extracted-data - Update extractedData for a document's pages
router.patch('/documents/:id/extracted-data', adminMiddleware, async (req, res) => {
  const { extractedData, pageId } = req.body;
  try {
    const doc = await prisma.$transaction(async (tx) => {
      const document = await tx.document.findUnique({
        where: { id: req.params.id },
        include: { pages: { include: { page: true }, orderBy: { order: 'asc' } } },
      });

      if (!document) throw new Error('Document not found');

      const targetPageId = pageId || document.pages[0]?.pageId;
      if (!targetPageId) throw new Error('No pages found for this document');

      await tx.page.update({
        where: { id: targetPageId },
        data: { extractedData: JSON.stringify(extractedData) },
      });

      await tx.auditLog.create({
        data: {
          blobId: document.blobId,
          documentId: document.id,
          action: 'ADMIN_UPDATE_EXTRACTED_DATA',
          payload: JSON.stringify({ pageId: targetPageId, fields: Object.keys(extractedData), performedBy: req.user?.id }),
        },
      });

      const updated = await tx.document.findUnique({
        where: { id: req.params.id },
        include: { pages: { include: { page: true }, orderBy: { order: 'asc' } } },
      });

      return updated;
    });

    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

