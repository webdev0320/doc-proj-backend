const cron = require('node-cron');
const os = require('os');
const Client = require('ssh2-sftp-client');
const fs = require('fs/promises');
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { prisma } = require('../lib/prisma');
const { logger } = require('../utils/logger');
const { encryptFile } = require('../utils/crypto');

const storageDir = os.platform() === 'win32' 
  ? path.join(__dirname, '../../../storage/blobs')
  : '/tmp';

const { listInboundFiles, downloadFromInbound, moveToArchive } = require('../utils/storage');

let isPolling = false;

async function recordAudit(blobId, action, payload) {
  try {
    await prisma.auditLog.create({
      data: {
        blobId,
        action,
        payload: typeof payload === 'string' ? payload : JSON.stringify(payload),
        performedBy: 'sftp-poller'
      }
    });
  } catch (err) {
    logger.warn(`Failed to write audit log (${action}) for blob ${blobId}: ${err.message}`);
  }
}

async function triggerEngine(blob, remoteFileName, storageSettings) {
  const engineUrl = `${process.env.ENGINE_URL || 'http://localhost:8000'}/process`;
  const maxAttempts = 3;
  let lastErr = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      logger.info(`Trigger engine attempt ${attempt} for blob ${blob.id}`);
      await axios.post(engineUrl, {
        blob_id: blob.id,
        storage_path: remoteFileName,
        storage_settings: storageSettings
      }, { timeout: 30000 });

      await recordAudit(blob.id, 'ENGINE_TRIGGERED', { attempt, remoteFileName });
      return { success: true, attempts: attempt };
    } catch (err) {
      lastErr = err;
      logger.warn(`Engine trigger attempt ${attempt} failed for blob ${blob.id}: ${err.message}`);
      await recordAudit(blob.id, 'ENGINE_ATTEMPT', { attempt, error: err.message });
      // exponential backoff
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }

  await recordAudit(blob.id, 'ENGINE_FAILED_TRIGGER', { error: lastErr?.message || 'unknown', attempts: maxAttempts });
  return { success: false, attempts: maxAttempts, error: lastErr };
}

async function pollSftp() {
  if (isPolling) {
    logger.info('SFTP Poll already in progress, skipping...');
    return;
  }
  isPolling = true;
  try {
    const pdfFiles = await listInboundFiles();
    if (pdfFiles.length === 0) return;

    const users = await prisma.user.findMany({ where: { status: 'ACTIVE' } });
    if (users.length === 0) {
      logger.warn('No active users found to assign inbound files to.');
      return;
    }

    for (const file of pdfFiles) {
      logger.info(`Found new remote file: ${file.name}`);
      const fileName = `${uuidv4()}-${file.name}`;
      const actualStorageDir = os.platform() === 'win32' 
        ? path.join(__dirname, '../../../storage/blobs')
        : '/tmp';
      const filePath = path.join(actualStorageDir, fileName);
      const tempPath = `${filePath}.tmp`;

      try {
        await downloadFromInbound(file.name, tempPath);
        await encryptFile(tempPath, filePath);
        await fs.unlink(tempPath);

        // Create only ONE blob for the system, assigned to the first active user (uploader)
        const primaryUser = users.find(u => u.role === 'ADMIN') || users[0];
        
        const blob = await prisma.blob.create({
          data: {
            userId: primaryUser.id,
            filename: file.name,
            s3Path: fileName,
            status: 'PROCESSING',
          },
        });
        
        try {
          const { getStorageConfig } = require('../utils/storage');
          const storageSettings = await getStorageConfig();

          logger.info(`Triggering engine for blob ${blob.id} (File: ${file.name})`);
          const res = await triggerEngine(blob, fileName, storageSettings);
          if (!res.success) {
            logger.error(`Failed to trigger engine for remote blob ${blob.id} after ${res.attempts} attempts.`);
            await prisma.blob.update({ where: { id: blob.id }, data: { status: 'FAILED' } });
          }
        } catch (err) {
          logger.error(`Failed to trigger engine for remote blob ${blob.id}: ${err.message}`);
          await prisma.blob.update({ where: { id: blob.id }, data: { status: 'FAILED' } });
        }
        await moveToArchive(file.name);
        logger.info(`Moved ${file.name} to Archive.`);
      } catch (err) {
        logger.error(`Error processing file ${file.name}: ${err.message}`);
      }
    }
  } catch (err) {
    logger.error(`Storage Poller Error: ${err.message}`);
  } finally {
    isPolling = false;
  }
}

function initSftpPoller() {
  // Poll every minute
  cron.schedule('* * * * *', () => {
    logger.info('Running SFTP inbound poll...');
    pollSftp();
  });
  logger.info('SFTP Poller initialized.');
}

// Requeue FAILED blobs periodically (every 5 minutes)
cron.schedule('*/5 * * * *', async () => {
  logger.info('Requeue job: scanning for FAILED blobs...');
  try {
    const threshold = new Date(Date.now() - 60 * 1000); // 1 minute ago
    const failed = await prisma.blob.findMany({ where: { status: 'FAILED', updatedAt: { lt: threshold } } });
    if (failed.length === 0) return;
    logger.info(`Requeue job: found ${failed.length} FAILED blobs`);

    const { getStorageConfig } = require('../utils/storage');
    const storageSettings = await getStorageConfig();

    for (const b of failed) {
      try {
        logger.info(`Requeueing blob ${b.id} (s3Path=${b.s3Path})`);
        const res = await triggerEngine(b, b.s3Path, storageSettings);
        await recordAudit(b.id, 'ENGINE_REQUEUE', { attempts: res.attempts, success: res.success });
        if (res.success) {
          // mark as processing again; engine will PATCH to COMPLETED
          await prisma.blob.update({ where: { id: b.id }, data: { status: 'PROCESSING' } });
        }
      } catch (err) {
        logger.warn(`Requeue for blob ${b.id} failed: ${err.message}`);
        await recordAudit(b.id, 'ENGINE_REQUEUE_FAILED', { error: err.message });
      }
    }
  } catch (err) {
    logger.error(`Requeue job failed: ${err.message}`);
  }
});

module.exports = { initSftpPoller, pollSftp };
