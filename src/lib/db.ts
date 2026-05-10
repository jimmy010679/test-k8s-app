import postgres from 'postgres';
import fs from 'fs';

let sql: ReturnType<typeof postgres> | null = null;

const getDatabasePassword = () => {
  const path = process.env.DB_PASSWORD_PATH || '/var/secrets/db-password.txt';
  
  try {
    if (fs.existsSync(path)) {
      console.log(`[Database] 🚀 從掛載文件讀取密碼: ${path}`);
      return fs.readFileSync(path, 'utf8').trim();
    }
  } catch (err) {
    console.error('[Database] ❌ 讀取密碼文件異常:', err);
  }

  // 如果文件不存在，則讀取環境變量（適用於本地 .env.local）
  if (process.env.DB_PASSWORD) {
    console.log('[Database] 💻 檢測到掛載文件不存在，使用環境變量 DB_PASSWORD');
    return process.env.DB_PASSWORD;
  }

  console.warn('[Database] ⚠️ 未找到任何有效的密碼配置');
  return '';
};

export const getSql = () => {
  if (!sql) {
    console.log("[Database] 正在初始化 postgres 連接池... (運行時觸發)");
    
    const dbPassword = getDatabasePassword();

    sql = postgres({
      host: process.env.DB_HOST,           
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,       
      username: process.env.DB_USER,       
      password: dbPassword, 
      max: 20,                             
      idle_timeout: 30,                    
      connect_timeout: 5,                  
    });
    
    console.log("[Database] postgres 連接池初始化完成");
  }
  return sql;
};