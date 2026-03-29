/**
 * Database Setup Script
 *
 * Creates the analyzed_demand table if it doesn't exist
 * Run with: node scripts/setup-db.js
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Database connection using connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createTableSQL = `
  -- Create analyzed_demand table
  CREATE TABLE IF NOT EXISTS analyzed_demand (
    id SERIAL PRIMARY KEY,
    post_id VARCHAR(255) NOT NULL UNIQUE,
    author_name VARCHAR(255),
    title TEXT NOT NULL,
    category VARCHAR(255) NOT NULL,
    sub_category VARCHAR(255),
    confidence_score INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    reasoning TEXT,
    is_new_category BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    analyzed_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  -- Create indexes for better query performance
  CREATE INDEX IF NOT EXISTS idx_analyzed_demand_post_id ON analyzed_demand(post_id);
  CREATE INDEX IF NOT EXISTS idx_analyzed_demand_category ON analyzed_demand(category);
  CREATE INDEX IF NOT EXISTS idx_analyzed_demand_created_at ON analyzed_demand(created_at DESC);
`;

async function setupDatabase() {
  const client = await pool.connect();

  try {
    console.log('Setting up database...\n');
    console.log('Creating analyzed_demand table...');

    await client.query(createTableSQL);

    console.log('✓ Table created successfully!');
    console.log('✓ Indexes created successfully!');

    // Verify the table exists
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'analyzed_demand'
    `);

    if (result.rows.length > 0) {
      console.log('\n✓ Database setup complete!');
      console.log('  Table "analyzed_demand" is ready to use.\n');
    } else {
      console.error('\n✗ Table creation verification failed!');
    }

  } catch (error) {
    console.error('\n✗ Error setting up database:', error.message);
    console.error('\nPlease check:');
    console.error('  - Your DATABASE_URL in .env.local is correct');
    console.error('  - PostgreSQL is running');
    console.error('  - The database exists');
    console.error('  - You have permission to create tables');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the setup
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('Setup script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup script failed:', error);
      process.exit(1);
    });
}

module.exports = { setupDatabase };
