import { Pool } from 'pg';

declare global {
  var pgPool: Pool | undefined;
  var __metrics_registry__: Registry | undefined;
}

export {};