// src/app/api/feed/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const cursor = searchParams.get('cursor') || '';

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  // Build the URL for the real backend
  const url = new URL(`${API_BASE}/video/fetch/feed`);
  url.searchParams.set('limit', String(Math.min(limit, 50)));
  if (cursor) url.searchParams.set('cursor', cursor);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend error ${response.status}: ${errorText}`);
    }
    const data = await response.json();

    // Forward the exact response (videos, nextCursor, hasMore)
    return NextResponse.json(data);
  } catch (error) {
    console.error('Feed proxy error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch feed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}