import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/api';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const BACKEND_URL = getApiUrl();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if we're in development
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      // Return mock data for development
      return NextResponse.json({
        id: params.id,
        account: 'Development',
        from: 'dev@example.com',
        subject: 'Development Mode',
        received_date: new Date().toISOString(),
        body: 'Email functionality is only available on the production server where actual email accounts are configured.',
        preview: 'Development mode email preview',
        is_important: false
      });
    }

    const emailId = params.id;
    
    // Forward cookies from the request
    const cookies = request.headers.get('cookie');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (cookies) {
      headers['Cookie'] = cookies;
    }

    const response = await fetch(`${BACKEND_URL}/api/admin/emails/${emailId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const emailData = await response.json();
    return NextResponse.json(emailData);

  } catch (error) {
    console.error('Error fetching email details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email details' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if we're in development
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      return NextResponse.json({
        message: "Email actions are only available on the production server",
        status: "dev_mode"
      });
    }

    const emailId = params.id;
    const { action } = await request.json();
    
    // Forward cookies from the request
    const cookies = request.headers.get('cookie');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (cookies) {
      headers['Cookie'] = cookies;
    }

    let endpoint = '';
    if (action === 'mark-read') {
      endpoint = `${BACKEND_URL}/api/admin/emails/${emailId}/mark-read`;
    } else {
      throw new Error('Invalid action');
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error performing email action:', error);
    return NextResponse.json(
      { error: 'Failed to perform email action' }, 
      { status: 500 }
    );
  }
}
