import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookies = request.headers.get('cookie');
    
    // Use environment-aware backend URL
    const backendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://server.stream-lineai.com' 
      : 'http://localhost:8005';
    
    console.log(`🔍 API Route calling: ${backendUrl}/auth/verify`);
    console.log(`🍪 Forwarding cookies: ${cookies}`);
    
    const response = await fetch(`${backendUrl}/auth/verify`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookies && { 'Cookie': cookies }),
      },
    });

    console.log(`📡 Backend response status: ${response.status}`);

    if (!response.ok) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}
