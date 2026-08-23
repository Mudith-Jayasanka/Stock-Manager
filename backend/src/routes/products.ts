import { Router, Request, Response } from 'express';
import { query } from '../db';
import { Product } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

const router = Router();

// ── Utility: fetch fragrances for a product
async function fetchFragrances(productId: string) {
  const res = await query(`
    SELECT pf.fragrance_id, pf.percentage, f.name, f.unit_cost
    FROM product_fragrances pf
    JOIN fragrances f ON pf.fragrance_id = f.id
    WHERE pf.product_id = $1
  `, [productId]);
  
  return res.rows.map(r => ({
    fragranceId: r.fragrance_id,
    percentage: parseFloat(r.percentage),
    fragranceName: r.name,
    unitCost: parseFloat(r.unit_cost || 0)
  }));
}

// ── Utility: fetch waxes for a product
async function fetchWaxes(productId: string) {
  const res = await query(`
    SELECT pw.wax_type_id, pw.percentage, wt.name, wt.unit_cost
    FROM product_waxes pw
    JOIN wax_types wt ON pw.wax_type_id = wt.id
    WHERE pw.product_id = $1
  `, [productId]);
  
  return res.rows.map(r => ({
    waxTypeId: r.wax_type_id,
    percentage: parseFloat(r.percentage),
    waxTypeName: r.name,
    unitCost: parseFloat(r.unit_cost || 0)
  }));
}

// ── Utility: enrich product
async function enrichProduct(productRow: any) {
  const ctRes = await query('SELECT name, unit_cost FROM container_types WHERE id = $1', [productRow.container_type_id]);
  const containerTypeName = ctRes.rows.length > 0 ? ctRes.rows[0].name : 'Unknown';
  const containerUnitCost = ctRes.rows.length > 0 ? parseFloat(ctRes.rows[0].unit_cost || 0) : 0;
  
  const fragrances = await fetchFragrances(productRow.id);
  const waxes = await fetchWaxes(productRow.id);
  
  const weightGrams = parseFloat(productRow.weight_grams || 0);
  const fragranceLoad = parseFloat(productRow.fragrance_load || 0);


  const weightedFragranceUnitCost = fragrances.reduce((sum, f) => sum + ((f.percentage / 100) * f.unitCost), 0);
  const weightedWaxUnitCost = waxes.reduce((sum, w) => sum + ((w.percentage / 100) * w.unitCost), 0);

  const fragranceCost = fragranceWeight * weightedFragranceUnitCost;
  const waxCost = waxWeight * weightedWaxUnitCost;

  const rawBomCost = fragranceCost + waxCost + containerUnitCost;
  const bomCost = rawBomCost > 0 ? Math.round(rawBomCost * 100) / 100 : parseFloat(productRow.cost || 0);

  const missingMaterials: string[] = [];
  if (containerUnitCost === 0) {
    missingMaterials.push(`Container: ${containerTypeName}`);
  }
  for (const f of fragrances) {
    if (f.unitCost === 0) {
      missingMaterials.push(`Fragrance: ${f.fragranceName || 'Unknown Fragrance'}`);
    }
  }
  for (const w of waxes) {
    if (w.unitCost === 0) {
      missingMaterials.push(`Wax: ${w.waxTypeName || 'Unknown Wax'}`);
    }
  }
  const isBomComplete = missingMaterials.length === 0;

  const price = parseFloat(productRow.price || 0);
  const effectiveCost = bomCost > 0 ? bomCost : parseFloat(productRow.cost || 0);
  const profit = price - effectiveCost;
  const profitMarginPercent = price > 0 ? Math.round((profit / price) * 1000) / 10 : 0;

  return {
    id: productRow.id,
    name: productRow.name,
    price: productRow.price,
    cost: productRow.cost, // static fallback
    bomCost, // dynamic calculated BOM cost
    isBomComplete,
    missingMaterials,
    profitMarginPercent,
    weightGrams: productRow.weight_grams,
    containerTypeId: productRow.container_type_id,
    fragranceLoad,
    createdAt: productRow.created_at.toISOString(),
    profit,
    containerTypeName,
    fragrances,
    waxes
  };
}

// ─── List Products ────────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const { sortBy } = req.query as { sortBy?: string };
    
    let result;
    if (sortBy === 'price') {
      result = await query('SELECT * FROM products ORDER BY price ASC');
    } else if (sortBy === 'profit') {
      result = await query('SELECT * FROM products ORDER BY (price - cost) ASC');
    } else if (sortBy === 'createdAt') {
      result = await query('SELECT * FROM products ORDER BY created_at ASC');
    } else {
      result = await query('SELECT * FROM products ORDER BY created_at DESC'); // default
    }
    
    const enriched = await Promise.all(result.rows.map(enrichProduct));
    res.json(enriched);
  } catch (err) {
    logger.error('Database operation failed in products route', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Get Single Product ───────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }
    const enriched = await enrichProduct(result.rows[0]);
    res.json(enriched);
  } catch (err) {
    logger.error('Database operation failed in products route', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Create Product ───────────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body as Omit<Product, 'id' | 'createdAt'>;

    const fragTotal = body.fragrances.reduce((sum, f) => sum + f.percentage, 0);
    if (Math.round(fragTotal) !== 100) {
      res.status(400).json({ error: `Fragrance percentages must sum to 100. Got: ${fragTotal}` });
      return;
    }

    const waxTotal = body.waxes.reduce((sum, w) => sum + w.percentage, 0);
    if (Math.round(waxTotal) !== 100) {
      res.status(400).json({ error: `Wax percentages must sum to 100. Got: ${waxTotal}` });
      return;
    }

    const ctRes = await query('SELECT * FROM container_types WHERE id = $1 AND is_active = true', [body.containerTypeId]);
    if (ctRes.rows.length === 0) {
      res.status(400).json({ error: 'Invalid or inactive container type.' });
      return;
    }

    for (const f of body.fragrances) {
      const frRes = await query('SELECT * FROM fragrances WHERE id = $1 AND is_active = true', [f.fragranceId]);
      if (frRes.rows.length === 0) {
        res.status(400).json({ error: `Invalid or inactive fragrance: ${f.fragranceId}` });
        return;
      }
    }

    for (const w of body.waxes) {
      const wxRes = await query('SELECT * FROM wax_types WHERE id = $1 AND is_active = true', [w.waxTypeId]);
      if (wxRes.rows.length === 0) {
        res.status(400).json({ error: `Invalid or inactive wax type: ${w.waxTypeId}` });
        return;
      }
    }

    const newId = `prod-${uuidv4()}`;
    const result = await query(
      'INSERT INTO products (id, name, price, cost, weight_grams, container_type_id, fragrance_load) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [newId, body.name, body.price, body.cost, body.weightGrams, body.containerTypeId, body.fragranceLoad]
    );

    for (const f of body.fragrances) {
      await query(
        'INSERT INTO product_fragrances (product_id, fragrance_id, percentage) VALUES ($1, $2, $3)',
        [newId, f.fragranceId, f.percentage]
      );
    }

    for (const w of body.waxes) {
      await query(
        'INSERT INTO product_waxes (product_id, wax_type_id, percentage) VALUES ($1, $2, $3)',
        [newId, w.waxTypeId, w.percentage]
      );
    }

    const enriched = await enrichProduct(result.rows[0]);
    res.status(201).json(enriched);
  } catch (err) {
    logger.error('Database operation failed in products route', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Update Product ───────────────────────────────────────────────────────────
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updates = req.body as Partial<Omit<Product, 'id' | 'createdAt'>>;
    
    if (updates.fragrances) {
      const total = updates.fragrances.reduce((sum, f) => sum + f.percentage, 0);
      if (Math.round(total) !== 100) {
        res.status(400).json({ error: `Fragrance percentages must sum to 100. Got: ${total}` });
        return;
      }
    }

    if (updates.waxes) {
      const total = updates.waxes.reduce((sum, w) => sum + w.percentage, 0);
      if (Math.round(total) !== 100) {
        res.status(400).json({ error: `Wax percentages must sum to 100. Got: ${total}` });
        return;
      }
    }

    const current = await query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (current.rows.length === 0) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }
    
    const row = current.rows[0];
    const newName = updates.name ?? row.name;
    const newPrice = updates.price ?? row.price;
    const newCost = updates.cost ?? row.cost;
    const newWeight = updates.weightGrams ?? row.weight_grams;
    const newContainerTypeId = updates.containerTypeId ?? row.container_type_id;
    const newFragranceLoad = updates.fragranceLoad ?? row.fragrance_load;

    const result = await query(
      'UPDATE products SET name = $1, price = $2, cost = $3, weight_grams = $4, container_type_id = $5, fragrance_load = $6 WHERE id = $7 RETURNING *',
      [newName, newPrice, newCost, newWeight, newContainerTypeId, newFragranceLoad, req.params.id]
    );

    if (updates.fragrances) {
      await query('DELETE FROM product_fragrances WHERE product_id = $1', [req.params.id]);
      for (const f of updates.fragrances) {
        await query(
          'INSERT INTO product_fragrances (product_id, fragrance_id, percentage) VALUES ($1, $2, $3)',
          [req.params.id, f.fragranceId, f.percentage]
        );
      }
    }

    if (updates.waxes) {
      await query('DELETE FROM product_waxes WHERE product_id = $1', [req.params.id]);
      for (const w of updates.waxes) {
        await query(
          'INSERT INTO product_waxes (product_id, wax_type_id, percentage) VALUES ($1, $2, $3)',
          [req.params.id, w.waxTypeId, w.percentage]
        );
      }
    }

    const enriched = await enrichProduct(result.rows[0]);
    res.json(enriched);
  } catch (err) {
    logger.error('Database operation failed in products route', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Delete Product ───────────────────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const usageRes = await query('SELECT COUNT(*) as count FROM order_items WHERE product_id = $1', [req.params.id]);
    if (parseInt(usageRes.rows[0].count, 10) > 0) {
      res.status(400).json({ error: 'Cannot delete product that has been ordered.' });
      return;
    }
    
    await query('DELETE FROM product_fragrances WHERE product_id = $1', [req.params.id]);
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }
    res.json({ message: 'Product deleted.' });
  } catch (err) {
    logger.error('Database operation failed in products route', err);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
