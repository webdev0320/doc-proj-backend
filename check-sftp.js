const Client = require('ssh2-sftp-client');
require('dotenv').config();

async function checkSftp() {
  const sftp = new Client();
  try {
    await sftp.connect({
      host: process.env.SFTP_HOST,
      port: parseInt(process.env.SFTP_PORT || '22'),
      username: process.env.SFTP_USERNAME,
      password: process.env.SFTP_PASSWORD
    });

    console.log('Connected to SFTP');
    const rootFiles = await sftp.list('.');
    console.log('Root Files:', rootFiles.map(f => f.name));

    const pagesExists = await sftp.exists('pages');
    console.log('Pages folder exists:', pagesExists);

    if (pagesExists) {
        const pagesFiles = await sftp.list('pages');
        console.log('Files in pages (first 5):', pagesFiles.slice(0, 5).map(f => f.name));
    }

    await sftp.end();
  } catch (err) {
    console.error('SFTP Check Error:', err);
  }
}

checkSftp();
