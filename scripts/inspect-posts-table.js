/**
 * Inspect the posts table structure
 *
 * This script queries the database to see what columns exist in the posts table
 * Run with: node scripts/inspect-posts-table.js
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Database connection using connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function inspectPostsTable() {
  const client = await pool.connect();

  try {
    console.log('Inspecting posts table structure...\n');

    // Get column information
    const columnsQuery = `
      SELECT
        column_name,
        data_type,
        character_maximum_length,
        is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'posts'
      ORDER BY ordinal_position;
    `;

    const result = await client.query(columnsQuery);

    if (result.rows.length === 0) {
      console.log('❌ Table "posts" does not exist or has no columns!');
      return;
    }

    console.log('✓ Posts table columns:');
    console.log('='.repeat(80));
    result.rows.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const maxLength = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
      console.log(`  ${col.column_name.padEnd(30)} ${col.data_type}${maxLength.padEnd(10)} ${nullable}`);
    });
    console.log('='.repeat(80));

    // Get a sample row to see actual data
    console.log('\n\nSample row from posts table:');
    console.log('='.repeat(80));
    const sampleQuery = 'SELECT * FROM posts LIMIT 1';
    const sampleResult = await client.query(sampleQuery);

    if (sampleResult.rows.length > 0) {
      const sampleRow = sampleResult.rows[0];
      Object.keys(sampleRow).forEach(key => {
        const value = sampleRow[key];
        const displayValue = value ? String(value).substring(0, 100) : 'NULL';
        console.log(`  ${key}: ${displayValue}`);
      });
    } else {
      console.log('  No data in posts table');
    }
    console.log('='.repeat(80));

    // Count posts with مطلوب
    console.log('\n\nChecking for demand posts:');
    const countQuery = `
      SELECT COUNT(*) as count
      FROM posts
      WHERE title ILIKE '%مطلوب%'
    `;
    const countResult = await client.query(countQuery);
    console.log(`  Found ${countResult.rows[0].count} posts with "مطلوب" in title`);

  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
if (require.main === module) {
  inspectPostsTable()
    .then(() => {
      console.log('\nInspection complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nInspection failed:', error);
      process.exit(1);
    });
}

module.exports = { inspectPostsTable };
