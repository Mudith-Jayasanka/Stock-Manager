import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { query } from '../../backend/src/db';
import { randomUUID } from 'node:crypto';

describe('FEAT-003: Label Printing Templates Verification Suite', () => {
  let testTemplateId: string;

  before(async () => {
    testTemplateId = `tmpl-test-${randomUUID()}`;
  });

  after(async () => {
    await query('DELETE FROM label_templates WHERE id = $1', [testTemplateId]);
  });

  test('1. Create Label Printing Template with canvas elements schema', async () => {
    const elements = [
      { id: 'el-1', type: 'text', content: '{{product.name}}', x: 10, y: 10, fontSize: 16 },
      { id: 'el-2', type: 'text', content: 'Customer: {{order.customer.fullName}}', x: 10, y: 30, fontSize: 12 }
    ];

    await query(
      'INSERT INTO label_templates (id, name, width_mm, height_mm, elements) VALUES ($1, $2, $3, $4, $5)',
      [testTemplateId, 'Standard Candle Jar Label 50x50', 50, 50, JSON.stringify(elements)]
    );

    const res = await query('SELECT * FROM label_templates WHERE id = $1', [testTemplateId]);
    assert.equal(res.rows.length, 1);
    assert.equal(res.rows[0].name, 'Standard Candle Jar Label 50x50');
    assert.equal(res.rows[0].width_mm, 50);
    assert.equal(res.rows[0].height_mm, 50);
    
    const parsedElements = typeof res.rows[0].elements === 'string' ? JSON.parse(res.rows[0].elements) : res.rows[0].elements;
    assert.equal(parsedElements.length, 2);
    assert.equal(parsedElements[0].content, '{{product.name}}');
  });

  test('2. Update Label Template elements & canvas dimensions', async () => {
    const updatedElements = [
      { id: 'el-1', type: 'text', content: '{{product.name}}', x: 15, y: 15, fontSize: 18 },
      { id: 'el-3', type: 'barcode', content: '{{order.id}}', x: 15, y: 40 }
    ];

    await query(
      'UPDATE label_templates SET name = $1, width_mm = $2, height_mm = $3, elements = $4 WHERE id = $5',
      ['Updated Candle Label 60x60', 60, 60, JSON.stringify(updatedElements), testTemplateId]
    );

    const res = await query('SELECT * FROM label_templates WHERE id = $1', [testTemplateId]);
    assert.equal(res.rows[0].name, 'Updated Candle Label 60x60');
    assert.equal(res.rows[0].width_mm, 60);

    const parsedElements = typeof res.rows[0].elements === 'string' ? JSON.parse(res.rows[0].elements) : res.rows[0].elements;
    assert.equal(parsedElements.length, 2);
    assert.equal(parsedElements[1].type, 'barcode');
  });

  test('3. Variable Mapping Resolution Logic', async () => {
    // Test template variable interpolation logic
    const context = {
      product: { name: 'Vanilla Deluxe Candle', price: 2800 },
      order: { id: 'ord-101', customer: { fullName: 'Alice Cooper' } }
    };

    function resolvePlaceholders(templateStr: string, ctx: any): string {
      return templateStr.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, path) => {
        const parts = path.split('.');
        let curr = ctx;
        for (const part of parts) {
          if (curr && typeof curr === 'object' && part in curr) {
            curr = curr[part];
          } else {
            return '';
          }
        }
        return String(curr);
      });
    }

    const resolvedProduct = resolvePlaceholders('Product: {{product.name}}', context);
    const resolvedCustomer = resolvePlaceholders('Name: {{order.customer.fullName}}', context);
    const resolvedPrice = resolvePlaceholders('Price: Rs. {{product.price}}', context);

    assert.equal(resolvedProduct, 'Product: Vanilla Deluxe Candle');
    assert.equal(resolvedCustomer, 'Name: Alice Cooper');
    assert.equal(resolvedPrice, 'Price: Rs. 2800');
  });
});

