import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { query } from '../../backend/src/db';
import { randomUUID } from 'node:crypto';

describe('FEAT-003: Orders & Inventory Lifecycle Verification Suite', () => {
  let testCustomerId: string;
  let testContainerId: string;
  let testProductId: string;
  let testOrderId: string;
  const testPhone = `071${Math.floor(1000000 + Math.random() * 9000000)}`;

  before(async () => {
    testCustomerId = `cust-ord-${randomUUID()}`;
    testContainerId = `ct-ord-${randomUUID()}`;
    testProductId = `prod-ord-${randomUUID()}`;
    testOrderId = `ord-test-${randomUUID()}`;

    // Setup customer
    await query(
      'INSERT INTO customers (id, phone, full_name, email, address) VALUES ($1, $2, $3, $4, $5)',
      [testCustomerId, testPhone, 'Order Test User', 'ordertest@example.com', '456 Market St, Kandy']
    );

    // Setup container
    await query(
      'INSERT INTO container_types (id, name, unit_cost, is_active) VALUES ($1, $2, $3, $4)',
      [testContainerId, 'Order Test Container', 150, true]
    );

    // Setup product
    await query(
      'INSERT INTO products (id, name, price, cost, weight_grams, container_type_id, fragrance_load) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [testProductId, 'Order Test Candle', 3500, 1200, 250, testContainerId, 8]
    );
  });

  after(async () => {
    await query('DELETE FROM order_items WHERE order_id = $1', [testOrderId]);
    await query('DELETE FROM orders WHERE id = $1', [testOrderId]);
    await query('DELETE FROM products WHERE id = $1', [testProductId]);
    await query('DELETE FROM container_types WHERE id = $1', [testContainerId]);
    await query('DELETE FROM customers WHERE id = $1', [testCustomerId]);
  });

  test('1. Create Order with line items', async () => {
    await query(
      'INSERT INTO orders (id, customer_id, status) VALUES ($1, $2, $3)',
      [testOrderId, testCustomerId, 'pending']
    );

    await query(
      'INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)',
      [testOrderId, testProductId, 2]
    );

    const orderRes = await query('SELECT * FROM orders WHERE id = $1', [testOrderId]);
    assert.equal(orderRes.rows.length, 1);
    assert.equal(orderRes.rows[0].status, 'pending');

    const itemRes = await query('SELECT * FROM order_items WHERE order_id = $1', [testOrderId]);
    assert.equal(itemRes.rows.length, 1);
    assert.equal(itemRes.rows[0].quantity, 2);
  });

  test('2. Progress Order Status Lifecycle (pending -> making -> packaging -> dispatched -> delivered)', async () => {
    const statuses = ['making', 'packaging', 'dispatched', 'delivered'];

    for (const status of statuses) {
      await query('UPDATE orders SET status = $1 WHERE id = $2', [status, testOrderId]);
      const res = await query('SELECT status FROM orders WHERE id = $1', [testOrderId]);
      assert.equal(res.rows[0].status, status);
    }
  });

  test('3. Calculate Order Totals & Revenue Rollup', async () => {
    const res = await query(`
      SELECT SUM(oi.quantity * p.price) as total_revenue,
             SUM(oi.quantity * p.cost) as total_cost
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [testOrderId]);

    const revenue = parseFloat(res.rows[0].total_revenue);
    const cost = parseFloat(res.rows[0].total_cost);
    const profit = revenue - cost;

    assert.equal(revenue, 7000); // 2 * 3500
    assert.equal(cost, 2400);    // 2 * 1200
    assert.equal(profit, 4600);
  });

  test('4. Cancel Order with Cancellation Reason', async () => {
    const cancelReason = 'Customer changed mind';
    await query(
      'UPDATE orders SET status = $1, cancel_reason = $2 WHERE id = $3',
      ['cancelled', cancelReason, testOrderId]
    );

    const res = await query('SELECT status, cancel_reason FROM orders WHERE id = $1', [testOrderId]);
    assert.equal(res.rows[0].status, 'cancelled');
    assert.equal(res.rows[0].cancel_reason, cancelReason);
  });
});

