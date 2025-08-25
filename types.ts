// Định nghĩa dữ liệu từ Supabase
export interface TableData {
  id: number;
  name: string;
  layout: ViewType;
  status: 'available' | 'occupied';
  order: OrderItem[];
  user_id?: string; // Thêm user_id để phân biệt dữ liệu giữa các user
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category?: string;
  user_id?: string; // Thêm user_id để phân biệt menu giữa các user
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export type ViewType = 'Inside' | 'Outside';

// Props cho từng View Component
export interface StartViewProps {
  onStart: () => void;
}

export interface ViewSelectionViewProps {
  onSelect: (view: 'inside' | 'outside') => void;
  onBack: () => void;
}

export interface InsideViewProps {
  tables: TableData[];
  onTableSelect: (tableId: number) => void;
  onBack: () => void;
}

export interface OutsideViewProps {
  tables: TableData[];
  onTableSelect: (tableId: number) => void;
  onBack: () => void;
}

export interface OrderViewProps {
  table: TableData;
  menuCategories: MenuCategory[];
  onBack: () => void;
  onAddItem: (tableId: number, menuItem: MenuItem) => void;
  onUpdateQuantity: (tableId: number, menuItemId: number, change: number) => void;
  onPayment: (tableId: number) => void;
}

export interface Bill {
  id: number;
  table: string;
  items: OrderItem[];
  total: number;
  date: string;
}
