import postgres from 'postgres';
import fs from 'fs';

const getPassword = (): string => {
  console.log('[DB-追蹤] 開始執行 getPassword() 邏輯...');
  
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('[DB-追蹤] 檢測到構建階段，返回佔位符');
    return 'build_placeholder';
  }

  try {
    const path = process.env.DB_PASSWORD_PATH || '/var/secrets/db-password.txt';
    console.log(`[DB-追蹤] 嘗試讀取密碼文件路徑: ${path}`);
    
    if (fs.existsSync(path)) {
      const content = fs.readFileSync(path, 'utf8');
      const trimmed = content.trim();
      
      console.log(`[DB-追蹤] ✅ 密碼讀取成功！`);
      console.log(`[DB-追蹤] 原始長度: ${content.length}, Trim後長度: ${trimmed.length}`);
      console.log(`[DB-追蹤] 密碼前兩個字符: ${trimmed.substring(0, 2)}`);
      
      return trimmed;
    } else {
      console.error(`[DB-追蹤] ❌ 找不到密碼文件: ${path}`);
    }
  } catch (err) {
    console.error('[DB-追蹤] ❌ 密碼讀取異常:', err);
  }
  return '';
};

let sql: ReturnType<typeof postgres> | null = null;

export const getSql = () => {
  if (!sql) {
    console.log("[DB-追蹤] 正在初始化 postgres 連接池...");
    const dbPassword = getPassword();
    
    sql = postgres({
      host: process.env.DB_HOST,           
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,       
      username: process.env.DB_USER,       
      password: dbPassword, 
      max: 20,                             
      idle_timeout: 30,                    
      connect_timeout: 5,                  
      debug: process.env.NODE_ENV !== 'production'
    });
    console.log("[DB-追蹤] postgres 連接池初始化完成");
  }
  return sql;
};