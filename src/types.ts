// src/types.ts

export interface MenuItem {
  id: number;
  name: string;
  price: number; // Thêm giá tiền để tiện cho việc tạo đơn hàng sau này
}

export interface MenuCategory {
  category: string;
  items: MenuItem[];
}

export interface ParsedLine {
  originalLine: string;
  quantity: number;
  matchedItem?: MenuItem;
  note?: string;
  error?: string;
}
