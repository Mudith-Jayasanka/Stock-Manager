import { Router, Request, Response } from 'express';
import pool, { query } from '../db';
import { Customer } from '../types';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ── Utility: sanitize phone number ────────────────────────────────────────────
function sanitizePhone(phone: string): string {
  return phone.replace(/[\s\-().+]/g, '');
}

function mapCustomer(row: any) {
  return {
    id: row.id,
    phone: row.phone,
    fullName: row.full_name,
    email: row.email,
    address: row.address,
    createdAt: row.created_at.toISOString()
  };
}

function customerAuditSnapshot(row: any) {
  return {
    id: row.id,
    phone: row.phone,
    fullName: row.full_name,
    email: row.email,
    address: row.address,
    createdAt: row.created_at.toISOString(),
    isDeleted: row.is_deleted ?? false,
    deletedAt: row.deleted_at ? row.deleted_at.toISOString() : null
  };
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
      WHERE is_deleted = false
        AND (
          LOWER(full_name) LIKE $1 
          OR LOWER(email) LIKE $1 
          OR phone LIKE $1 
          OR LOWER(address) LIKE $1
        )
    `, [searchParam]);
    
    const mapped = result.rows.map(mapCustomer);
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── List All Customers ───────────────────────────────────────────────────────
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM customers WHERE is_deleted = false ORDER BY created_at DESC');
    const mapped = result.rows.map(mapCustomer);
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Get Single Customer ──────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM customers WHERE id = $1 AND is_deleted = false', [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Customer not found.' });
      return;
    }
    res.json(mapCustomer(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Create Customer ──────────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body as Omit<Customer, 'id' | 'createdAt'>;
    const sanitizedPhone = sanitizePhone(body.phone);

    const existing = await query('SELECT * FROM customers WHERE phone = $1 AND is_deleted = false', [sanitizedPhone]);
    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      res.status(409).json({ 
        error: 'A customer with this phone number already exists.', 
        customer: mapCustomer(row)
      });
      return;
    }

    const newId = `cust-${uuidv4()}`;
    const result = await query(
      'INSERT INTO customers (id, phone, full_name, email, address) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [newId, sanitizedPhone, body.fullName, body.email, body.address]
    );
    const row = result.rows[0];
    
    res.status(201).json(mapCustomer(row));
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Update Customer ──────────────────────────────────────────────────────────
router.put('/:id', async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const updates = req.body as Partial<Omit<Customer, 'id' | 'createdAt'>>;
    if (updates.phone) updates.phone = sanitizePhone(updates.phone);
    
    const current = await client.query('SELECT * FROM customers WHERE id = $1 AND is_deleted = false', [req.params.id]);
    if (current.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'Customer not found.' });
      return;
    }

    const row = current.rows[0];
    const newPhone = updates.phone ?? row.phone;
    const newFullName = updates.fullName ?? row.full_name;
    const newEmail = updates.email !== undefined ? updates.email : row.email;
    const newAddress = updates.address !== undefined ? updates.address : row.address;

    const duplicate = await client.query(
      'SELECT id FROM customers WHERE phone = $1 AND id <> $2 AND is_deleted = false',
      [newPhone, req.params.id]
    );
    if (duplicate.rows.length > 0) {
      await client.query('ROLLBACK');
      res.status(409).json({ error: 'A customer with this phone number already exists.' });
      return;
    }

    const result = await client.query(
      'UPDATE customers SET phone = $1, full_name = $2, email = $3, address = $4 WHERE id = $5 RETURNING *',
      [newPhone, newFullName, newEmail, newAddress, req.params.id]
    );

    const updatedRow = result.rows[0];
    await client.query(
      'INSERT INTO customer_audit_log (id, customer_id, action, before_data, after_data) VALUES ($1, $2, $3, $4, $5)',
      [
        `caudit-${uuidv4()}`,
        req.params.id,
        'updated',
        customerAuditSnapshot(row),
        customerAuditSnapshot(updatedRow)
      ]
    );

    await client.query('COMMIT');
    res.json(mapCustomer(updatedRow));
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Database error' });
  } finally {
    client.release();
  }
});

// Soft Delete Customer
router.delete('/:id', async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const current = await client.query('SELECT * FROM customers WHERE id = $1 AND is_deleted = false', [req.params.id]);
    if (current.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'Customer not found.' });
      return;
    }

    const beforeRow = current.rows[0];
    const result = await client.query(
      'UPDATE customers SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    const deletedRow = result.rows[0];

    await client.query(
      'INSERT INTO customer_audit_log (id, customer_id, action, before_data, after_data) VALUES ($1, $2, $3, $4, $5)',
      [
        `caudit-${uuidv4()}`,
        req.params.id,
        'deleted',
        customerAuditSnapshot(beforeRow),
        customerAuditSnapshot(deletedRow)
      ]
    );

    await client.query('COMMIT');
    res.status(204).send();
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Database error' });
  } finally {
    client.release();
  }
});

export default router;
