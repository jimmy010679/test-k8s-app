import { NextResponse } from 'next/server';
import { register } from '@/lib/metrics';

export const dynamic = 'force-dynamic'; // 確保每次都執行，不被快取

export async function GET() {
  try {
    const metrics = await register.metrics();
    
    // 返回 Prometheus 要求的純文字格式，並設置正確的 Content-Type
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': register.contentType, // 通常為 text/plain; version=0.0.4
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (err) {
    console.error('[Prometheus] 指標生成失敗:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}