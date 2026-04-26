// ─── Master Data ─────────────────────────────────────────────────────────────
export interface ContainerType {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  usageCount?: number;
}

export interface Fragrance {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  usageCount?: number;
}

// ─── Products ─────────────────────────────────────────────────────────────────
export interface FragranceComposition {
  fragranceId: string;
  percentage: number;
  fragranceName?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  profit?: number;
  weightGrams: number;
  containerTypeId: string;
  containerTypeName?: string;
  fragrances: FragranceComposition[];
  createdAt: string;
}

// ─── Customers ────────────────────────────────────────────────────────────────
export interface Customer {
  id: string;
  phone: string;
  fullName: string;
  email: string;
  address: string;
  createdAt: string;
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export type OrderStatus = 'pending' | 'making' | 'packaging' | 'dispatched' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  quantity: number;
  product?: Product;
}

export interface Order {
  id: string;
  customerId: string;
  customer?: Customer;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string;
}

// ─── Label Templates ──────────────────────────────────────────────────────────
export type ElementType = 'text' | 'image' | 'variable-text' | 'variable-barcode' | 'variable-qr';

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  bold?: boolean;
  base64?: string;
  mappedField?: string;
  config?: any;
}

export interface LabelTemplate {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  elements: CanvasElement[];
  createdAt: string;
}

// ─── Available mapping fields for variable dropdowns ─────────────────────────
export const ORDER_MAPPING_FIELDS: { label: string; value: string }[] = [
  { label: 'Order ID', value: 'order.id' },
  { label: 'Customer Full Name', value: 'order.customer.fullName' },
  { label: 'Customer First Name', value: 'order.customer.firstName' },
  { label: 'Customer Last Name', value: 'order.customer.lastName' },
  { label: 'Customer Phone', value: 'order.customer.phone' },
  { label: 'Customer Email', value: 'order.customer.email' },
  { label: 'Customer Address', value: 'order.customer.address' },
  { label: 'Order Status', value: 'order.status' },
  { label: 'Order Date', value: 'order.createdAt' },
];

export const PRODUCT_MAPPING_FIELDS: { label: string; value: string }[] = [
  { label: 'Product ID', value: 'product.id' },
  { label: 'Product Name', value: 'product.name' },
  { label: 'Product Price', value: 'product.price' },
  { label: 'Product Cost', value: 'product.cost' },
  { label: 'Product Weight (g)', value: 'product.weightGrams' },
  { label: 'Container Type', value: 'product.containerTypeName' },
];

export const MAPPING_FIELDS = [...ORDER_MAPPING_FIELDS, ...PRODUCT_MAPPING_FIELDS];
