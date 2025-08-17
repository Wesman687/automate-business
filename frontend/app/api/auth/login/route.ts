import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/api';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const BACKEND_URL = getApiUrl();

export async function POST(request: NextRequest) {
  try {
    const loginData = await request.json();
    
    console.log('🔍 LOGIN API: Starting login process');
    console.log('🔍 LOGIN API: Request data:', { email: loginData.email });
    
    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    console.log('🔍 LOGIN API: Backend response status:', response.status);
    console.log('🔍 LOGIN API: Backend response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();

    if (response.ok) {
      console.log('🔍 LOGIN API: Login successful, setting up response');
      
      // Forward the response and set cookies
      const nextResponse = NextResponse.json(data);
      
      // Copy cookies from backend response to frontend response
      const setCookieHeaders = response.headers.getSetCookie(); // Get all set-cookie headers
      console.log('🔍 LOGIN API: Backend set-cookie headers:', setCookieHeaders);
      
      if (setCookieHeaders && setCookieHeaders.length > 0) {
        // Parse and set each cookie
        setCookieHeaders.forEach((cookieHeader, index) => {
          console.log(`🔍 LOGIN API: Processing cookie header ${index}:`, cookieHeader);
          
          // Extract cookie parts
          const [nameValue, ...attributes] = cookieHeader.split(';');
          const [name, value] = nameValue.split('=');
          
          if (name && value) {
            console.log(`🔍 LOGIN API: Setting cookie ${name.trim()}=${value.trim()}`);
            
            // Set cookie with modified attributes for debugging
            nextResponse.cookies.set(name.trim(), value.trim(), {
              httpOnly: false, // Make accessible to JavaScript for debugging
              secure: false,   // Disable for debugging
              sameSite: 'lax', // Use lax for debugging
              path: '/',
              maxAge: 60 * 60 * 24 // 24 hours
            });
          }
        });
      } else {
        console.log('❌ LOGIN API: No set-cookie headers from backend!');
      }
      
      console.log('🔍 LOGIN API: Response cookies being set:', nextResponse.cookies.getAll());
      return nextResponse;
    } else {
      console.log('❌ LOGIN API: Backend login failed');
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error) {
    console.error('❌ LOGIN API: Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' }, 
      { status: 500 }
    );
  }
}
