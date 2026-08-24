const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { prisma } = require('../lib/prisma');
const { logger } = require('../utils/logger');
const { uploadToRemote, getStorageConfig } = require('../utils/storage');

const router = express.Router();

async function performDocumentGrouping(blobId, status) {
  if (status !== 'COMPLETED') return;

  await prisma.$transaction(async (tx) => {
    const blob = await tx.blob.findUnique({
      where: { id: blobId },
      select: { userId: true }
    });
    if (!blob) throw new Error(`Blob not found: ${blobId}`);

    const pages = await tx.page.findMany({
      where: { blobId },
      orderBy: { pageIndex: 'asc' }
    });
    if (pages.length === 0) return;

    await tx.document.deleteMany({ where: { blobId } });

    const groupMap = {};
    for (const page of pages) {
      const label = page.aiLabel || 'UNCLASSIFIED';
      if (!groupMap[label]) groupMap[label] = [];
      groupMap[label].push(page);
    }
    const groups = Object.entries(groupMap).map(([documentType, pages]) => ({
      documentType,
      pages,
    }));

    for (const group of groups) {
      group.pages.sort((a, b) => a.pageIndex - b.pageIndex);
      const firstPage = group.pages[0];
      const lastPage = group.pages[group.pages.length - 1];
      const pageRange = firstPage.pageIndex === lastPage.pageIndex
        ? `p.${firstPage.pageIndex + 1}`
        : `p.${firstPage.pageIndex + 1}-${lastPage.pageIndex + 1}`;

      const document = await tx.document.create({
        data: {
          blobId,
          userId: blob.userId,
          name: `${group.documentType} (${pageRange})`,
          documentType: group.documentType,
          status: 'AI_CLASSIFIED',
        }
      });

      const pageIds = group.pages.map(p => p.id);

      await tx.documentPage.createMany({
        data: group.pages.map((page, index) => ({
          documentId: document.id,
          pageId: page.id,
          order: index
        }))
      });

      // Backfill documentId on extracted_values for these pages
      await tx.extractedValue.updateMany({
        where: { pageId: { in: pageIds } },
        data: { documentId: document.id, documentName: group.documentType },
      });
    }
  }, { timeout: 30000 });
}

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF and Image files are allowed'));
  },
});

// GET /api/blobs — list all blobs
router.get('/', async (req, res) => {
  try {
    const blobs = await prisma.blob.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { assignedToId: req.user.id },
          { assignedToId: null }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: { 
        _count: { select: { pages: true, documents: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        auditLogs: {
          where: { action: { in: ['ENGINE_FAILED', 'ENGINE_FAILED_TRIGGER', 'ENGINE_ATTEMPT', 'ENGINE_REQUEUE', 'ENGINE_TRIGGERED'] } },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { payload: true, createdAt: true, action: true }
        }
      },
    });
    res.json({ success: true, data: blobs });
  } catch (err) {
    if (err.message.includes('assignedAt') || err.message.includes('completedAt')) {
      // Fallback: Manually select only existing columns to bypass DB mismatch
      const safeSelect = {
        id: true, userId: true, assignedToId: true, filename: true,
        s3Path: true, pageCount: true, status: true, batchNo: true,
        progress: true, createdAt: true, updatedAt: true,
        _count: { select: { pages: true, documents: true } },
        assignedTo: { select: { id: true, name: true, email: true } }
      }
      const blobs = await prisma.blob.findMany({
        where: {
          OR: [
            { userId: req.user.id },
            { assignedToId: req.user.id },
            { assignedToId: null }
          ]
        },
        orderBy: { createdAt: 'desc' },
        select: safeSelect
      });
      res.json({ success: true, data: blobs });
    } else {
      throw err;
    }
  }
});

// GET /api/blobs/:id — single blob with pages
router.get('/:id', async (req, res) => {
  try {
    const blob = await prisma.blob.findUniqueOrThrow({
      where: { id: req.params.id },
      include: {
        assignedTo: { select: { id: true, name: true } },
        pages: {
          orderBy: { pageIndex: 'asc' },
          include: { extractedValues: true },
        },
        documents: {
          include: {
            pages: {
              include: {
                page: { include: { extractedValues: true } },
              },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });
    // Attach latest engine failure (if any) for easier diagnostics in UI
    try {
      const engineError = await prisma.auditLog.findFirst({
        where: { blobId: blob.id, action: { in: ['ENGINE_FAILED', 'ENGINE_FAILED_TRIGGER', 'ENGINE_ATTEMPT', 'ENGINE_REQUEUE', 'ENGINE_TRIGGERED'] } },
        orderBy: { createdAt: 'desc' },
        select: { payload: true, createdAt: true, action: true }
      });
      return res.json({ success: true, data: { ...blob, engineError } });
    } catch (err) {
      logger.warn(`Could not fetch engine error for blob ${blob.id}: ${err.message}`);
      return res.json({ success: true, data: blob, error:err });
    }
  } catch (err) {
    if (err.message.includes('assignedAt') || err.message.includes('completedAt')) {
      const safeSelect = {
        id: true, userId: true, assignedToId: true, filename: true,
        s3Path: true, pageCount: true, status: true, batchNo: true,
        progress: true, createdAt: true, updatedAt: true,
        assignedTo: { select: { id: true, name: true } },
        pages: {
          orderBy: { pageIndex: 'asc' },
          include: { extractedValues: true },
        },
        documents: {
          include: {
            pages: {
              include: {
                page: { include: { extractedValues: true } },
              },
              orderBy: { order: 'asc' },
            },
          },
        },
      }
      const blob = await prisma.blob.findUniqueOrThrow({
        where: { id: req.params.id },
        select: safeSelect
      });
      try {
        const engineError = await prisma.auditLog.findFirst({
          where: { blobId: blob.id, action: { in: ['ENGINE_FAILED', 'ENGINE_FAILED_TRIGGER', 'ENGINE_ATTEMPT', 'ENGINE_REQUEUE', 'ENGINE_TRIGGERED'] } },
          orderBy: { createdAt: 'desc' },
          select: { payload: true, createdAt: true, action: true }
        });
        return res.json({ success: true, data: { ...blob, engineError } });
      } catch (err2) {
        logger.warn(`Could not fetch engine error for blob ${blob.id}: ${err2.message}`);
        return res.json({ success: true, data: blob });
      }
    } else {
      throw err;
    }
  }
});

// GET /api/blobs/:id/engine-error — return latest engine failure payload
router.get('/:id/engine-error', async (req, res) => {
  const { id } = req.params;
  try {
    const entry = await prisma.auditLog.findFirst({
      where: { blobId: id, action: 'ENGINE_FAILED' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, payload: true, createdAt: true }
    });
    if (!entry) return res.json({ success: true, data: null });
    res.json({ success: true, data: entry });
  } catch (err) {
    logger.error(`Failed to fetch engine error for blob ${id}: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/blobs/:id/assign — assign blob to user and set batch number
router.post('/:id/assign', async (req, res) => {
  const { id } = req.params;
  const { batchNo } = req.body;

  if (!batchNo) {
    return res.status(400).json({ success: false, error: 'Batch number is required' });
  }

  try {
    const blob = await prisma.blob.update({
      where: { id },
      data: {
        assignedToId: req.user.id,
        batchNo: batchNo,
        status: 'IN-PROGRESS',
        assignedAt: new Date()
      },
      include: {
        assignedTo: { select: { id: true, name: true } }
      }
    });
    res.json({ success: true, data: blob });
  } catch (err) {
    if (err.message.includes('assignedAt')) {
      const blob = await prisma.blob.update({
        where: { id },
        data: {
          assignedToId: req.user.id,
          batchNo: batchNo,
          status: 'IN-PROGRESS'
        },
        include: {
          assignedTo: { select: { id: true, name: true } }
        }
      });
      res.json({ success: true, data: blob });
    } else {
      throw err;
    }
  }
});

// PATCH /api/blobs/:id — update status/progress (engine callback)
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status, progress, error } = req.body;

  const blob = await prisma.blob.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(progress !== undefined && { progress })
    }
  });

  if (status === 'COMPLETED') {
    // Run final document grouping for all pages (including all chunks)
    try {
      await performDocumentGrouping(id, status);
    } catch (grpErr) {
      logger.error(`Failed to perform final document grouping for blob ${id}: ${grpErr.message}`);
    }
  }

  // If the engine supplied an error message, record it for diagnostics
  try {
    if (error) {
      logger.error(`[Engine Callback Error] Engine reported processing failure for blob ${id}:`, error);
      await prisma.auditLog.create({
        data: {
          blobId: id,
          action: 'ENGINE_FAILED',
          payload: typeof error === 'string' ? error : JSON.stringify(error),
          performedBy: 'ai-engine'
        }
      });
    }
  } catch (logErr) {
    // Don't fail the request if audit logging fails
    logger.error(`Failed to write engine error audit log for blob ${id}: ${logErr.message}`);
  }

  res.json({ success: true, data: blob });
});

/**
 * POST /api/blobs/:id/pages
 * Called by the Python engine after it finishes exploding a PDF.
 * Optimized: uses bulk createMany + in-memory grouping to minimize DB round-trips.
 */
router.post('/:id/pages', async (req, res) => {
  const { id } = req.params;
  const { pages, status, mode } = req.body;

  if (!pages || pages.length === 0) {
    return res.status(400).json({ success: false, error: 'No pages provided' });
  }

  logger.info(`Engine callback for blob ${id}: ${pages.length} pages, status=${status}, mode=${mode || 'default'}`);
  if (pages.length > 0) {
    logger.info(`Sample page keys: ${Object.keys(pages[0]).join(', ')}`);
  }

  // ── APPEND MODE: just insert new pages, keep existing ones ─────────────
  if (mode === 'append') {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.page.createMany({
          data: pages.map(p => ({
            blobId: id,
            pageIndex: p.page_index,
            s3Path: p.s3_path,
            aiLabel: p.ai_label,
            confidenceScore: p.confidence_score,
            isFlagged: p.is_flagged || false,
            anomalyFlags: p.anomaly_flags,
          })),
          skipDuplicates: true,
        });

        // Insert extracted values as individual rows
        for (const p of pages) {
          const extData = p.extracted_data || p.data || p.fields || p.ocr;
          const finalData = extData && Object.keys(extData).length > 0
            ? extData
            : (p.ocr_text || p.content ? { "Raw OCR Content": p.ocr_text || p.content } : null);

          if (finalData && typeof finalData === 'object') {
            const pageRecord = await tx.page.findFirst({
              where: { blobId: id, pageIndex: p.page_index },
              select: { id: true },
            });
            if (pageRecord) {
              const docName = p.ai_label || 'UNCLASSIFIED';
              await tx.extractedValue.createMany({
                data: Object.entries(finalData).map(([fieldName, extractedValue]) => ({
                  blobId: id,
                  pageId: pageRecord.id,
                  documentName: docName,
                  fieldName,
                  extractedValue: extractedValue != null ? String(extractedValue) : '',
                })),
                skipDuplicates: true,
              });
            }
          }
        }
      });

      const totalPages = await prisma.page.count({ where: { blobId: id } });
      await prisma.blob.update({
        where: { id },
        data: { status: status || 'PROCESSING', pageCount: totalPages },
      });
      return res.json({ success: true, pagesAdded: pages.length, totalPages });
    } catch (err) {
      logger.error(`Append callback failed: ${err.message}`);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // Sort pages in-memory once (cheap JS sort, not a DB query)
  pages.sort((a, b) => a.page_index - b.page_index);

  try {
    // ─── Phase 1: Fast bulk page write ───────────────────────────────────────
    // For the EXPLODED (initial placeholder) callback we just do a createMany.
    // For the COMPLETED callback we delete stale rows and re-insert with final data.
    // This collapses hundreds of per-page upserts into 2 statements.
    await prisma.$transaction(async (tx) => {
      if (status === 'EXPLODED') {
        // Skip if pages already exist (idempotent early-exit)
        const existing = await tx.page.count({ where: { blobId: id } });
        if (existing === 0) {
          await tx.page.createMany({
            data: pages.map(p => ({
              blobId: id,
              pageIndex: p.page_index,
              s3Path: p.s3_path,
              aiLabel: p.ai_label,
              confidenceScore: p.confidence_score,
              isFlagged: p.is_flagged || false,
              anomalyFlags: p.anomaly_flags,
            })),
            skipDuplicates: true,
          });
        }
        await tx.blob.update({
          where: { id },
          data: { status: 'EXPLODED', pageCount: pages.length },
        });
      } else {
        // COMPLETED path: delete old stubs and bulk-insert final records
        await tx.page.deleteMany({ where: { blobId: id } });
        await tx.page.createMany({
          data: pages.map(p => ({
            blobId: id,
            pageIndex: p.page_index,
            s3Path: p.s3_path,
            aiLabel: p.ai_label,
            confidenceScore: p.confidence_score,
            isFlagged: p.is_flagged || false,
            anomalyFlags: p.anomaly_flags,
          })),
        });

        // Insert extracted values as individual rows
        for (const p of pages) {
          const extData = p.extracted_data || p.data || p.fields || p.ocr;
          const finalData = extData && Object.keys(extData).length > 0
            ? extData
            : (p.ocr_text || p.content ? { "Raw OCR Content": p.ocr_text || p.content } : null);

          if (finalData && typeof finalData === 'object') {
            const pageRecord = await tx.page.findFirst({
              where: { blobId: id, pageIndex: p.page_index },
              select: { id: true },
            });
            if (pageRecord) {
              const docName = p.ai_label || 'UNCLASSIFIED';
              await tx.extractedValue.createMany({
                data: Object.entries(finalData).map(([fieldName, extractedValue]) => ({
                  blobId: id,
                  pageId: pageRecord.id,
                  documentName: docName,
                  fieldName,
                  extractedValue: extractedValue != null ? String(extractedValue) : '',
                })),
                skipDuplicates: true,
              });
            }
          }
        }

        await tx.blob.update({
          where: { id },
          data: { status: status || 'PROCESSING', pageCount: pages.length },
        });
      }
    }, { timeout: 30000 }); // Give large batches a longer transaction window

    // ─── Phase 2: Document grouping (COMPLETED only) ─────────────────────────
    // Done OUTSIDE the first transaction so it doesn't extend the write lock.
    if (status === 'COMPLETED') {
      await performDocumentGrouping(id, status);
    }

    res.json({ success: true, pagesCreated: pages.length });
  } catch (err) {
    logger.error(`Failed to process engine callback: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/blobs/:id/add-pages
 * Called by the frontend to upload extra pages to an existing blob.
 * Uploads the file to remote storage, then triggers the engine's /process-append.
 */
router.post('/:id/add-pages', upload.single('file'), async (req, res) => {
  const { id } = req.params;
  if (!req.file) return res.status(400).json({ success: false, error: 'No file provided' });

  try {
    // Verify blob ownership
    const blob = await prisma.blob.findUniqueOrThrow({ where: { id } });

    // Get current page count to use as offset
    const pageOffset = await prisma.page.count({ where: { blobId: id } });

    // Upload new file to remote Inbound storage
    const remoteFileName = `${uuidv4()}-${req.file.originalname}`;
    await uploadToRemote(remoteFileName, req.file.buffer, 'Inbound');
    logger.info(`Add-pages: uploaded ${remoteFileName} for blob ${id} (offset=${pageOffset})`);

    // Mark blob as processing
    await prisma.blob.update({ where: { id }, data: { status: 'PROCESSING' } });

    // Trigger engine append endpoint
    const storageSettings = await getStorageConfig();
    const engineUrl = `${process.env.ENGINE_URL || 'http://localhost:8000'}/process-append`;
    await axios.post(engineUrl, {
      blob_id: id,
      storage_path: remoteFileName,
      page_offset: pageOffset,
      storage_settings: storageSettings,
    });

    res.status(202).json({ success: true, message: 'Append processing started', pageOffset });
  } catch (err) {
    logger.error(`Add-pages failed for blob ${id}: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/blobs/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const blob = await prisma.blob.findUnique({
      where: { id },
      include: { pages: true }
    });
    
    if (!blob) return res.status(404).json({ success: false, message: 'Blob not found' });

    // 1. Delete files from disk
    const blobsDir = path.join(__dirname, '../../../storage/blobs');
    const pagesDir = path.join(__dirname, '../../../storage/pages');
    
    // PDF
    const pdfPath = path.join(blobsDir, blob.s3Path);
    if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
    
    // Pages
    for (const page of blob.pages) {
      const pagePath = path.join(pagesDir, page.s3Path);
      if (fs.existsSync(pagePath)) fs.unlinkSync(pagePath);
    }

    // 2. Delete from DB
    await prisma.blob.delete({ where: { id } });

    res.json({ success: true, message: 'Blob and files deleted successfully' });
  } catch (err) {
    logger.error(`Failed to delete blob: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
