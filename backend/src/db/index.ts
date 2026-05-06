import { Pool } from 'pg';
import { connectionString, databaseMode } from '../config/database';
import { logger } from '../utils/logger';

const pool = new Pool({
  connectionString,
});

logger.info(`Database mode: ${databaseMode}`);

export const query = async (text: string, params?: any[]) => {
  try {
    return await pool.query(text, params);
  } catch (err) {
    logger.error(`Database Query Error: ${text}`, err);
    throw err;
  }
};

export default pool;
