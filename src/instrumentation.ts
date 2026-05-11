export async function register() {
  // 確保 OTel SDK 只在 Node.js 環境中啟動 (Edge 暫不支援完整的 NodeSDK)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./instrumentation.node')
  }
}