import { Client } from 'pg';
import {
  containerTypes,
  fragrances,
  products,
  customers,
  orders,
  labelTemplates,
} from './mockDb';

const connectionString = 'postgresql://neondb_owner:npg_hIguoSkMAc16@ep-fragrant-dawn-aoe2l8ts.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

async function setupDb() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected to database');

    // ─── Drop existing tables (if needed to reset) ─────────────────────────
    await client.query(`
      DROP TABLE IF EXISTS order_items;
      DROP TABLE IF EXISTS orders;
      DROP TABLE IF EXISTS customers;
      DROP TABLE IF EXISTS product_fragrances;
      DROP TABLE IF EXISTS products;
      DROP TABLE IF EXISTS fragrances;
      DROP TABLE IF EXISTS container_types;
      DROP TABLE IF EXISTS label_templates;
    `);

    console.log('Dropped existing tables');

    // ─── Create Tables ────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE container_types (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE fragrances (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE products (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        price INTEGER NOT NULL,
        cost INTEGER NOT NULL,
        weight_grams INTEGER NOT NULL,
        container_type_id VARCHAR REFERENCES container_types(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE product_fragrances (
        product_id VARCHAR REFERENCES products(id),
        fragrance_id VARCHAR REFERENCES fragrances(id),
        percentage INTEGER NOT NULL,
        PRIMARY KEY (product_id, fragrance_id)
      );

      CREATE TABLE customers (
        id VARCHAR PRIMARY KEY,
        phone VARCHAR UNIQUE NOT NULL,
        full_name VARCHAR NOT NULL,
        email VARCHAR,
        address VARCHAR,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE orders (
        id VARCHAR PRIMARY KEY,
        customer_id VARCHAR REFERENCES customers(id),
        status VARCHAR NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE order_items (
        order_id VARCHAR REFERENCES orders(id),
        product_id VARCHAR REFERENCES products(id),
        quantity INTEGER NOT NULL,
        PRIMARY KEY (order_id, product_id)
      );

      CREATE TABLE label_templates (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        width_mm INTEGER NOT NULL,
        height_mm INTEGER NOT NULL,
        elements JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created tables');

    // ─── Insert Master Data ───────────────────────────────────────────────────
    for (const ct of containerTypes) {
      await client.query(
        'INSERT INTO container_types (id, name, is_active, created_at) VALUES ($1, $2, $3, $4)',
        [ct.id, ct.name, ct.isActive, ct.createdAt]
      );
    }

    for (const fr of fragrances) {
      await client.query(
        'INSERT INTO fragrances (id, name, is_active, created_at) VALUES ($1, $2, $3, $4)',
        [fr.id, fr.name, fr.isActive, fr.createdAt]
      );
    }
    console.log('Inserted master data');

    // ─── Insert Products ──────────────────────────────────────────────────────
    for (const prod of products) {
      await client.query(
        'INSERT INTO products (id, name, price, cost, weight_grams, container_type_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [prod.id, prod.name, prod.price, prod.cost, prod.weightGrams, prod.containerTypeId, prod.createdAt]
      );
      for (const fc of prod.fragrances) {
        await client.query(
          'INSERT INTO product_fragrances (product_id, fragrance_id, percentage) VALUES ($1, $2, $3)',
          [prod.id, fc.fragranceId, fc.percentage]
        );
      }
    }
    console.log('Inserted products');

    // ─── Insert Customers ─────────────────────────────────────────────────────
    for (const cust of customers) {
      await client.query(
        'INSERT INTO customers (id, phone, full_name, email, address, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [cust.id, cust.phone, cust.fullName, cust.email, cust.address, cust.createdAt]
      );
    }
    console.log('Inserted customers');

    // ─── Insert Orders ────────────────────────────────────────────────────────
    for (const ord of orders) {
      await client.query(
        'INSERT INTO orders (id, customer_id, status, created_at) VALUES ($1, $2, $3, $4)',
        [ord.id, ord.customerId, ord.status, ord.createdAt]
      );
      for (const item of ord.items) {
        await client.query(
          'INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)',
          [ord.id, item.productId, item.quantity]
        );
      }
    }
    console.log('Inserted orders');

    // ─── Insert Label Templates ───────────────────────────────────────────────
    for (const tmpl of labelTemplates) {
      await client.query(
        'INSERT INTO label_templates (id, name, width_mm, height_mm, elements, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [tmpl.id, tmpl.name, tmpl.widthMm, tmpl.heightMm, JSON.stringify(tmpl.elements), tmpl.createdAt]
      );
    }
    console.log('Inserted label templates');

    console.log('Database setup complete!');
  } catch (err) {
    console.error('Error setting up database', err);
  } finally {
    await client.end();
  }
}

setupDb();
