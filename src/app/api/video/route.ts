// src/app/api/video/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return new NextResponse('Missing video id', { status: 400 });
  }

  const VIDEO_API = process.env.VIDEO_API || 'http://localhost:4444';
  const url = `${VIDEO_API}/watch/${id}`;

  try {
    const response = await fetch(url);
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    // Return video stream without parsing as JSON
    return new NextResponse(response.body, {
      status: response.status,
      headers,
    });
  } catch {
    return new NextResponse('Failed to fetch video', { status: 500 });
  }
}