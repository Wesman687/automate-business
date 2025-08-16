import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/api';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const BACKEND_URL = getApiUrl();

export async function GET(request: NextRequest) {
  try {
    // Check if we're in development
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      // Return mock data for development
      return NextResponse.json({
        emails: [],
        count: 0,
        message: "Email functionality is only available on the production server"
      });
    }

    // Forward cookies from the request
    const cookies = request.headers.get('cookie');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (cookies) {
      headers['Cookie'] = cookies;
    }

    const response = await fetch(`${BACKEND_URL}/api/admin/emails/unread`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const emailData = await response.json();
    return NextResponse.json(emailData);

  } catch (error) {
    console.error('Error fetching unread emails:', error);
    return NextResponse.json(
      { 
        emails: [], 
        count: 0, 
        error: 'Failed to fetch unread emails',
        message: 'Email functionality requires production server access'
      }, 
      { status: 500 }
    );
  }
}
