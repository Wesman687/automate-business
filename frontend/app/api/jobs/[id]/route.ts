import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://server.stream-lineai.com'
  : 'https://server.stream-lineai.com';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/jobs/${params.id}`, {
      method: 'GET',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Job GET API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${API_BASE_URL}/api/jobs/${params.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Job PUT API Error:', error);
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/jobs/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Job DELETE API Error:', error);
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
}
