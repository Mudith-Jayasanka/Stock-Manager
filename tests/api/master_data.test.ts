import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { query } from '../../backend/src/db';
import { randomUUID } from 'node:crypto';

describe('FEAT-003: Master Data Verification Suite', () => {
  let testWaxId: string;
  let testFragranceId: string;
  let testContainerId: string;

  before(async () => {
    testWaxId = `wt-test-${randomUUID()}`;
    testFragranceId = `fr-test-${randomUUID()}`;
    testContainerId = `ct-test-${randomUUID()}`;
  });

  after(async () => {
    await query('DELETE FROM wax_types WHERE id = $1', [testWaxId]);
    await query('DELETE FROM fragrances WHERE id = $1', [testFragranceId]);
    await query('DELETE FROM container_types WHERE id = $1', [testContainerId]);
  });

  test('1. Create Master Data Items (Wax, Fragrance, Container)', async () => {
    // Insert Wax
    await query('INSERT INTO wax_types (id, name, unit_cost, is_active) VALUES ($1, $2, $3, $4)', [testWaxId, 'Test Coconut Soy Wax', 2.5, true]);
    const waxRes = await query('SELECT * FROM wax_types WHERE id = $1', [testWaxId]);
    assert.equal(waxRes.rows.length, 1);
    assert.equal(waxRes.rows[0].name, 'Test Coconut Soy Wax');
    assert.equal(parseFloat(waxRes.rows[0].unit_cost), 2.5);

    // Insert Fragrance
    await query('INSERT INTO fragrances (id, name, unit_cost, is_active) VALUES ($1, $2, $3, $4)', [testFragranceId, 'Test Lavender Bliss', 15, true]);
    const fragRes = await query('SELECT * FROM fragrances WHERE id = $1', [testFragranceId]);
    assert.equal(fragRes.rows.length, 1);
    assert.equal(fragRes.rows[0].name, 'Test Lavender Bliss');

    // Insert Container
    await query('INSERT INTO container_types (id, name, unit_cost, is_active) VALUES ($1, $2, $3, $4)', [testContainerId, 'Test Amber Jar 250ml', 120, true]);
    const ctRes = await query('SELECT * FROM container_types WHERE id = $1', [testContainerId]);
    assert.equal(ctRes.rows.length, 1);
    assert.equal(ctRes.rows[0].name, 'Test Amber Jar 250ml');
  });

  test('2. Toggle Active/Inactive status for master data items', async () => {
    // Deactivate
    await query('UPDATE wax_types SET is_active = false WHERE id = $1', [testWaxId]);
    const inactiveRes = await query('SELECT is_active FROM wax_types WHERE id = $1', [testWaxId]);
    assert.equal(inactiveRes.rows[0].is_active, false);

    // Reactivate
    await query('UPDATE wax_types SET is_active = true WHERE id = $1', [testWaxId]);
    const activeRes = await query('SELECT is_active FROM wax_types WHERE id = $1', [testWaxId]);
    assert.equal(activeRes.rows[0].is_active, true);
  });

  test('3. Verify Unit Cost Updates', async () => {
    await query('UPDATE fragrances SET unit_cost = $1 WHERE id = $2', [18.5, testFragranceId]);
    const updatedFrag = await query('SELECT unit_cost FROM fragrances WHERE id = $1', [testFragranceId]);
    assert.equal(parseFloat(updatedFrag.rows[0].unit_cost), 18.5);
  });
});

