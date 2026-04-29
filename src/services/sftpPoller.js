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

        for (const user of users) {
          const blob = await prisma.blob.create({
            data: {
              userId: user.id,
              filename: file.name,
              s3Path: fileName,
              status: 'PROCESSING',
            },
          });
          
          try {
            const { getStorageConfig } = require('../utils/storage');
            const storageSettings = await getStorageConfig();
            const engineUrl = `${process.env.ENGINE_URL || 'http://localhost:8000'}/process`;
            await axios.post(engineUrl, {
              blob_id: blob.id,
              storage_path: fileName,
              storage_settings: storageSettings
            }, { timeout: 30000 }); // 30s timeout
          } catch (err) {
            logger.error(`Failed to trigger engine for remote blob ${blob.id}: ${err.message}`);
            await prisma.blob.update({ where: { id: blob.id }, data: { status: 'FAILED' } });
          }
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

module.exports = { initSftpPoller, pollSftp };
