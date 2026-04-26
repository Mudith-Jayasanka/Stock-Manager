import { Router, Request, Response } from 'express';
import { orders, customers, products } from '../db/mockDb';
import { Order, OrderStatus, Customer } from '../types';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const VALID_STATUSES: OrderStatus[] = ['pending', 'making', 'packaging', 'dispatched', 'delivered', 'cancelled'];

// ── Utility: sanitize phone number ────────────────────────────────────────────
function sanitizePhone(phone: string): string {
  return phone.replace(/[\s\-().+]/g, '');
}

// ── Utility: enrich order with customer and product details ───────────────────
function enrichOrder(order: Order) {
  const customer = customers.find((c) => c.id === order.customerId);
  const enrichedItems = order.items.map((item) => ({
    ...item,
    product: products.find((p) => p.id === item.productId),
  }));
  return { ...order, customer, items: enrichedItems };
}

// ─── List Orders ──────────────────────────────────────────────────────────────
router.get('/', (req: Request, res: Response) => {
  const { status } = req.query as { status?: OrderStatus };
  let result = status ? orders.filter((o) => o.status === status) : [...orders];
  result = result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json(result.map(enrichOrder));
});

// ─── Get Single Order ─────────────────────────────────────────────────────────
router.get('/:id', (req: Request, res: Response) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }
  res.json(enrichOrder(order));
});

// ─── Create Order ─────────────────────────────────────────────────────────────
router.post('/', (req: Request, res: Response) => {
  const body = req.body as {
    customer: Omit<Customer, 'id' | 'createdAt'>;
    items: { productId: string; quantity: number }[];
  };

  if (!body.items || body.items.length === 0) {
    res.status(400).json({ error: 'An order must contain at least one item.' });
    return;
  }

  // Resolve customer — auto-create if new phone number
  const sanitizedPhone = sanitizePhone(body.customer.phone);
  let customer = customers.find((c) => c.phone === sanitizedPhone);

  if (!customer) {
    customer = {
      id: `cust-${uuidv4()}`,
      ...body.customer,
      phone: sanitizedPhone,
      createdAt: new Date().toISOString(),
    };
    customers.push(customer);
  } else {
    // Update customer details (in case they changed)
    const idx = customers.findIndex((c) => c.id === customer!.id);
    customers[idx] = { ...customers[idx], ...body.customer, phone: sanitizedPhone };
    customer = customers[idx];
  }

  // Validate all products exist
  for (const item of body.items) {
    if (!products.find((p) => p.id === item.productId)) {
      res.status(400).json({ error: `Product not found: ${item.productId}` });
      return;
    }
  }

  const newOrder: Order = {
    id: `ord-${uuidv4()}`,
    customerId: customer.id,
    items: body.items,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  orders.push(newOrder);
  res.status(201).json(enrichOrder(newOrder));
});

// ─── Update Order Status ──────────────────────────────────────────────────────
router.patch('/:id/status', (req: Request, res: Response) => {
  const { status } = req.body as { status: OrderStatus };
  if (!VALID_STATUSES.includes(status)) {
    res.status(400).json({ error: `Invalid status. Valid values: ${VALID_STATUSES.join(', ')}` });
    return;
  }
  const idx = orders.findIndex((o) => o.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }
  orders[idx].status = status;
  res.json(enrichOrder(orders[idx]));
});

export default router;
