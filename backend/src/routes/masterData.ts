import { Router, Request, Response } from 'express';
import { containerTypes, fragrances, orders, products } from '../db/mockDb';
import { ContainerType, Fragrance } from '../types';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ── Utility: count usages of a container type ─────────────────────────────────
function containerUsageCount(id: string): number {
  return products.filter((p) => p.containerTypeId === id).length;
}

// ── Utility: count usages of a fragrance ─────────────────────────────────────
function fragranceUsageCount(id: string): number {
  return products.filter((p) => p.fragrances.some((f) => f.fragranceId === id)).length;
}

// ─── Container Types ──────────────────────────────────────────────────────────
router.get('/container-types', (_req: Request, res: Response) => {
  const data = containerTypes.map((ct) => ({
    ...ct,
    usageCount: containerUsageCount(ct.id),
  }));
  res.json(data);
});

router.post('/container-types', (req: Request, res: Response) => {
  const { name } = req.body as { name: string };
  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Name is required.' });
    return;
  }
  const newItem: ContainerType = {
    id: `ct-${uuidv4()}`,
    name: name.trim(),
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  containerTypes.push(newItem);
  res.status(201).json(newItem);
});

router.delete('/container-types/:id', (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const idx = containerTypes.findIndex((ct) => ct.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Container type not found.' });
    return;
  }
  const usageCount = containerUsageCount(id);
  if (usageCount > 0) {
    containerTypes[idx].isActive = false;
    res.json({ message: `Item archived (used in ${usageCount} product(s)).`, archived: true });
  } else {
    containerTypes.splice(idx, 1);
    res.json({ message: 'Item deleted.', archived: false });
  }
});

// ─── Fragrances ───────────────────────────────────────────────────────────────
router.get('/fragrances', (_req: Request, res: Response) => {
  const data = fragrances.map((fr) => ({
    ...fr,
    usageCount: fragranceUsageCount(fr.id),
  }));
  res.json(data);
});

router.post('/fragrances', (req: Request, res: Response) => {
  const { name } = req.body as { name: string };
  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Name is required.' });
    return;
  }
  const newItem: Fragrance = {
    id: `fr-${uuidv4()}`,
    name: name.trim(),
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  fragrances.push(newItem);
  res.status(201).json(newItem);
});

router.delete('/fragrances/:id', (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const idx = fragrances.findIndex((fr) => fr.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Fragrance not found.' });
    return;
  }
  const usageCount = fragranceUsageCount(id);
  if (usageCount > 0) {
    fragrances[idx].isActive = false;
    res.json({ message: `Item archived (used in ${usageCount} product(s)).`, archived: true });
  } else {
    fragrances.splice(idx, 1);
    res.json({ message: 'Item deleted.', archived: false });
  }
});

export default router;
