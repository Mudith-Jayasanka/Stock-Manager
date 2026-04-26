import { Router, Request, Response } from 'express';
import { query } from '../db';
import { ContainerType, Fragrance } from '../types';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ─── Container Types ──────────────────────────────────────────────────────────
router.get('/container-types', async (_req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT ct.*, COUNT(p.id) as usage_count
      FROM container_types ct
      LEFT JOIN products p ON ct.id = p.container_type_id
      GROUP BY ct.id
      ORDER BY ct.created_at DESC
    `);
    const mapped = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      isActive: row.is_active,
      createdAt: row.created_at.toISOString(),
      usageCount: parseInt(row.usage_count, 10)
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/container-types', async (req: Request, res: Response) => {
  try {
    const { name } = req.body as { name: string };
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Name is required.' });
      return;
    }
    const newId = `ct-${uuidv4()}`;
    const result = await query(
      'INSERT INTO container_types (id, name) VALUES ($1, $2) RETURNING *',
      [newId, name.trim()]
    );
    const row = result.rows[0];
    res.status(201).json({
      id: row.id,
      name: row.name,
      isActive: row.is_active,
      createdAt: row.created_at.toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.delete('/container-types/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    // Check usage
    const usageResult = await query('SELECT COUNT(*) as count FROM products WHERE container_type_id = $1', [id]);
    const usageCount = parseInt(usageResult.rows[0].count, 10);
    
    if (usageCount > 0) {
      await query('UPDATE container_types SET is_active = false WHERE id = $1', [id]);
      res.json({ message: `Item archived (used in ${usageCount} product(s)).`, archived: true });
    } else {
      const deleteResult = await query('DELETE FROM container_types WHERE id = $1 RETURNING id', [id]);
      if (deleteResult.rows.length === 0) {
        res.status(404).json({ error: 'Container type not found.' });
        return;
      }
      res.json({ message: 'Item deleted.', archived: false });
    }
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Fragrances ───────────────────────────────────────────────────────────────
router.get('/fragrances', async (_req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT f.*, COUNT(pf.product_id) as usage_count
      FROM fragrances f
      LEFT JOIN product_fragrances pf ON f.id = pf.fragrance_id
      GROUP BY f.id
      ORDER BY f.created_at DESC
    `);
    const mapped = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      isActive: row.is_active,
      createdAt: row.created_at.toISOString(),
      usageCount: parseInt(row.usage_count, 10)
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/fragrances', async (req: Request, res: Response) => {
  try {
    const { name } = req.body as { name: string };
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Name is required.' });
      return;
    }
    const newId = `fr-${uuidv4()}`;
    const result = await query(
      'INSERT INTO fragrances (id, name) VALUES ($1, $2) RETURNING *',
      [newId, name.trim()]
    );
    const row = result.rows[0];
    res.status(201).json({
      id: row.id,
      name: row.name,
      isActive: row.is_active,
      createdAt: row.created_at.toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.delete('/fragrances/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const usageResult = await query('SELECT COUNT(*) as count FROM product_fragrances WHERE fragrance_id = $1', [id]);
    const usageCount = parseInt(usageResult.rows[0].count, 10);
    
    if (usageCount > 0) {
      await query('UPDATE fragrances SET is_active = false WHERE id = $1', [id]);
      res.json({ message: `Item archived (used in ${usageCount} product(s)).`, archived: true });
    } else {
      const deleteResult = await query('DELETE FROM fragrances WHERE id = $1 RETURNING id', [id]);
      if (deleteResult.rows.length === 0) {
        res.status(404).json({ error: 'Fragrance not found.' });
        return;
      }
      res.json({ message: 'Item deleted.', archived: false });
    }
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
