import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4444";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ action: string[] }> }
) {
  try {
    const { action } = await params;
    const actionPath = action ? action.join("/") : "";
    const searchParams = request.nextUrl.search;
    const authHeader = request.headers.get("authorization");

    const response = await fetch(
      `${BACKEND_URL}/video/activity/${actionPath}${searchParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Proxy error in GET:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string[] }> }
) {
  try {
    const { action } = await params;
    const actionPath = action ? action.join("/") : "";
    const body = await request.json().catch(() => ({}));
    const authHeader = request.headers.get("authorization");

    const response = await fetch(`${BACKEND_URL}/video/activity/${actionPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Proxy error in POST:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ action: string[] }> }
) {
  try {
    const { action } = await params;
    const actionPath = action ? action.join("/") : "";
    const body = await request.json().catch(() => ({}));
    const authHeader = request.headers.get("authorization");

    const response = await fetch(`${BACKEND_URL}/video/activity/${actionPath}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Proxy error in DELETE:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}