export const dynamic = 'force-dynamic';

import { getSql } from '@/lib/db';

import styles from "./page.module.css";

async function fetchDbStatus() {
  try {
    const sql = getSql();
    const result = await sql`SELECT NOW()`; 
    return result[0].now.toLocaleString(); 
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('數據庫請求異常:', errorMessage);
    return "error";
  }
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
