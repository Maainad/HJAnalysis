/**
 * Migration script to add update_date column to analyzed_demand table
 * and populate it from the posts table
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrateUpdateDate() {
  const client = await pool.connect();

  try {
    console.log('Starting migration: Adding update_date column...\n');

    // Add update_date column if it doesn't exist
    await client.query(`
      ALTER TABLE analyzed_demand
      ADD COLUMN IF NOT EXISTS update_date BIGINT
    `);
    console.log('✓ Column added (or already exists)');

    // Populate update_date from posts table for existing rows
    const result = await client.query(`
      UPDATE analyzed_demand ad
      SET update_date = p.update_date
      FROM posts p
      WHERE ad.post_id = p.id::text
      AND ad.update_date IS NULL
    `);

    console.log(`✓ Updated ${result.rowCount} rows with update_date from posts table`);

    console.log('\nMigration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

migrateUpdateDate();
