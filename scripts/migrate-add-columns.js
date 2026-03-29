/**
 * Migration script to add missing columns to analyzed_demand table
 *
 * Adds:
 * - reasoning TEXT
 * - is_new_category BOOLEAN
 *
 * Run with: node scripts/migrate-add-columns.js
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Database connection using connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('Running migration to add missing columns...\n');

    // Add reasoning column if it doesn't exist
    console.log('Adding reasoning column...');
    await client.query(`
      ALTER TABLE analyzed_demand
      ADD COLUMN IF NOT EXISTS reasoning TEXT;
    `);
    console.log('✓ reasoning column added');

    // Add is_new_category column if it doesn't exist
    console.log('Adding is_new_category column...');
    await client.query(`
      ALTER TABLE analyzed_demand
      ADD COLUMN IF NOT EXISTS is_new_category BOOLEAN DEFAULT false;
    `);
    console.log('✓ is_new_category column added');

    console.log('\n✓ Migration complete!');

    // Verify the columns exist
    console.log('\nVerifying table structure...');
    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'analyzed_demand'
      ORDER BY ordinal_position;
    `);

    console.log('\nCurrent table structure:');
    result.rows.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type}`);
    });

  } catch (error) {
    console.error('\n✗ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('\nMigration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nMigration failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigration };
