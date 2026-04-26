import { Router, Request, Response } from 'express';
import { customers } from '../db/mockDb';
import { Customer } from '../types';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ── Utility: sanitize phone number ────────────────────────────────────────────
function sanitizePhone(phone: string): string {
  return phone.replace(/[\s\-().+]/g, '');
}

// ─── Omni-Search Customers ────────────────────────────────────────────────────
router.get('/search', (req: Request, res: Response) => {
  const { q } = req.query as { q?: string };
  if (!q || !q.trim()) {
    res.json([]);
    return;
  }
  const query = q.toLowerCase();
  const results = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.phone.includes(query) ||
      c.address.toLowerCase().includes(query),
  );
  res.json(results);
});

// ─── List All Customers ───────────────────────────────────────────────────────
router.get('/', (_req: Request, res: Response) => {
  res.json(customers);
});

// ─── Get Single Customer ──────────────────────────────────────────────────────
router.get('/:id', (req: Request, res: Response) => {
  const customer = customers.find((c) => c.id === req.params.id);
  if (!customer) {
    res.status(404).json({ error: 'Customer not found.' });
    return;
  }
  res.json(customer);
});

// ─── Create Customer ──────────────────────────────────────────────────────────
router.post('/', (req: Request, res: Response) => {
  const body = req.body as Omit<Customer, 'id' | 'createdAt'>;
  const sanitizedPhone = sanitizePhone(body.phone);

  const existing = customers.find((c) => c.phone === sanitizedPhone);
  if (existing) {
    res.status(409).json({ error: 'A customer with this phone number already exists.', customer: existing });
    return;
  }

  const newCustomer: Customer = {
    id: `cust-${uuidv4()}`,
    ...body,
    phone: sanitizedPhone,
    createdAt: new Date().toISOString(),
  };
  customers.push(newCustomer);
  res.status(201).json(newCustomer);
});

// ─── Update Customer ──────────────────────────────────────────────────────────
router.put('/:id', (req: Request, res: Response) => {
  const idx = customers.findIndex((c) => c.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Customer not found.' });
    return;
  }
  const updates = req.body as Partial<Omit<Customer, 'id' | 'createdAt'>>;
  if (updates.phone) updates.phone = sanitizePhone(updates.phone);
  customers[idx] = { ...customers[idx], ...updates };
  res.json(customers[idx]);
});

export default router;
