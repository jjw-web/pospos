// Định nghĩa dữ liệu từ Supabase
export interface TableData {
  id: number;
  name: string;
  layout: ViewType;
  status: 'available' | 'occupied';
  order: OrderItem[];
  /** Thời điểm bắt đầu có khách (món đầu tiên), ISO string */
  occupiedSince?: string | null;
  user_id?: string; // Thêm user_id để phân biệt dữ liệu giữa các user
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category?: string;
  user_id?: string; // Thêm user_id để phân biệt menu giữa các user
}

export interface ToppingItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
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

export type ViewType = 'Inside' | 'Outside';

export interface TableAreaStats {
  occupied: number;
  total: number;
}

// Props cho từng View Component
export interface StartViewProps {
  onStart: () => void;
}

export interface ViewSelectionViewProps {
  onSelect: (view: 'inside' | 'outside' | 'menu' | 'dailySummary') => void;
  onBack: () => void;
  onHistory: () => void;
  insideStats: TableAreaStats;
  outsideStats: TableAreaStats;
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
  onAddItem: (tableId: number, menuItems: { menuItem: MenuItem; toppings?: ToppingItem[] }[]) => void;
  onUpdateQuantity: (tableId: number, menuItemId: number, change: number) => void;
  onPayment: (tableId: number, paymentMethod: PaymentMethod) => void;
  onUpdateNote: (tableId: number, menuItemId: number, note: string) => void;
  onMoveTable: (fromId: number, toId: number) => void;
  onMergeFromTable: (currentId: number, sourceId: number) => void;
  onAddTopping?: (tableId: number, mainItemId: number, toppings: { id: number; name: string; price: number }[]) => void;
}

export type PaymentMethod = 'Cash' | 'BIDV' | 'JJW';

export interface Bill {
  id: number;
  table: string;
  items: OrderItem[];
  total: number;
  date: string;
  paymentMethod?: PaymentMethod;
}
