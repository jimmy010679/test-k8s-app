import postgres from 'postgres';
import fs from 'fs';

/**
 * 嚴格處理密碼讀取邏輯
 */
const getPassword = (): string => {
  // 處理 Next.js 構建階段，防止編譯時報錯
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return 'build_placeholder';
  }

  try {
    const path = process.env.DB_PASSWORD_PATH || '/var/secrets/db-password.txt';
    if (fs.existsSync(path)) {
      // 讀取並強制去除換行符，確保密碼純淨
      return fs.readFileSync(path, 'utf8').trim();
    }
  } catch (err) {
    console.error('[DB] 讀取密碼檔案失敗:', err);
  }
  return '';
};

// 初始化連線配置
const sql = postgres({
  host: process.env.DB_HOST,           // 例如: 10.10.0.2 
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,       // 例如: test_k8s_app_main 
  username: process.env.DB_USER,       // 例如: app_runner 
  password: getPassword(),             // 呼叫上述讀取邏輯
  
  // postgres.js 內建強大的連線池管理
  max: 20,                             // 最大連線數
  idle_timeout: 30,                    // 閒置連線釋放時間 (秒)
  connect_timeout: 5,                  // 連線超時 (秒)
  
  // 除錯輔助：只有在非生產環境才印出查詢 (可選)
  debug: process.env.NODE_ENV !== 'production'
});

export default sql;