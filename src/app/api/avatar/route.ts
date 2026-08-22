// src/app/api/avatar/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path) {
      return new NextResponse("Path is required", { status: 400 });
    }

    const backendUrl = process.env.NEXT_PUBLIC_AVATAR_API;
    const targetUrl = `${backendUrl}${path.startsWith("/") ? "" : "/"}${path}`;

    const response = await fetch(targetUrl);

    if (!response.ok) {
      return new NextResponse("Avatar not found", { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "image/jpg";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error: any) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}