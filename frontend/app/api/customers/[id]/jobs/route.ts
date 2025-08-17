// Minimal route file to satisfy Next.js build
import {  NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 });
}
