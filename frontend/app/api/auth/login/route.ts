import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/api';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const BACKEND_URL = getApiUrl();

export async function POST(request: NextRequest) {
  try {
    const loginData = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    const data = await response.json();

    if (response.ok) {
      // Forward the response and set cookies
      const nextResponse = NextResponse.json(data);
      
      // Copy cookies from backend response to frontend response
      const setCookieHeader = response.headers.get('set-cookie');
      if (setCookieHeader) {
        // Parse and set cookies for the frontend domain
        const cookies = setCookieHeader.split(',');
        cookies.forEach(cookie => {
          const [nameValue, ...attributes] = cookie.trim().split(';');
          const [name, value] = nameValue.split('=');
          
          if (name && value) {
            nextResponse.cookies.set({
              name: name.trim(),
              value: value.trim(),
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
            });
          }
        });
      }
      
      return nextResponse;
    } else {
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' }, 
      { status: 500 }
    );
  }
}
