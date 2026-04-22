export type PaymentMethod = 'Cash' | 'BIDV' | 'JJW';

export type TableLayout = 'Inside' | 'Outside';

export type ViewType = TableLayout;

export type TableTransferMode = 'move' | 'merge';

export type TableStatus = 'available' | 'occupied';

export interface ToppingItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category?: string;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  note?: string;
  toppings?: ToppingItem[];
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export interface TableData {
  id: number;
  name: string;
  layout: TableLayout;
  status: TableStatus;
  order: OrderItem[];
  occupiedSince?: string | null;
}

export interface Bill {
  id: number;
  table: string;
  items: OrderItem[];
  total: number;
  date: string;
  paymentMethod?: PaymentMethod;
}

export interface TableAreaStats {
  occupied: number;
  total: number;
}

export type AppScreen =
  | 'start'
  | 'viewSelection'
  | 'inside'
  | 'outside'
  | 'order'
  | 'history'
  | 'menu'
  | 'dailySummary';
