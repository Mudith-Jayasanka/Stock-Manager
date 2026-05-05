import { Pool } from 'pg';
import { connectionString, databaseMode } from '../config/database';

const pool = new Pool({
  connectionString,
});

console.log(`Database mode: ${databaseMode}`);

export const query = (text: string, params?: any[]) => pool.query(text, params);
export default pool;
