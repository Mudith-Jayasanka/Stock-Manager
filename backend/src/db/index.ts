import { Pool } from 'pg';

const connectionString = 'postgresql://neondb_owner:npg_hIguoSkMAc16@ep-fragrant-dawn-aoe2l8ts.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
export default pool;
