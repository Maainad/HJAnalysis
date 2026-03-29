import { NextResponse } from 'next/server';
import pool from '@/lib/db';

/**
 * GET /api/last-update
 *
 * Returns the timestamp of the last analyzed post
 */
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT MAX(analyzed_at) as last_update
      FROM analyzed_demand
    `);

    const lastUpdate = result.rows[0].last_update;

    return NextResponse.json({
      lastUpdate: lastUpdate ? new Date(lastUpdate).toISOString() : null
    });

  } catch (error) {
    console.error('Error fetching last update:', error);
    return NextResponse.json(
      { error: 'Failed to fetch last update' },
      { status: 500 }
    );
  }
}
