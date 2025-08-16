import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/api';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const BACKEND_URL = getApiUrl();

export async function POST(request: NextRequest) {
  try {
    const emailData = await request.json();
    
    // Forward cookies from the request
    const cookies = request.headers.get('cookie');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (cookies) {
      headers['Cookie'] = cookies;
    }

    const response = await fetch(`${BACKEND_URL}/api/admin/emails/send`, {
      method: 'POST',
      headers,
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Backend responded with status: ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send email' }, 
      { status: 500 }
    );
  }
}
