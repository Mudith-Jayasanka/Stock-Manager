import { Router, Request, Response } from 'express';
import { labelTemplates } from '../db/mockDb';
import { LabelTemplate } from '../types';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ─── List Templates ───────────────────────────────────────────────────────────
router.get('/', (_req: Request, res: Response) => {
  res.json(labelTemplates);
});

// ─── Get Single Template ──────────────────────────────────────────────────────
router.get('/:id', (req: Request, res: Response) => {
  const template = labelTemplates.find((t) => t.id === req.params.id);
  if (!template) {
    res.status(404).json({ error: 'Template not found.' });
    return;
  }
  res.json(template);
});

// ─── Create Template ──────────────────────────────────────────────────────────
router.post('/', (req: Request, res: Response) => {
  const body = req.body as Omit<LabelTemplate, 'id' | 'createdAt'>;
  if (!body.name || !body.widthMm || !body.heightMm) {
    res.status(400).json({ error: 'name, widthMm, and heightMm are required.' });
    return;
  }
  const newTemplate: LabelTemplate = {
    id: `tmpl-${uuidv4()}`,
    ...body,
    createdAt: new Date().toISOString(),
  };
  labelTemplates.push(newTemplate);
  res.status(201).json(newTemplate);
});

// ─── Update Template (Save Canvas State) ─────────────────────────────────────
router.put('/:id', (req: Request, res: Response) => {
  const idx = labelTemplates.findIndex((t) => t.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Template not found.' });
    return;
  }
  const updates = req.body as Partial<Omit<LabelTemplate, 'id' | 'createdAt'>>;
  labelTemplates[idx] = { ...labelTemplates[idx], ...updates };
  res.json(labelTemplates[idx]);
});

// ─── Delete Template ──────────────────────────────────────────────────────────
router.delete('/:id', (req: Request, res: Response) => {
  const idx = labelTemplates.findIndex((t) => t.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Template not found.' });
    return;
  }
  labelTemplates.splice(idx, 1);
  res.json({ message: 'Template deleted.' });
});

export default router;
