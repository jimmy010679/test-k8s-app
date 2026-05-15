export const dynamic = 'force-dynamic';
import { trace } from '@opentelemetry/api';
import { getSql } from '@/lib/db';

import styles from "./page.module.css";

async function fetchDbStatus() {
  const tracer = trace.getTracer('next-app-tracer');

  // 手動開啟一個名為 "DB: SELECT NOW" 的 Span
  return await tracer.startActiveSpan('DB: SELECT NOW', async (span) => {
    try {
      const sql = getSql();
      const result = await sql`SELECT NOW()`; 

      // tracer 標記這段追蹤為成功
      span.setStatus({ code: 1 }); // 1 = OK

      return result[0].now.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }); 
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[Database] 資料庫請求異常:', errorMessage);

      // tracer 紀錄失敗與錯誤訊息
      span.recordException(errorMessage);
      span.setStatus({ code: 2, message: errorMessage }); // 2 = ERROR

      return "error";
    } finally {
      // tracer 關閉 Span
      span.end();
    }
  });
}

export default async function Home() {
  const time = await fetchDbStatus();

  return (
    <div className={styles.page}>
      <h1>基於 IaC 與無密鑰架構的跨專案雲端自動化部署</h1>
      <p>2026/05/07</p>
      <p>當前資料庫時間：{time}</p>
    </div>
  );
}
