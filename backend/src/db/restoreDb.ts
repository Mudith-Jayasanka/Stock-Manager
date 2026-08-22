import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { connectionString, databaseMode } from '../config/database';

async function restoreDb() {
  if (databaseMode !== 'development') {
    console.error(`❌ ERROR: DB restore can only be executed in 'development' mode. Current mode: ${databaseMode}`);
    process.exit(1);
  }

  const snapshotFile = path.join(__dirname, 'snapshots', 'stable_snapshot.json');
  if (!fs.existsSync(snapshotFile)) {
    console.error(`❌ ERROR: Snapshot file not found at: ${snapshotFile}`);
    console.error(`Please run 'npm run db:snapshot:dev' first to create a baseline snapshot.`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(snapshotFile, 'utf-8');
  const snapshotData: Record<string, any[]> = JSON.parse(rawData);

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('Connected to development database for restore...');

    // Foreign key topological insert order
    const tableOrder = [
      'container_types',
      'fragrances',
      'wax_types',
      'products',
      'customers',
      'label_templates',
      'product_fragrances',
      'product_waxes',
      'orders',
      'order_items',
      'customer_audit_log',
    ];

    // Truncate existing tables safely
    console.log('Clearing existing data from development database...');
    const tablesToTruncate = tableOrder.filter(t => snapshotData[t] !== undefined);
    if (tablesToTruncate.length > 0) {
      await client.query(`TRUNCATE TABLE ${tablesToTruncate.join(', ')} CASCADE`);
    }

    // Insert rows table by table
    for (const table of tableOrder) {
      const rows = snapshotData[table];
      if (!rows || rows.length === 0) {
        console.log(`  - Table '${table}': 0 rows restored`);
        continue;
      }

      const columns = Object.keys(rows[0]);
      const colNamesStr = columns.map(c => `"${c}"`).join(', ');

      for (const row of rows) {
        const values = columns.map(c => {
          const val = row[c];
          if (typeof val === 'object' && val !== null) {
            return JSON.stringify(val);
          }
          return val;
        });
        const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(', ');
        const insertQuery = `INSERT INTO ${table} (${colNamesStr}) VALUES (${placeholders})`;

        await client.query(insertQuery, values);
      }

      console.log(`  ✓ Table '${table}': Restored ${rows.length} rows`);
    }

    console.log(`\n✅ Development database successfully restored from snapshot!`);
  } catch (err) {
    console.error('❌ Error during restore execution:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

restoreDb();
