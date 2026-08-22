import { after } from 'node:test';
import pool from '../../backend/src/db';

// Import all test suites
import './products.test';
import './master_data.test';
import './customers.test';
import './orders.test';
import './labels.test';

// Cleanly close database connection pool after all test suites complete
after(async () => {
  await pool.end();
  process.exit(0);
});

