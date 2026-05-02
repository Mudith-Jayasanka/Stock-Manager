import { Client } from 'pg';

const connectionString = 'postgresql://neondb_owner:npg_hIguoSkMAc16@ep-fragrant-dawn-aoe2l8ts.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

/**
 * DATABASE SETUP & SCHEMA MANAGEMENT
 * 
 * Purpose:
 * This script serves as the central authority for the database schema.
 * It is designed to be safe for use in production-like environments:
 * - It will NOT drop existing tables or delete data.
 * - It will NOT insert mock/test data.
 * - It uses 'IF NOT EXISTS' to ensure structural integrity without interference.
 * 
 * Usage:
 * 1. To add a new table: Add the CREATE TABLE IF NOT EXISTS statement.
 * 2. To add a column: Add an ALTER TABLE statement (check if column exists first if possible, 
 *    or handle errors gracefully).
 * 3. Always update the 'Schema Revision History' below when making changes.
 */

async function setupDb() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected to database');

    // ─── Schema Revision History ──────────────────────────────────────────────
    /*
      This section serves as the central record for the database structure.
      When modifying the schema, please add a new entry below documenting the change.
      
      Revision History:
      - 2025-01-01: Initial schema creation (Master Data, Products, Customers, Orders).
      - 2026-04-30: Added 'cancel_reason' column to 'orders' table.
      - 2026-04-30: Refactored setupDb.ts to be data-safe (removed DROP/Seed logic).
      - 2026-05-02: Added order_id_seq for human-readable sequential order IDs.
      - 2026-05-02: Added customer soft-delete fields and customer_audit_log.
    */

    // ─── Create Tables (Safe execution) ───────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS container_types (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS fragrances (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        price INTEGER NOT NULL,
        cost INTEGER NOT NULL,
        weight_grams INTEGER NOT NULL,
        container_type_id VARCHAR REFERENCES container_types(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS product_fragrances (
        product_id VARCHAR REFERENCES products(id),
        fragrance_id VARCHAR REFERENCES fragrances(id),
        percentage INTEGER NOT NULL,
        PRIMARY KEY (product_id, fragrance_id)
      );

      CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR PRIMARY KEY,
        phone VARCHAR UNIQUE NOT NULL,
        full_name VARCHAR NOT NULL,
        email VARCHAR,
        address VARCHAR,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR PRIMARY KEY,
        customer_id VARCHAR REFERENCES customers(id),
        status VARCHAR NOT NULL,
        cancel_reason VARCHAR,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS order_items (
        order_id VARCHAR REFERENCES orders(id),
        product_id VARCHAR REFERENCES products(id),
        quantity INTEGER NOT NULL,
        PRIMARY KEY (order_id, product_id)
      );

      CREATE TABLE IF NOT EXISTS label_templates (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        width_mm INTEGER NOT NULL,
        height_mm INTEGER NOT NULL,
        elements JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE SEQUENCE IF NOT EXISTS order_id_seq START 1;

      ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

      ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_phone_key;
      CREATE UNIQUE INDEX IF NOT EXISTS customers_active_phone_unique
        ON customers (phone)
        WHERE is_deleted = false;

      CREATE TABLE IF NOT EXISTS customer_audit_log (
        id VARCHAR PRIMARY KEY,
        customer_id VARCHAR NOT NULL REFERENCES customers(id),
        action VARCHAR NOT NULL,
        before_data JSONB NOT NULL,
        after_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Database schema verified (no tables dropped, no data deleted)');
    console.log('Database setup complete!');
  } catch (err) {
    console.error('Error setting up database', err);
  } finally {
    await client.end();
  }
}

setupDb();
