import { NextResponse } from 'next/server';
import pool from '@/lib/db';

/**
 * GET /api/post/[id]
 *
 * Returns full post details from the posts table
 * Used when a user expands a listing card
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Fetch full post details from posts table
    const result = await pool.query(
      'SELECT * FROM posts WHERE id::text = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      post: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post details' },
      { status: 500 }
    );
  }
}
