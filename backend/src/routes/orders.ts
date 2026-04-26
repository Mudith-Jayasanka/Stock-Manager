import { Router, Request, Response } from 'express';
import { query } from '../db';
import { Order, OrderStatus, Customer } from '../types';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const VALID_STATUSES: OrderStatus[] = ['pending', 'making', 'packaging', 'dispatched', 'delivered', 'cancelled'];

// ── Utility: sanitize phone number ────────────────────────────────────────────
function sanitizePhone(phone: string): string {
  return phone.replace(/[\s\-().+]/g, '');
}

// ── Utility: enrich order with customer and product details ───────────────────
async function enrichOrder(orderRow: any) {
  // Fetch Customer
  const custRes = await query('SELECT * FROM customers WHERE id = $1', [orderRow.customer_id]);
  let customer = null;
  if (custRes.rows.length > 0) {
    const c = custRes.rows[0];
    customer = {
      id: c.id, phone: c.phone, fullName: c.full_name, email: c.email, address: c.address, createdAt: c.created_at.toISOString()
    };
  }

  // Fetch Items
  const itemsRes = await query(`
    SELECT oi.quantity, p.id, p.name, p.price, p.cost, p.weight_grams, p.container_type_id, p.created_at,
           ct.name as container_type_name
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    LEFT JOIN container_types ct ON p.container_type_id = ct.id
    WHERE oi.order_id = $1
  `, [orderRow.id]);

  const items = itemsRes.rows.map(row => ({
    productId: row.id,
    quantity: row.quantity,
    product: {
      id: row.id,
      name: row.name,
      price: row.price,
      cost: row.cost,
      weightGrams: row.weight_grams,
      containerTypeId: row.container_type_id,
      containerTypeName: row.container_type_name || 'Unknown',
      createdAt: row.created_at.toISOString()
    }
  }));

  return {
    id: orderRow.id,
    customerId: orderRow.customer_id,
    status: orderRow.status,
    createdAt: orderRow.created_at.toISOString(),
    customer,
    items
  };
}

// ─── List Orders ──────────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status } = req.query as { status?: OrderStatus };
    let result;
    if (status) {
      result = await query('SELECT * FROM orders WHERE status = $1 ORDER BY created_at DESC', [status]);
    } else {
      result = await query('SELECT * FROM orders ORDER BY created_at DESC');
    }
    
    const enriched = await Promise.all(result.rows.map(enrichOrder));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Get Single Order ─────────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }
    const enriched = await enrichOrder(result.rows[0]);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Create Order ─────────────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body as {
      customer: Omit<Customer, 'id' | 'createdAt'>;
      items: { productId: string; quantity: number }[];
    };

    if (!body.items || body.items.length === 0) {
      res.status(400).json({ error: 'An order must contain at least one item.' });
      return;
    }

    const sanitizedPhone = sanitizePhone(body.customer.phone);
    
    // START TRANSACTION (simulate with single queries or let it be for now, simple approach)
    let customerId;
    const existingCust = await query('SELECT * FROM customers WHERE phone = $1', [sanitizedPhone]);
    
    if (existingCust.rows.length > 0) {
      customerId = existingCust.rows[0].id;
      await query(
        'UPDATE customers SET full_name = $1, email = $2, address = $3 WHERE id = $4',
        [body.customer.fullName, body.customer.email, body.customer.address, customerId]
      );
    } else {
      customerId = `cust-${uuidv4()}`;
      await query(
        'INSERT INTO customers (id, phone, full_name, email, address) VALUES ($1, $2, $3, $4, $5)',
        [customerId, sanitizedPhone, body.customer.fullName, body.customer.email, body.customer.address]
      );
    }

    // Validate products exist
    for (const item of body.items) {
      const pRes = await query('SELECT id FROM products WHERE id = $1', [item.productId]);
      if (pRes.rows.length === 0) {
        res.status(400).json({ error: `Product not found: ${item.productId}` });
        return;
      }
    }

    const orderId = `ord-${uuidv4()}`;
    const orderResult = await query(
      'INSERT INTO orders (id, customer_id, status) VALUES ($1, $2, $3) RETURNING *',
      [orderId, customerId, 'pending']
    );

    for (const item of body.items) {
      await query(
        'INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)',
        [orderId, item.productId, item.quantity]
      );
    }

    const enriched = await enrichOrder(orderResult.rows[0]);
    res.status(201).json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Update Order Status ──────────────────────────────────────────────────────
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body as { status: OrderStatus };
    if (!VALID_STATUSES.includes(status)) {
      res.status(400).json({ error: `Invalid status. Valid values: ${VALID_STATUSES.join(', ')}` });
      return;
    }
    const result = await query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }
    const enriched = await enrichOrder(result.rows[0]);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
