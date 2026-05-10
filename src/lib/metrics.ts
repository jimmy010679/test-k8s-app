import { Registry, collectDefaultMetrics } from 'prom-client';

const register = global.__metrics_registry__ || new Registry();

if (process.env.NODE_ENV !== 'production') {
  global.__metrics_registry__ = register;
}

// 自動收集 Node.js 預設指標 (例如：CPU 使用率、記憶體分配、Event Loop 延遲等)
collectDefaultMetrics({ register });

// 如果您未來需要自定義指標（如資料庫查詢計數），可以在此定義並導出
// export const dbQueryCounter = new Counter({
//   name: 'db_queries_total',
//   help: 'Total number of database queries',
//   registers: [register],
// });

export { register };