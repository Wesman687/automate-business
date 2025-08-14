import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/api';

const BACKEND_URL = getApiUrl();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/appointments?${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const appointments = await response.json();
    return NextResponse.json(appointments);

  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
    }

    const appointmentData = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/appointments`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Backend responded with status: ${response.status}`);
    }

    const newAppointment = await response.json();
    return NextResponse.json(newAppointment);

  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create appointment' }, 
      { status: 500 }
    );
  }
}
