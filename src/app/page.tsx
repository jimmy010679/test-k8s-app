export const dynamic = 'force-dynamic';

import sql from '@/lib/db';

import styles from "./page.module.css";

async function fetchDbStatus() {
  try {
    const result = await sql`SELECT NOW()`; 
    return result[0].now;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('API Error:', error.message);
    } else {
      console.error('發生未知錯誤:', error);
    }
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
