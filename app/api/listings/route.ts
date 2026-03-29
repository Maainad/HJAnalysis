import { NextResponse } from 'next/server';
import pool from '@/lib/db';

/**
 * GET /api/listings
 *
 * Query parameters:
 * - category: Filter by category name
 * - sortBy: 'date' (default) or 'confidence'
 * - search: Search within listings
 *
 * Returns listings from analyzed_demand table
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'date';
    const search = searchParams.get('search');

    let query = 'SELECT * FROM analyzed_demand WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    // Filter by category
    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    // Search within listings
    if (search) {
      paramCount++;
      query += ` AND (title ILIKE $${paramCount} OR post_id ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Sorting
    if (sortBy === 'date') {
      query += ' ORDER BY created_at DESC';
    } else if (sortBy === 'confidence') {
      query += ' ORDER BY confidence_score DESC';
    }

    const result = await pool.query(query, params);

    return NextResponse.json({
      listings: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}
