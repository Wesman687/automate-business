import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://server.stream-lineai.com'
  : 'https://server.stream-lineai.com';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/api/recurring-payments${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Recurring Payments API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch recurring payments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${API_BASE_URL}/api/recurring-payments`, {
      method: 'POST',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Recurring Payments POST API Error:', error);
    return NextResponse.json({ error: 'Failed to create recurring payment' }, { status: 500 });
  }
}
