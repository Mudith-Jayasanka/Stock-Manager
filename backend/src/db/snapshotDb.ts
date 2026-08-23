import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { connectionString, databaseMode } from '../config/database';

async function snapshotDb() {
  if (databaseMode !== 'development') {
    console.error(`❌ ERROR: DB snapshot can only be executed in 'development' mode. Current mode: ${databaseMode}`);
    process.exit(1);
  }

  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected to development database for snapshot...');

    const tables = [
      'container_types',
      'fragrances',
      'wax_types',
      'products',
      'material_purchases',
      'product_fragrances',
      'product_waxes',
      'customers',
      'orders',
      'order_items',
      'label_templates',
      'customer_audit_log',
    ];

    const snapshotData: Record<string, any[]> = {};

    for (const table of tables) {
      try {
        const res = await client.query(`SELECT * FROM ${table}`);
        snapshotData[table] = res.rows;
        console.log(`  ✓ Dumped ${res.rows.length} rows from table '${table}'`);
      } catch (err: any) {
        if (err.code === '42P01') {
          console.warn(`  ⚠️ Table '${table}' does not exist yet. Skipping.`);
          snapshotData[table] = [];
        } else {
          throw err;
        }
      }
    }

    const snapshotDir = path.join(__dirname, 'snapshots');
    if (!fs.existsSync(snapshotDir)) {
      fs.mkdirSync(snapshotDir, { recursive: true });
    }

    const snapshotFile = path.join(snapshotDir, 'stable_snapshot.json');
    fs.writeFileSync(snapshotFile, JSON.stringify(snapshotData, null, 2), 'utf-8');

    console.log(`\n✅ Snapshot successfully created at: ${snapshotFile}`);
  } catch (err) {
    console.error('❌ Error during snapshot execution:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

snapshotDb();

