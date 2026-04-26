import { Router, Request, Response } from 'express';
import { products, containerTypes, fragrances } from '../db/mockDb';
import { Product } from '../types';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ─── List Products ────────────────────────────────────────────────────────────
router.get('/', (req: Request, res: Response) => {
  const { sortBy } = req.query as { sortBy?: string };
  let result = [...products];

  if (sortBy === 'price') result.sort((a, b) => a.price - b.price);
  else if (sortBy === 'profit') result.sort((a, b) => (a.price - a.cost) - (b.price - b.cost));
  else if (sortBy === 'createdAt') result.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  // Enrich with profit and names
  const enriched = result.map((p) => ({
    ...p,
    profit: p.price - p.cost,
    containerTypeName: containerTypes.find((c) => c.id === p.containerTypeId)?.name ?? 'Unknown',
    fragranceDetails: p.fragrances.map((f) => ({
      ...f,
      fragranceName: fragrances.find((fr) => fr.id === f.fragranceId)?.name ?? 'Unknown',
    })),
  }));

  res.json(enriched);
});

// ─── Get Single Product ───────────────────────────────────────────────────────
router.get('/:id', (req: Request, res: Response) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }
  res.json({
    ...product,
    profit: product.price - product.cost,
    containerTypeName: containerTypes.find((c) => c.id === product.containerTypeId)?.name,
    fragranceDetails: product.fragrances.map((f) => ({
      ...f,
      fragranceName: fragrances.find((fr) => fr.id === f.fragranceId)?.name,
    })),
  });
});

// ─── Create Product ───────────────────────────────────────────────────────────
router.post('/', (req: Request, res: Response) => {
  const body = req.body as Omit<Product, 'id' | 'createdAt'>;

  // Validate fragrance percentages sum to 100
  const total = body.fragrances.reduce((sum, f) => sum + f.percentage, 0);
  if (Math.round(total) !== 100) {
    res.status(400).json({ error: `Fragrance percentages must sum to 100. Got: ${total}` });
    return;
  }

  // Validate container exists and is active
  const container = containerTypes.find((c) => c.id === body.containerTypeId && c.isActive);
  if (!container) {
    res.status(400).json({ error: 'Invalid or inactive container type.' });
    return;
  }

  // Validate all fragrances are active
  for (const f of body.fragrances) {
    const fr = fragrances.find((fr) => fr.id === f.fragranceId && fr.isActive);
    if (!fr) {
      res.status(400).json({ error: `Invalid or inactive fragrance: ${f.fragranceId}` });
      return;
    }
  }

  const newProduct: Product = {
    id: `prod-${uuidv4()}`,
    ...body,
    createdAt: new Date().toISOString(),
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// ─── Update Product ───────────────────────────────────────────────────────────
router.put('/:id', (req: Request, res: Response) => {
  const idx = products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }
  const updates = req.body as Partial<Omit<Product, 'id' | 'createdAt'>>;

  if (updates.fragrances) {
    const total = updates.fragrances.reduce((sum, f) => sum + f.percentage, 0);
    if (Math.round(total) !== 100) {
      res.status(400).json({ error: `Fragrance percentages must sum to 100. Got: ${total}` });
      return;
    }
  }

  products[idx] = { ...products[idx], ...updates };
  res.json(products[idx]);
});

// ─── Delete Product ───────────────────────────────────────────────────────────
router.delete('/:id', (req: Request, res: Response) => {
  const idx = products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }
  products.splice(idx, 1);
  res.json({ message: 'Product deleted.' });
});

export default router;
