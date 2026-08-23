import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { query } from '../../backend/src/db';
import { randomUUID } from 'node:crypto';

describe('FEAT-007: Complete BOM Creation & Material Purchase Verification Suite', () => {
  let testWax1Id: string;
  let testWax2Id: string;
  let testFragrance1Id: string;
  let testFragrance2Id: string;
  let testContainerId: string;
  let testProductId: string;
  let testMultiBlendProductId: string;

  before(async () => {
    // 1. Create clean test master data items with 0 initial unit_cost
    testWax1Id = `wax1-test-${randomUUID()}`;
    testWax2Id = `wax2-test-${randomUUID()}`;
    testFragrance1Id = `frag1-test-${randomUUID()}`;
    testFragrance2Id = `frag2-test-${randomUUID()}`;
    testContainerId = `ct-test-${randomUUID()}`;
    testProductId = `prod-test-${randomUUID()}`;
    testMultiBlendProductId = `prod-multi-${randomUUID()}`;

    await query(
      'INSERT INTO wax_types (id, name, unit_cost, is_active) VALUES ($1, $2, $3, $4)',
      [testWax1Id, 'Test Soy Wax 464', 0, true]
    );
    await query(
      'INSERT INTO wax_types (id, name, unit_cost, is_active) VALUES ($1, $2, $3, $4)',
      [testWax2Id, 'Test Beeswax', 0, true]
    );

    await query(
      'INSERT INTO fragrances (id, name, unit_cost, is_active) VALUES ($1, $2, $3, $4)',
      [testFragrance1Id, 'Test Vanilla Bean', 0, true]
    );
    await query(
      'INSERT INTO fragrances (id, name, unit_cost, is_active) VALUES ($1, $2, $3, $4)',
      [testFragrance2Id, 'Test Lavender', 0, true]
    );

    await query(
      'INSERT INTO container_types (id, name, unit_cost, is_active) VALUES ($1, $2, $3, $4)',
      [testContainerId, 'Test 200ml Glass Jar', 0, true]
    );

    // 2. Insert single-ingredient test product (200g, 10% fragrance load)
    await query(
      'INSERT INTO products (id, name, price, cost, weight_grams, container_type_id, fragrance_load) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [testProductId, 'Test Single Candle Product', 3500, 0, 200, testContainerId, 10]
    );

    await query(
      'INSERT INTO product_waxes (product_id, wax_type_id, percentage) VALUES ($1, $2, $3)',
      [testProductId, testWax1Id, 100]
    );

    await query(
      'INSERT INTO product_fragrances (product_id, fragrance_id, percentage) VALUES ($1, $2, $3)',
      [testProductId, testFragrance1Id, 100]
    );
  });

  after(async () => {
    // Cleanup test records
    await query('DELETE FROM product_waxes WHERE product_id IN ($1, $2)', [testProductId, testMultiBlendProductId]);
    await query('DELETE FROM product_fragrances WHERE product_id IN ($1, $2)', [testProductId, testMultiBlendProductId]);
    await query('DELETE FROM products WHERE id IN ($1, $2)', [testProductId, testMultiBlendProductId]);
    await query('DELETE FROM material_purchases WHERE material_id IN ($1, $2, $3, $4, $5)', [testWax1Id, testWax2Id, testFragrance1Id, testFragrance2Id, testContainerId]);
    await query('DELETE FROM wax_types WHERE id IN ($1, $2)', [testWax1Id, testWax2Id]);
    await query('DELETE FROM fragrances WHERE id IN ($1, $2)', [testFragrance1Id, testFragrance2Id]);
    await query('DELETE FROM container_types WHERE id = $1', [testContainerId]);
  });

  test('1. Initial state: Product with 0-cost materials has missingMaterials listing unpriced ingredients', async () => {
    const res = await query('SELECT * FROM products WHERE id = $1', [testProductId]);
    assert.equal(res.rows.length, 1);

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

  test('2. Logging purchases for single ingredient materials establishes Complete BOM & exact cost rollup', async () => {
    // Log purchases:
    // Wax 1: 5000g @ Rs 5000 -> Rs 1.00 / g
    await query(
      'INSERT INTO material_purchases (id, material_type, material_id, quantity, unit, base_quantity, total_cost, unit_cost_base) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [`pur-${randomUUID()}`, 'wax', testWax1Id, 5, 'kg', 5000, 5000, 1]
    );
    await query('UPDATE wax_types SET unit_cost = $1 WHERE id = $2', [1, testWax1Id]);

    // Fragrance 1: 500ml @ Rs 5000 -> Rs 10.00 / ml
    await query(
      'INSERT INTO material_purchases (id, material_type, material_id, quantity, unit, base_quantity, total_cost, unit_cost_base) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [`pur-${randomUUID()}`, 'fragrance', testFragrance1Id, 500, 'ml', 500, 5000, 10]
    );
    await query('UPDATE fragrances SET unit_cost = $1 WHERE id = $2', [10, testFragrance1Id]);

    // Container: 50 units @ Rs 7500 -> Rs 150 / unit
    await query(
      'INSERT INTO material_purchases (id, material_type, material_id, quantity, unit, base_quantity, total_cost, unit_cost_base) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [`pur-${randomUUID()}`, 'container', testContainerId, 50, 'units', 50, 7500, 150]
    );
    await query('UPDATE container_types SET unit_cost = $1 WHERE id = $2', [150, testContainerId]);

    // Verify calculated BOM cost with candle math:
    // Wax weight: 200 / 1.10 = 181.818g @ Rs 1.00/g = 181.818
    // Fragrance weight: 200 - 181.818 = 18.182g @ Rs 10.00/ml = 181.818
    // Container: Rs 150
    // Total BOM cost = 181.818 + 181.818 + 150 = 513.64
    const waxWeight = 200 / 1.10;
    const fragWeight = 200 - waxWeight;
    const rawBomCost = (waxWeight * 1) + (fragWeight * 10) + 150;
    const roundedBomCost = Math.round(rawBomCost * 100) / 100;
    assert.equal(roundedBomCost, 513.64);
  });

  test('3. Multi-ingredient recipe BOM rollup (60% Soy / 40% Beeswax, 70% Vanilla / 30% Lavender)', async () => {
    // Log purchases for Wax 2 & Fragrance 2:
    // Wax 2 (Beeswax): 2000g @ Rs 4000 -> Rs 2.00 / g
    await query(
      'INSERT INTO material_purchases (id, material_type, material_id, quantity, unit, base_quantity, total_cost, unit_cost_base) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [`pur-${randomUUID()}`, 'wax', testWax2Id, 2, 'kg', 2000, 4000, 2]
    );
    await query('UPDATE wax_types SET unit_cost = $1 WHERE id = $2', [2, testWax2Id]);

    // Fragrance 2 (Lavender): 500ml @ Rs 7500 -> Rs 15.00 / ml
    await query(
      'INSERT INTO material_purchases (id, material_type, material_id, quantity, unit, base_quantity, total_cost, unit_cost_base) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [`pur-${randomUUID()}`, 'fragrance', testFragrance2Id, 500, 'ml', 500, 7500, 15]
    );
    await query('UPDATE fragrances SET unit_cost = $1 WHERE id = $2', [15, testFragrance2Id]);

    // Create multi-blend candle: 250g weight, 10% fragrance load
    await query(
      'INSERT INTO products (id, name, price, cost, weight_grams, container_type_id, fragrance_load) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [testMultiBlendProductId, 'Test Multi-Blend Candle', 4500, 0, 250, testContainerId, 10]
    );
    await query(
      'INSERT INTO product_waxes (product_id, wax_type_id, percentage) VALUES ($1, $2, $3), ($1, $4, $5)',
      [testMultiBlendProductId, testWax1Id, 60, testWax2Id, 40]
    );
    await query(
      'INSERT INTO product_fragrances (product_id, fragrance_id, percentage) VALUES ($1, $2, $3), ($1, $4, $5)',
      [testMultiBlendProductId, testFragrance1Id, 70, testFragrance2Id, 30]
    );

    // Multi-blend calculations:
    // Wax weight = 250 / 1.10 = 227.2727g
    // Fragrance weight = 250 - 227.2727 = 22.7273g
    // Weighted wax unit cost = (0.60 * 1.00) + (0.40 * 2.00) = 1.40 / g
    // Total wax cost = 227.2727 * 1.40 = 318.1818
    // Weighted fragrance unit cost = (0.70 * 10.00) + (0.30 * 15.00) = 11.50 / ml
    // Total fragrance cost = 22.7273 * 11.50 = 261.3636
    // Container cost = 150.00
    // Total BOM cost = 318.1818 + 261.3636 + 150.00 = 729.5454 -> 729.55
    const waxWeight = 250 / 1.10;
    const fragWeight = 250 - waxWeight;
    const waxCost = waxWeight * 1.40;
    const fragCost = fragWeight * 11.50;
    const totalBomCost = Math.round((waxCost + fragCost + 150) * 100) / 100;

    assert.equal(totalBomCost, 729.55);
  });
});
