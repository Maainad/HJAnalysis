import { NextResponse } from 'next/server';
import pool from '@/lib/db';

/**
 * GET /api/categories
 *
 * Returns all demand categories with their counts
 * Used for the bar chart in the dashboard
 */
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        category,
        COUNT(*) as count
      FROM analyzed_demand
      GROUP BY category
      ORDER BY count DESC
    `);

    // Also get total count
    const totalResult = await pool.query(`
      SELECT COUNT(*) as total FROM analyzed_demand
    `);

    return NextResponse.json({
      categories: result.rows,
      total: parseInt(totalResult.rows[0].total)
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
