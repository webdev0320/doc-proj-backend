const express = require('express');
const Client = require('ssh2-sftp-client');
const path = require('path');
const fs = require('fs');
const { getStorageConfig } = require('../utils/storage');

const router = express.Router();

const LOCAL_PAGES_DIR = path.join(__dirname, '../../../storage/pages');

/**
 * GET /api/storage/:folder/:filename
 * Tries local file first, then falls back to SFTP proxy.
 */
router.get('/:folder/:filename', async (req, res) => {
  const { folder, filename } = req.params;

  // --- Fast path: serve from local disk if the file exists ---
  if (folder === 'pages') {
    const localPath = path.join(LOCAL_PAGES_DIR, filename);
    if (fs.existsSync(localPath)) {
      console.log(`Serving locally: ${localPath}`);
      return res.sendFile(localPath);
    }
  }

  // --- Fallback: proxy from SFTP (used in production/Vercel) ---
  const settings = await getStorageConfig();
  const tmpPath = path.join('/tmp', filename);

  console.log(`Local file not found. Proxy request: ${folder}/${filename}`);

  try {
    if (settings.provider === 'SFTP') {
      const sftp = new Client();
      await sftp.connect({
        host: settings.sftpHost,
        port: settings.sftpPort,
        username: settings.sftpUser,
        password: settings.sftpPass
      });

      const remotePath = `${folder}/${filename}`;
      try {
        await sftp.fastGet(remotePath, tmpPath);
      } catch (e) {
        console.warn(`Relative path failed, trying absolute: /${remotePath}`);
        await sftp.fastGet(`/${remotePath}`, tmpPath);
      }
      await sftp.end();

      res.sendFile(tmpPath, () => {
        try { if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath); } catch (e) {}
      });
    } else {
      res.status(400).send('Storage provider not supported for proxying');
    }
  } catch (err) {
    console.error('Storage Proxy Error:', err.message);
    res.status(404).send(`File not found: ${err.message}`);
  }
});

module.exports = router;
