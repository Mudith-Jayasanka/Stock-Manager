import { Router, Request, Response } from 'express';
import { query } from '../db';
import { LabelTemplate } from '../types';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ─── List Templates ───────────────────────────────────────────────────────────
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM label_templates ORDER BY created_at DESC');
    const mapped = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      widthMm: row.width_mm,
      heightMm: row.height_mm,
      elements: row.elements,
      createdAt: row.created_at.toISOString()
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Get Single Template ──────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM label_templates WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Template not found.' });
      return;
    }
    const row = result.rows[0];
    res.json({
      id: row.id,
      name: row.name,
      widthMm: row.width_mm,
      heightMm: row.height_mm,
      elements: row.elements,
      createdAt: row.created_at.toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Create Template ──────────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body as Omit<LabelTemplate, 'id' | 'createdAt'>;
    if (!body.name || !body.widthMm || !body.heightMm) {
      res.status(400).json({ error: 'name, widthMm, and heightMm are required.' });
      return;
    }
    
    const newId = `tmpl-${uuidv4()}`;
    const result = await query(
      'INSERT INTO label_templates (id, name, width_mm, height_mm, elements) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [newId, body.name, body.widthMm, body.heightMm, JSON.stringify(body.elements || [])]
    );
    const row = result.rows[0];
    res.status(201).json({
      id: row.id,
      name: row.name,
      widthMm: row.width_mm,
      heightMm: row.height_mm,
      elements: row.elements,
      createdAt: row.created_at.toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Update Template (Save Canvas State) ─────────────────────────────────────
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updates = req.body as Partial<Omit<LabelTemplate, 'id' | 'createdAt'>>;
    
    const current = await query('SELECT * FROM label_templates WHERE id = $1', [req.params.id]);
    if (current.rows.length === 0) {
      res.status(404).json({ error: 'Template not found.' });
      return;
    }
    
    const row = current.rows[0];
    const newName = updates.name ?? row.name;
    const newWidthMm = updates.widthMm ?? row.width_mm;
    const newHeightMm = updates.heightMm ?? row.height_mm;
    const newElements = updates.elements ? JSON.stringify(updates.elements) : JSON.stringify(row.elements);

    const result = await query(
      'UPDATE label_templates SET name = $1, width_mm = $2, height_mm = $3, elements = $4 WHERE id = $5 RETURNING *',
      [newName, newWidthMm, newHeightMm, newElements, req.params.id]
    );
    const updatedRow = result.rows[0];
    
    res.json({
      id: updatedRow.id,
      name: updatedRow.name,
      widthMm: updatedRow.width_mm,
      heightMm: updatedRow.height_mm,
      elements: updatedRow.elements,
      createdAt: updatedRow.created_at.toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Delete Template ──────────────────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('DELETE FROM label_templates WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Template not found.' });
      return;
    }
    res.json({ message: 'Template deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
