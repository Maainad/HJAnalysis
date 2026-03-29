/**
 * Check for NULL or 0 update_date values in analyzed_demand
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkNullDates() {
  const client = await pool.connect();

  try {
    // Check how many rows have NULL or 0 update_date
    const nullCount = await client.query(`
      SELECT COUNT(*) as count
      FROM analyzed_demand
      WHERE update_date IS NULL OR update_date = 0
    `);

    console.log('Rows with NULL or 0 update_date:', nullCount.rows[0].count);

    // Check total rows
    const totalCount = await client.query(`
      SELECT COUNT(*) as count
      FROM analyzed_demand
    `);

    console.log('Total rows:', totalCount.rows[0].count);

    // Sample some rows with NULL/0 update_date
    const sample = await client.query(`
      SELECT post_id, title, update_date
      FROM analyzed_demand
      WHERE update_date IS NULL OR update_date = 0
      LIMIT 5
    `);

    console.log('\nSample rows with NULL/0 update_date:');
    sample.rows.forEach(row => {
      console.log(`- post_id: ${row.post_id}, update_date: ${row.update_date}`);
    });

    // Check if these posts exist in posts table with update_date
    if (sample.rows.length > 0) {
      const postId = sample.rows[0].post_id;
      const postCheck = await client.query(`
        SELECT id, update_date
        FROM posts
        WHERE id::text = $1
      `, [postId]);

      console.log(`\nChecking posts table for post_id ${postId}:`);
      if (postCheck.rows.length > 0) {
        console.log('Found in posts table, update_date:', postCheck.rows[0].update_date);
      } else {
        console.log('NOT found in posts table');
      }
    }

  } catch (error) {
    console.error('Query failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkNullDates();
