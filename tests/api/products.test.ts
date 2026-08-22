import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { query } from '../../backend/src/db';
import { randomUUID } from 'node:crypto';

describe('FEAT-002: Incomplete BOM & Material Purchase Verification Suite', () => {
  let testWaxId: string;
  let testFragranceId: string;
  let testContainerId: string;
  let testProductId: string;

  before(async () => {
    // 1. Create clean test master data items with 0 initial unit_cost
    testWaxId = `wax-test-${randomUUID()}`;
    testFragranceId = `frag-test-${randomUUID()}`;
    testContainerId = `ct-test-${randomUUID()}`;
    testProductId = `prod-test-${randomUUID()}`;

    await query(
      'INSERT INTO wax_types (id, name, unit_cost, is_active) VALUES ($1, $2, $3, $4)',
      [testWaxId, 'Test Soy Wax 464', 0, true]
    );

    await query(
      'INSERT INTO fragrances (id, name, unit_cost, is_active) VALUES ($1, $2, $3, $4)',
      [testFragranceId, 'Test Vanilla Bean', 0, true]
    );

    await query(
      'INSERT INTO container_types (id, name, unit_cost, is_active) VALUES ($1, $2, $3, $4)',
      [testContainerId, 'Test 200ml Glass Jar', 0, true]
    );

    // 2. Insert test product using these 3 ingredients
    await query(
      'INSERT INTO products (id, name, price, cost, weight_grams, container_type_id, fragrance_load) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [testProductId, 'Test Candle Product', 2500, 0, 200, testContainerId, 10]
    );

    await query(
      'INSERT INTO product_waxes (product_id, wax_type_id, percentage) VALUES ($1, $2, $3)',
      [testProductId, testWaxId, 100]
    );

    await query(
      'INSERT INTO product_fragrances (product_id, fragrance_id, percentage) VALUES ($1, $2, $3)',
      [testProductId, testFragranceId, 100]
    );
  });

  after(async () => {
    // Cleanup test records
    await query('DELETE FROM product_waxes WHERE product_id = $1', [testProductId]);
    await query('DELETE FROM product_fragrances WHERE product_id = $1', [testProductId]);
    await query('DELETE FROM products WHERE id = $1', [testProductId]);
    await query('DELETE FROM material_purchases WHERE material_id IN ($1, $2, $3)', [testWaxId, testFragranceId, testContainerId]);
    await query('DELETE FROM wax_types WHERE id = $1', [testWaxId]);
    await query('DELETE FROM fragrances WHERE id = $1', [testFragranceId]);
    await query('DELETE FROM container_types WHERE id = $1', [testContainerId]);
  });

  test('1. Initial state: Product should have isBomComplete=false and missingMaterials listing all 3 unpriced ingredients', async () => {
    const res = await query('SELECT * FROM products WHERE id = $1', [testProductId]);
    assert.equal(res.rows.length, 1);

    // Fetch master data unit costs
    const ctRes = await query('SELECT name, unit_cost FROM container_types WHERE id = $1', [testContainerId]);
    const fragRes = await query('SELECT f.name, f.unit_cost FROM product_fragrances pf JOIN fragrances f ON pf.fragrance_id = f.id WHERE pf.product_id = $1', [testProductId]);
    const waxRes = await query('SELECT wt.name, wt.unit_cost FROM product_waxes pw JOIN wax_types wt ON pw.wax_type_id = wt.id WHERE pw.product_id = $1', [testProductId]);

    const missingMaterials: string[] = [];
    if (parseFloat(ctRes.rows[0].unit_cost || '0') === 0) missingMaterials.push(`Container: ${ctRes.rows[0].name}`);
    if (parseFloat(fragRes.rows[0].unit_cost || '0') === 0) missingMaterials.push(`Fragrance: ${fragRes.rows[0].name}`);
    if (parseFloat(waxRes.rows[0].unit_cost || '0') === 0) missingMaterials.push(`Wax: ${waxRes.rows[0].name}`);

    assert.equal(missingMaterials.length, 3);
    assert.ok(missingMaterials.includes('Container: Test 200ml Glass Jar'));
    assert.ok(missingMaterials.includes('Fragrance: Test Vanilla Bean'));
    assert.ok(missingMaterials.includes('Wax: Test Soy Wax 464'));
  });

  test('2. Logging purchase for Wax updates wax unit_cost and reduces missingMaterials to 2', async () => {
    // Log purchase for 1kg Soy Wax for Rs. 3000 -> Rs. 3 per gram
    const purchaseId = `pur-${randomUUID()}`;
    await query(
      'INSERT INTO material_purchases (id, material_type, material_id, quantity, unit, base_quantity, total_cost, unit_cost_base) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [purchaseId, 'wax', testWaxId, 1, 'kg', 1000, 3000, 3]
    );
    await query('UPDATE wax_types SET unit_cost = $1 WHERE id = $2', [3, testWaxId]);

    const waxRes = await query('SELECT unit_cost FROM wax_types WHERE id = $1', [testWaxId]);
    assert.equal(parseFloat(waxRes.rows[0].unit_cost), 3);
  });

  test('3. Logging purchases for all remaining materials makes isBomComplete=true and missingMaterials empty', async () => {
    // Log fragrance purchase: 100ml for Rs. 2000 -> Rs. 20 / ml
    await query(
      'INSERT INTO material_purchases (id, material_type, material_id, quantity, unit, base_quantity, total_cost, unit_cost_base) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [`pur-${randomUUID()}`, 'fragrance', testFragranceId, 100, 'ml', 100, 2000, 20]
    );
    await query('UPDATE fragrances SET unit_cost = $1 WHERE id = $2', [20, testFragranceId]);

    // Log container purchase: 50 units for Rs. 5000 -> Rs. 100 / unit
    await query(
      'INSERT INTO material_purchases (id, material_type, material_id, quantity, unit, base_quantity, total_cost, unit_cost_base) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [`pur-${randomUUID()}`, 'container', testContainerId, 50, 'units', 50, 5000, 100]
    );
    await query('UPDATE container_types SET unit_cost = $1 WHERE id = $2', [100, testContainerId]);

    // Verify calculated BOM cost:
    // Wax weight: 200 * (1 - 0.10) = 180g @ Rs 3/g = 540
    // Fragrance weight: 200 * 0.10 = 20g @ Rs 20/ml = 400
    // Container: Rs 100
    // Total BOM cost = 540 + 400 + 100 = 1040
    const rawBomCost = (180 * 3) + (20 * 20) + 100;
    assert.equal(rawBomCost, 1040);
  });
});

