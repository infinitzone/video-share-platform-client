// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4444";

export async function POST(request: NextRequest) {
  console.log('Register API called');
  
  try {
    const body = await request.json();
    console.log('Request body:', body);

    const { username, email, password, display_name } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email and password are required' },
        { status: 400 }
      );
    }

    console.log('Calling server API:', `${API_URL}/user/register`);
    
    const response = await fetch(`${API_URL}/user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ username, email, password, display_name }),
    });

    console.log('Server response status:', response.status);

    const data = await response.json();
    console.log('Server response data:', data);

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Registration failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}