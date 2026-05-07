import { Pool } from 'pg';
import fs from 'fs';

const getPassword = () => {
  // 優先處理構建階段，避免編譯時連線失敗
  if (process.env.NEXT_PHASE === 'phase-production-build') return 'build_placeholder';

  try {
    const path = process.env.DB_PASSWORD_PATH || '/var/secrets/db-password.txt';
    return fs.readFileSync(path, 'utf8').trim();
  } catch (err) {
    console.error('Failed to read DB password:', err);
    return '';
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