import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // 確保每次都執行，不被快取

export async function GET() {
  return new NextResponse('OK', { status: 200 });
}