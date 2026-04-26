import { Router, Request, Response } from 'express';
import { query } from '../db';
import { Customer } from '../types';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ── Utility: sanitize phone number ────────────────────────────────────────────
function sanitizePhone(phone: string): string {
  return phone.replace(/[\s\-().+]/g, '');
}

// ─── Omni-Search Customers ────────────────────────────────────────────────────
router.get('/search', async (req: Request, res: Response) => {
  const { q } = req.query as { q?: string };
  if (!q || !q.trim()) {
    res.json([]);
    return;
  }
  try {
    const searchParam = `%${q.toLowerCase()}%`;
    const result = await query(`
      SELECT * FROM customers 
      WHERE LOWER(full_name) LIKE $1 
         OR LOWER(email) LIKE $1 
         OR phone LIKE $1 
         OR LOWER(address) LIKE $1
    `, [searchParam]);
    
    const mapped = result.rows.map(row => ({
      id: row.id,
      phone: row.phone,
      fullName: row.full_name,
      email: row.email,
      address: row.address,
      createdAt: row.created_at.toISOString()
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── List All Customers ───────────────────────────────────────────────────────
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM customers ORDER BY created_at DESC');
    const mapped = result.rows.map(row => ({
      id: row.id,
      phone: row.phone,
      fullName: row.full_name,
      email: row.email,
      address: row.address,
      createdAt: row.created_at.toISOString()
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Get Single Customer ──────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Customer not found.' });
      return;
    }
    const row = result.rows[0];
    res.json({
      id: row.id,
      phone: row.phone,
      fullName: row.full_name,
      email: row.email,
      address: row.address,
      createdAt: row.created_at.toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Create Customer ──────────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body as Omit<Customer, 'id' | 'createdAt'>;
    const sanitizedPhone = sanitizePhone(body.phone);

    const existing = await query('SELECT * FROM customers WHERE phone = $1', [sanitizedPhone]);
    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      res.status(409).json({ 
        error: 'A customer with this phone number already exists.', 
        customer: {
          id: row.id,
          phone: row.phone,
          fullName: row.full_name,
          email: row.email,
          address: row.address,
          createdAt: row.created_at.toISOString()
        } 
      });
      return;
    }

    const newId = `cust-${uuidv4()}`;
    const result = await query(
      'INSERT INTO customers (id, phone, full_name, email, address) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [newId, sanitizedPhone, body.fullName, body.email, body.address]
    );
    const row = result.rows[0];
    
    res.status(201).json({
      id: row.id,
      phone: row.phone,
      fullName: row.full_name,
      email: row.email,
      address: row.address,
      createdAt: row.created_at.toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Update Customer ──────────────────────────────────────────────────────────
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updates = req.body as Partial<Omit<Customer, 'id' | 'createdAt'>>;
    if (updates.phone) updates.phone = sanitizePhone(updates.phone);
    
    const current = await query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
    if (current.rows.length === 0) {
      res.status(404).json({ error: 'Customer not found.' });
      return;
    }

    const row = current.rows[0];
    const newPhone = updates.phone ?? row.phone;
    const newFullName = updates.fullName ?? row.full_name;
    const newEmail = updates.email !== undefined ? updates.email : row.email;
    const newAddress = updates.address !== undefined ? updates.address : row.address;

    const result = await query(
      'UPDATE customers SET phone = $1, full_name = $2, email = $3, address = $4 WHERE id = $5 RETURNING *',
      [newPhone, newFullName, newEmail, newAddress, req.params.id]
    );
    
    const updatedRow = result.rows[0];
    res.json({
      id: updatedRow.id,
      phone: updatedRow.phone,
      fullName: updatedRow.full_name,
      email: updatedRow.email,
      address: updatedRow.address,
      createdAt: updatedRow.created_at.toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
