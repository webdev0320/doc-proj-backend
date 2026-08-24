const { Client } = require('pg');

const client = new Client({
  host: '187.127.175.170',
  port: 5432,
  database: 'appdb',
  user: 'appuser',
  password: 'doc-project0320@123',
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  console.log('Connected to Hostinger DB');

  // Check if extracted_values table exists
  const tableCheck = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'extracted_values'
    );
  `);
  console.log('Table exists:', tableCheck.rows[0].exists);

  if (!tableCheck.rows[0].exists) {
    console.log('Table does not exist - need to run migration');
    await client.end();
    return;
  }

  // Check existing records
  const count = await client.query(
    `SELECT COUNT(*) FROM extracted_values WHERE "blobId" = $1`,
    ['cmt45c5iy0001i7yxrk5bznsd']
  );
  console.log('Existing rows:', count.rows[0].count);

  // Check what pageIds exist
  const rows = await client.query(
    `SELECT "pageId", "documentName", "fieldName", "extractedValue" FROM extracted_values WHERE "blobId" = $1 LIMIT 20`,
    ['cmt45c5iy0001i7yxrk5bznsd']
  );
  console.log('Rows:', JSON.stringify(rows.rows, null, 2));

  await client.end();
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
