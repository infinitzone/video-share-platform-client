import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');
  if (!path) {
    return new NextResponse('Missing path', { status: 400 });
  }

  const THUMBNAIL_API = process.env.THUMBNAIL_API || 'http://localhost';
  const url = `${THUMBNAIL_API}${path}`;

  try {
    const response = await fetch(url);
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    const body = await response.arrayBuffer();
    return new NextResponse(body, {
      status: response.status,
      headers,
    });
  } catch {
    return new NextResponse('Failed to fetch thumbnail', { status: 500 });
  }
}