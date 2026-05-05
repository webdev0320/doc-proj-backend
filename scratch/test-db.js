const { Client } = require('pg');
const connectionString = "postgresql://neondb_owner:npg_eOpo58VELkwY@ep-still-math-amvf1hea-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function test() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Successfully connected to Neon!');
    const res = await client.query('SELECT NOW()');
    console.log('Query result:', res.rows[0]);
  } catch (err) {
    console.error('Connection error:', err.message);
  } finally {
    await client.end();
  }
}

test();
