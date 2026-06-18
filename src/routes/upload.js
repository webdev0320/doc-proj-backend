const express = require('express');
const multer = require('multer');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { logger } = require('../utils/logger');
const { uploadToRemote, listInboundFiles, getStorageConfig } = require('../utils/storage');
const { prisma } = require('../lib/prisma');
const { encryptFile } = require('../utils/crypto');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF and Image files (PNG, JPG) are allowed'));
  },
});

/**
 * POST /api/upload
 * Direct ingestion: encrypt file locally, create Blob record, trigger engine immediately.
 */
router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file provided' });
  }

  const blobName = `${uuidv4()}-${req.file.originalname}`;
  const blobsDir = os.platform() === 'win32'
    ? path.join(__dirname, '../../../storage/blobs')
    : '/tmp';
  const encryptedPath = path.join(blobsDir, blobName);

  try {
    // 1. Encrypt and save locally
    await encryptFile(req.file.buffer, encryptedPath);
    logger.info(`Upload: encrypted ${req.file.originalname} -> ${blobName}`);

    // 2. Create blob record immediately
    const blob = await prisma.blob.create({
      data: {
        userId: req.user.id,
        filename: req.file.originalname,
        s3Path: blobName,
        status: 'PROCESSING',
        progress: 0,
      },
    });
    logger.info(`Upload: created blob ${blob.id} for ${req.file.originalname}`);

    // 3. Trigger engine immediately (fire-and-forget)
    const storageSettings = await getStorageConfig();
    const engineUrl = `${process.env.ENGINE_URL || 'http://localhost:8000'}/process`;
    axios.post(engineUrl, {
      blob_id: blob.id,
      storage_path: blobName,
      storage_settings: storageSettings,
    }).catch(err => {
      logger.error(`Upload: failed to trigger engine for blob ${blob.id}: ${err.message}`);
      prisma.blob.update({ where: { id: blob.id }, data: { status: 'FAILED' } }).catch(() => {});
    });

    res.status(202).json({
      success: true,
      message: 'File uploaded and processing started.',
      filename: blobName,
      blobId: blob.id,
    });
  } catch (err) {
    logger.error(`Upload failed: ${err.message}`);
    res.status(500).json({ success: false, message: `Upload failed: ${err.message}` });
  }
});

router.get('/inbound', async (req, res) => {
  try {
    const pdfFiles = await listInboundFiles();
    res.json({ success: true, data: pdfFiles });
  } catch (err) {
    logger.error(`List inbound failed: ${err.message}`);
    res.status(500).json({ success: false, message: 'Failed to list inbound files' });
  }
});

module.exports = router;
