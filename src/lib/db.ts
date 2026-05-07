import { Pool } from 'pg';
import fs from 'fs';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';

const getPassword = (): string => {
  if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) {
    console.log('Build階段');
    return "build_placeholder";
  }

  const passwordPath = process.env.DB_PASSWORD_PATH || '/var/secrets/db-password.txt';

  if (fs.existsSync(passwordPath)) {
    return fs.readFileSync(passwordPath, 'utf8').trim();
  }

  console.error(`[DB] 密碼檔案異常：找不到資料庫密碼檔案 ${passwordPath}`);

  throw new Error(`[DB] 密碼檔案異常：找不到資料庫密碼檔案 ${passwordPath}`);
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