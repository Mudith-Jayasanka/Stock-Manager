import {
  ContainerType,
  Fragrance,
  Product,
  Customer,
  Order,
  LabelTemplate,
} from '../types';

// ─── Master Data ─────────────────────────────────────────────────────────────
export const containerTypes: ContainerType[] = [
  { id: 'ct-1', name: 'Glass Jar (8oz)', isActive: true, createdAt: '2025-01-01T00:00:00Z' },
  { id: 'ct-2', name: 'Tin Can (4oz)', isActive: true, createdAt: '2025-01-02T00:00:00Z' },
  { id: 'ct-3', name: 'Ceramic Pot (6oz)', isActive: true, createdAt: '2025-01-03T00:00:00Z' },
  { id: 'ct-4', name: 'Travel Tin (2oz)', isActive: false, createdAt: '2025-01-04T00:00:00Z' }, // archived
];

export const fragrances: Fragrance[] = [
  { id: 'fr-1', name: 'Lavender & Vanilla', isActive: true, createdAt: '2025-01-01T00:00:00Z' },
  { id: 'fr-2', name: 'Sandalwood', isActive: true, createdAt: '2025-01-02T00:00:00Z' },
  { id: 'fr-3', name: 'Citrus Burst', isActive: true, createdAt: '2025-01-03T00:00:00Z' },
  { id: 'fr-4', name: 'Rose Garden', isActive: true, createdAt: '2025-01-04T00:00:00Z' },
  { id: 'fr-5', name: 'Ocean Breeze', isActive: true, createdAt: '2025-01-05T00:00:00Z' },
  { id: 'fr-6', name: 'Discontinued Musk', isActive: false, createdAt: '2025-01-06T00:00:00Z' }, // archived
];

// ─── Products ─────────────────────────────────────────────────────────────────
export const products: Product[] = [
  {
    id: 'prod-1',
    name: 'Lavender Dreams',
    price: 2200,
    cost: 950,
    weightGrams: 240,
    containerTypeId: 'ct-1',
    fragrances: [
      { fragranceId: 'fr-1', percentage: 70 },
      { fragranceId: 'fr-2', percentage: 30 },
    ],
    createdAt: '2025-02-01T00:00:00Z',
  },
  {
    id: 'prod-2',
    name: 'Citrus Glow',
    price: 1800,
    cost: 700,
    weightGrams: 120,
    containerTypeId: 'ct-2',
    fragrances: [
      { fragranceId: 'fr-3', percentage: 100 },
    ],
    createdAt: '2025-02-05T00:00:00Z',
  },
  {
    id: 'prod-3',
    name: 'Rose & Ocean',
    price: 2800,
    cost: 1200,
    weightGrams: 180,
    containerTypeId: 'ct-3',
    fragrances: [
      { fragranceId: 'fr-4', percentage: 60 },
      { fragranceId: 'fr-5', percentage: 40 },
    ],
    createdAt: '2025-02-10T00:00:00Z',
  },
];

// ─── Customers ────────────────────────────────────────────────────────────────
export const customers: Customer[] = [
  {
    id: 'cust-1',
    phone: '0771234567',
    fullName: 'Amara Perera',
    email: 'amara@example.com',
    address: '12 Galle Road, Colombo 03',
    createdAt: '2025-03-01T00:00:00Z',
  },
  {
    id: 'cust-2',
    phone: '0759876543',
    fullName: 'Nimal Silva',
    email: 'nimal@example.com',
    address: '45 Kandy Road, Kurunegala',
    createdAt: '2025-03-05T00:00:00Z',
  },
  {
    id: 'cust-3',
    phone: '0701122334',
    fullName: 'Dilrukshi Fernando',
    email: 'dilru@example.com',
    address: '8 Temple Street, Negombo',
    createdAt: '2025-03-10T00:00:00Z',
  },
];

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orders: Order[] = [
  {
    id: 'ord-1',
    customerId: 'cust-1',
    items: [
      { productId: 'prod-1', quantity: 2 },
      { productId: 'prod-2', quantity: 1 },
    ],
    status: 'pending',
    createdAt: '2025-04-01T08:00:00Z',
  },
  {
    id: 'ord-2',
    customerId: 'cust-2',
    items: [
      { productId: 'prod-3', quantity: 1 },
    ],
    status: 'making',
    createdAt: '2025-04-05T10:00:00Z',
  },
  {
    id: 'ord-3',
    customerId: 'cust-3',
    items: [
      { productId: 'prod-1', quantity: 1 },
      { productId: 'prod-3', quantity: 2 },
    ],
    status: 'packaging',
    createdAt: '2025-04-10T12:00:00Z',
  },
  {
    id: 'ord-4',
    customerId: 'cust-1',
    items: [
      { productId: 'prod-2', quantity: 3 },
    ],
    status: 'delivered',
    createdAt: '2025-03-20T09:00:00Z',
  },
];

// ─── Label Templates ──────────────────────────────────────────────────────────
export const labelTemplates: LabelTemplate[] = [
  {
    id: 'tmpl-1',
    name: 'Product Label (Standard)',
    widthMm: 100,
    heightMm: 60,
    elements: [
      {
        id: 'el-1', type: 'text', x: 10, y: 8, width: 200, height: 30, zIndex: 1,
        content: 'Handcrafted Candle', fontSize: 18, fontFamily: 'Arial', bold: true,
      },
      {
        id: 'el-2', type: 'variable-text', x: 10, y: 40, width: 160, height: 22, zIndex: 2,
        content: '', fontSize: 13, fontFamily: 'Arial', bold: false,
        mappedField: 'product.name',
      },
      {
        id: 'el-3', type: 'variable-barcode', x: 10, y: 70, width: 150, height: 50, zIndex: 3,
        mappedField: 'product.id',
      },
    ],
    createdAt: '2025-04-01T00:00:00Z',
  },
  {
    id: 'tmpl-2',
    name: 'Shipping Label',
    widthMm: 150,
    heightMm: 100,
    elements: [
      {
        id: 'el-4', type: 'text', x: 10, y: 8, width: 200, height: 28, zIndex: 1,
        content: 'SHIP TO:', fontSize: 12, fontFamily: 'Arial', bold: true,
      },
      {
        id: 'el-5', type: 'variable-text', x: 10, y: 38, width: 280, height: 24, zIndex: 2,
        fontSize: 16, fontFamily: 'Arial', bold: true,
        mappedField: 'order.customer.fullName',
      },
      {
        id: 'el-6', type: 'variable-text', x: 10, y: 68, width: 280, height: 20, zIndex: 3,
        fontSize: 12, fontFamily: 'Arial', bold: false,
        mappedField: 'order.customer.address',
      },
      {
        id: 'el-7', type: 'variable-text', x: 10, y: 94, width: 200, height: 20, zIndex: 4,
        fontSize: 12, fontFamily: 'Arial', bold: false,
        mappedField: 'order.customer.phone',
      },
      {
        id: 'el-8', type: 'variable-qr', x: 220, y: 30, width: 80, height: 80, zIndex: 5,
        mappedField: 'order.id',
      },
    ],
    createdAt: '2025-04-02T00:00:00Z',
  },
];
