import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('🔍 API Route: /api/auth/verify called');
  
  try {
    const cookies = request.headers.get('cookie');
    console.log('🔍 API Route: Received cookies:', cookies);
    
    // Use environment-aware backend URL
    const backendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://server.stream-lineai.com' 
      : 'http://localhost:8005';
    
    console.log('🔍 API Route: Backend URL:', backendUrl);
    console.log('🔍 API Route: NODE_ENV:', process.env.NODE_ENV);
    console.log(`🔍 API Route: Calling ${backendUrl}/auth/verify`);
    
    const response = await fetch(`${backendUrl}/auth/verify`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookies && { 'Cookie': cookies }),
      },
    });

    console.log(`� API Route: Backend response status: ${response.status}`);
    console.log('🔍 API Route: Backend response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('🔍 API Route: Backend error response:', errorText);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    const data = await response.json();
    console.log('🔍 API Route: Backend success response:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('🔍 API Route: Error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}
