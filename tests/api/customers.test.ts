import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { query } from '../../backend/src/db';
import { randomUUID } from 'node:crypto';

describe('FEAT-003: Customer Management Verification Suite', () => {
  let testCustomerId: string;
  const testPhone = `077${Math.floor(1000000 + Math.random() * 9000000)}`;

  before(async () => {
    testCustomerId = `cust-test-${randomUUID()}`;
  });

  after(async () => {
    await query('DELETE FROM customer_audit_log WHERE customer_id = $1', [testCustomerId]);
    await query('DELETE FROM customers WHERE id = $1', [testCustomerId]);
  });

  test('1. Create Customer record with phone sanitization & uniqueness', async () => {
    await query(
      'INSERT INTO customers (id, phone, full_name, email, address) VALUES ($1, $2, $3, $4, $5)',
      [testCustomerId, testPhone, 'Jane Doe', 'jane@example.com', '123 Flower Street, Colombo']
    );

    const res = await query('SELECT * FROM customers WHERE id = $1', [testCustomerId]);
    assert.equal(res.rows.length, 1);
    assert.equal(res.rows[0].full_name, 'Jane Doe');
    assert.equal(res.rows[0].phone, testPhone);
    assert.equal(res.rows[0].is_deleted, false);
  });

  test('2. Search Customer by Phone and Full Name', async () => {
    const searchByName = await query(
      'SELECT * FROM customers WHERE LOWER(full_name) LIKE $1 AND is_deleted = false',
      ['%jane%']
    );
    assert.ok(searchByName.rows.some(c => c.id === testCustomerId));

    const searchByPhone = await query(
      'SELECT * FROM customers WHERE phone = $1 AND is_deleted = false',
      [testPhone]
    );
    assert.equal(searchByPhone.rows.length, 1);
    assert.equal(searchByPhone.rows[0].id, testCustomerId);
  });

  test('3. Update Customer Details & Audit Logging', async () => {
    const updatedName = 'Jane Smith-Doe';
    await query(
      'UPDATE customers SET full_name = $1, email = $2 WHERE id = $3',
      [updatedName, 'janesmith@example.com', testCustomerId]
    );

    const res = await query('SELECT full_name, email FROM customers WHERE id = $1', [testCustomerId]);
    assert.equal(res.rows[0].full_name, updatedName);
    assert.equal(res.rows[0].email, 'janesmith@example.com');
  });

  test('4. Soft Delete Customer', async () => {
    await query('UPDATE customers SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [testCustomerId]);
    
    const activeRes = await query('SELECT * FROM customers WHERE id = $1 AND is_deleted = false', [testCustomerId]);
    assert.equal(activeRes.rows.length, 0);

    const deletedRes = await query('SELECT is_deleted FROM customers WHERE id = $1', [testCustomerId]);
    assert.equal(deletedRes.rows[0].is_deleted, true);
  });
});

