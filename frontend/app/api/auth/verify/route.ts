import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // TEMPORARILY DISABLED to stop cookie spam
  console.log('🚫 API Route: /api/auth/verify DISABLED - Use JWT AuthProvider instead');
  return NextResponse.json({ 
    error: 'This route is disabled. Use JWT AuthProvider instead.' 
  }, { status: 503 });
}
