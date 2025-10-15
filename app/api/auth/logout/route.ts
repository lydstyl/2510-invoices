import { NextResponse } from 'next/server';
import { destroySession } from '@/src/infrastructure/auth/session';

export async function POST() {
  await destroySession();
  return NextResponse.json({ success: true });
}
