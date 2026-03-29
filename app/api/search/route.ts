import { NextResponse } from 'next/server';
import pool from '@/lib/db';

/**
 * GET /api/search
 *
 * Query parameters:
 * - q: Search query (searches post_id and title)
 *
 * Returns matching listings with their categories
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim() === '') {
      return NextResponse.json({
        results: [],
        count: 0
      });
    }

    // Search by post_id or title
    const result = await pool.query(`
      SELECT
        post_id,
        title,
        category,
        confidence_score,
        author_name,
        created_at
      FROM analyzed_demand
      WHERE post_id ILIKE $1 OR title ILIKE $1
      ORDER BY created_at DESC
      LIMIT 50
    `, [`%${query}%`]);

    return NextResponse.json({
      results: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    );
  }
}
