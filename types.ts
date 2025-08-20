
export enum ViewType {
  Inside = 'Inside',
  Outside = 'Outside',
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
}

export type TableStatus = 'available' | 'occupied';

export interface TableData {
  id: number;
  name: string;
  layout: ViewType;
  status: TableStatus;
  order: OrderItem[];
}