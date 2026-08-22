import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("video_id");
    const cursor = searchParams.get("cursor");
    const limit = searchParams.get("limit") || "20";

    if (!videoId) {
      return NextResponse.json(
        { error: "video_id is required" },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:4444";
    const targetUrl = new URL(`${backendUrl}/video/comments`);
    targetUrl.searchParams.set("video_id", videoId);
    targetUrl.searchParams.set("limit", limit);
    if (cursor) targetUrl.searchParams.set("cursor", cursor);

    const response = await fetch(targetUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 0 }, // Disable static caching for real-time comments
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Failed to fetch comments" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}