import { Pool } from 'pg';
import fs from 'fs';

const getPassword = (): string => {
  const passwordPath = process.env.DB_PASSWORD_PATH || '/var/secrets/db-password.txt';
  
  try {
    return fs.readFileSync(passwordPath, 'utf8').trim();
  } catch (error) {
    console.error(`無法讀取密碼文件於 ${passwordPath}:`, error);
    throw new Error('數據庫認證失敗：無法讀取密碼文件。');
  }
};

const pool: Pool = global.pgPool || new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432'),
  password: getPassword(),

  // 允許連線池建立的最大連線數
  max: 50,

  // 連線閒置多久後會被釋放
  idleTimeoutMillis: 30000,

  // 嘗試建立連線的最長等待時間
  connectionTimeoutMillis: 2000,
});

// 在非生產環境下，將連接池掛載到全局，防止熱重載 (Hot Reload) 導致連線數爆滿
if (process.env.NODE_ENV !== 'production') {
  global.pgPool = pool;
}

export default pool;