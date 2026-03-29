/**
 * Migration script to add sub_category column to analyzed_demand table
 *
 * Run with: node scripts/migrate-add-subcategory.js
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
    console.log('Running migration to add sub_category column...\n');

    // Add sub_category column if it doesn't exist
    console.log('Adding sub_category column...');
    await client.query(`
      ALTER TABLE analyzed_demand
      ADD COLUMN IF NOT EXISTS sub_category VARCHAR(255);
    `);
    console.log('✓ sub_category column added');

    console.log('\n✓ Migration complete!');

    // Verify the column exists
    console.log('\nVerifying table structure...');
    const result = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'analyzed_demand'
      ORDER BY ordinal_position;
    `);

    console.log('\nCurrent table structure:');
    result.rows.forEach(col => {
      const maxLength = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
      console.log(`  ${col.column_name}: ${col.data_type}${maxLength}`);
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
