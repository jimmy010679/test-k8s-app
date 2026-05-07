export const dynamic = 'force-dynamic';

import pool from '@/lib/db';

import styles from "./page.module.css";

async function fetchDbStatus() {
  const client = await pool.connect();
  try {
    // 簡單測試連線是否成功
    const result = await client.query('SELECT NOW() as current_time');
    return result.rows[0].current_time;
  } catch (err) {
    console.error('數據庫查詢錯誤', err);
    return '連線失敗';
  } finally {
    client.release(); // 務必釋放連線
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
