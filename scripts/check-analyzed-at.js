/**
 * Quick script to check MAX(analyzed_at) in Unix format
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkAnalyzedAt() {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT
        MAX(analyzed_at) as last_update,
        EXTRACT(EPOCH FROM MAX(analyzed_at))::bigint as unix_timestamp
      FROM analyzed_demand
    `);

    console.log('MAX(analyzed_at) results:');
    console.log('PostgreSQL timestamp:', result.rows[0].last_update);
    console.log('Unix timestamp:', result.rows[0].unix_timestamp);
  } catch (error) {
    console.error('Query failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkAnalyzedAt();
