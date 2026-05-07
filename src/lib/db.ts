import postgres from 'postgres';
import fs from 'fs';


const getPassword = (): string => {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return 'build_placeholder';
  }

  try {
    const path = process.env.DB_PASSWORD_PATH || '/var/secrets/db-password.txt';
    if (fs.existsSync(path)) {
      // 讀取並強制執行 .trim() 確保密碼純淨
      const content = fs.readFileSync(path, 'utf8').trim();
      return content;
    }
    console.error(`[Database] 未找到密碼文件路徑: ${path}`);
  } catch (err) {
    console.error('[Database] 密碼文件讀取異常:', err);
  }
  return '';
};


let sql: ReturnType<typeof postgres> | null = null;

export const getSql = () => {
  if (!sql) {
    sql = postgres({
      host: process.env.DB_HOST,           // 10.10.0.2 
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,       // test_k8s_app_main 
      username: process.env.DB_USER,       // app_runner 
      password: getPassword(),             // 呼叫上述防禦邏輯
      
      // 連接池配置
      max: 20,                             // 最大連接數
      idle_timeout: 30,                    // 閒置連線釋放時間 (秒)
      connect_timeout: 5,                  // 連線超時時間 (秒)
      
      // 非生產環境下開啟查詢日誌
      debug: process.env.NODE_ENV !== 'production'
    });
  }
  return sql;
};