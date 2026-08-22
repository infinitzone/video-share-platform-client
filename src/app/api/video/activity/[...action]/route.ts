import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string[] }> }
) {
  try {
    const { action } = await params;
    const actionPath = action ? action.join("/") : "";
    const body = await request.json().catch(() => ({}));
    const authHeader = request.headers.get("authorization");

    const backendUrl = process.env.NEXT_PUBLIC_API_BASE;
    
    const response = await fetch(`${backendUrl}/video/activity/${actionPath}`, {
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

    const backendUrl = process.env.NEXT_PUBLIC_API_BASE;

    const response = await fetch(`${backendUrl}/video/activity/${actionPath}`, {
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

// ✅ NEW GET handler for /status and other GET endpoints
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ action: string[] }> }
) {
  try {
    const { action } = await params;
    const actionPath = action ? action.join("/") : "";
    const searchParams = request.nextUrl.searchParams;
    const authHeader = request.headers.get("authorization");

    const backendUrl = process.env.NEXT_PUBLIC_API_BASE;

    const url = `${backendUrl}/video/activity/${actionPath}?${searchParams.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

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