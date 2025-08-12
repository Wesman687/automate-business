import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://server.stream-lineai.com' 
  : 'http://localhost:8005';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    
    const response = await fetch(`${API_BASE_URL}/api/sessions`, {
      headers: {
        'Authorization': token || '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
