import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');
  if (!path) {
    return new NextResponse('Missing path', { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_THUMBNAIL_API;
  const url = `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return new NextResponse('Thumbnail not found', { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const body = await response.arrayBuffer();

    // Do NOT pass response.headers directly; construct clean headers
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return new NextResponse('Failed to fetch thumbnail', { status: 500 });
  }
}