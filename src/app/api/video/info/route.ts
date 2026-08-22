// src/app/api/video/info/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return new NextResponse('Missing video id', { status: 400 });
  }

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
  // Fetch feed to find the video by id (adjust if you have a dedicated /video/:id endpoint)
  const feedUrl = `${API_BASE}/video/fetch/feed?limit=100`;

  try {
    const res = await fetch(feedUrl);
    if (!res.ok) throw new Error('Failed to fetch feed');
    const data = await res.json();
    const video = data.videos.find((v: any) => v.id === id);
    if (!video) {
      return new NextResponse('Video not found', { status: 404 });
    }
    return NextResponse.json(video);
  } catch (error) {
    console.error('Video info proxy error:', error);
    return new NextResponse('Failed to fetch video info', { status: 500 });
  }
}