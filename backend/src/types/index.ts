// ─── Master Data ─────────────────────────────────────────────────────────────
export interface ContainerType {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface Fragrance {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

// ─── Products ─────────────────────────────────────────────────────────────────
export interface FragranceComposition {
  fragranceId: string;
  percentage: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  weightGrams: number;
  containerTypeId: string;
  fragrances: FragranceComposition[];
  createdAt: string;
}

// ─── Customers ────────────────────────────────────────────────────────────────
export interface Customer {
  id: string;
  phone: string; // UNIQUE lookup key — sanitized
  fullName: string;
  email: string;
  address: string;
  createdAt: string;
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'pending'
  | 'making'
  | 'packaging'
  | 'dispatched'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  status: OrderStatus;
  cancelReason?: string;
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
  // Text / Variable fields
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  bold?: boolean;
  // Image fields
  base64?: string;
  // Variable mapping (key = system field path e.g. "order.customer.fullName")
  mappedField?: string;
}

export interface LabelTemplate {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  elements: CanvasElement[];
  createdAt: string;
}
