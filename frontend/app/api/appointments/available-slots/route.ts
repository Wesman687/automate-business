import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/api';

const BACKEND_URL = getApiUrl();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/appointments/available-slots?date=${date}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const availableSlots = await response.json();
    return NextResponse.json(availableSlots);

  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available slots' }, 
      { status: 500 }
    );
  }
}
