import { Router, Request, Response } from 'express';
import { query } from '../db';
import { Product } from '../types';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ── Utility: fetch fragrances for a product
async function fetchFragrances(productId: string) {
  const res = await query(`
    SELECT pf.fragrance_id, pf.percentage, f.name
    FROM product_fragrances pf
    JOIN fragrances f ON pf.fragrance_id = f.id
    WHERE pf.product_id = $1
  `, [productId]);
  
  return res.rows.map(r => ({
    fragranceId: r.fragrance_id,
    percentage: r.percentage,
    fragranceName: r.name
  }));
}

// ── Utility: enrich product
async function enrichProduct(productRow: any) {
  const ctRes = await query('SELECT name FROM container_types WHERE id = $1', [productRow.container_type_id]);
  const containerTypeName = ctRes.rows.length > 0 ? ctRes.rows[0].name : 'Unknown';
  
  const fragrances = await fetchFragrances(productRow.id);
  
  return {
    id: productRow.id,
    name: productRow.name,
    price: productRow.price,
    cost: productRow.cost,
    weightGrams: productRow.weight_grams,
    containerTypeId: productRow.container_type_id,
    createdAt: productRow.created_at.toISOString(),
    profit: productRow.price - productRow.cost,
    containerTypeName,
    fragranceDetails: fragrances,
    fragrances: fragrances.map(f => ({ fragranceId: f.fragranceId, percentage: f.percentage }))
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
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Create Product ───────────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body as Omit<Product, 'id' | 'createdAt'>;

    const total = body.fragrances.reduce((sum, f) => sum + f.percentage, 0);
    if (Math.round(total) !== 100) {
      res.status(400).json({ error: `Fragrance percentages must sum to 100. Got: ${total}` });
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

    const newId = `prod-${uuidv4()}`;
    const result = await query(
      'INSERT INTO products (id, name, price, cost, weight_grams, container_type_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [newId, body.name, body.price, body.cost, body.weightGrams, body.containerTypeId]
    );

    for (const f of body.fragrances) {
      await query(
        'INSERT INTO product_fragrances (product_id, fragrance_id, percentage) VALUES ($1, $2, $3)',
        [newId, f.fragranceId, f.percentage]
      );
    }

    const enriched = await enrichProduct(result.rows[0]);
    res.status(201).json(enriched);
  } catch (err) {
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

    const result = await query(
      'UPDATE products SET name = $1, price = $2, cost = $3, weight_grams = $4, container_type_id = $5 WHERE id = $6 RETURNING *',
      [newName, newPrice, newCost, newWeight, newContainerTypeId, req.params.id]
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

    const enriched = await enrichProduct(result.rows[0]);
    res.json(enriched);
  } catch (err) {
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
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
