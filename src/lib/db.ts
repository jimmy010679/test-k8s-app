import postgres from 'postgres';
import fs from 'fs';

let sql: ReturnType<typeof postgres> | null = null;

export const getSql = () => {
  if (!sql) {
    console.log("[Database] 正在初始化 postgres 連接池... (運行時觸發)");
    
    let dbPassword = '';
    const path = process.env.DB_PASSWORD_PATH || '/var/secrets/db-password.txt';
    
    try {
      console.log(`[Database] 嘗試讀取路徑: ${path}`);
      if (fs.existsSync(path)) {
        dbPassword = fs.readFileSync(path, 'utf8').trim();
        console.log(`[Database] ✅ 讀取成功！長度: ${dbPassword.length}`);
      } else {
        console.error(`[Database] ❌ 檔案不存在: ${path}`);
      }
    } catch (err) {
      console.error('[Database] ❌ 讀取異常:', err);
    }

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