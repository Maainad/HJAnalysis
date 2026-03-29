import { Pool } from 'pg';

// PostgreSQL connection pool using connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test connection on first import
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;

// Helper to execute queries
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
}

// Helper to get a client from the pool (for transactions)
export async function getClient() {
  const client = await pool.connect();
  return client;
}
