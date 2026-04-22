import { MENU_CATEGORIES } from '../../constants';
import type { MenuCategory, MenuItem } from '../types';

/**
 * Gộp menu đã lưu (localStorage) với MENU_CATEGORIES trong code:
 * - Cùng `id` → cập nhật giá và tên theo bản mặc định
 * - Thứ tự món theo MENU_CATEGORIES; món chỉ có trong bản lưu nối ở cuối
 */
export function mergeMenuWithDefaults(saved: MenuCategory[]): MenuCategory[] {
  const defaultItemsByCategory = new Map<string, MenuItem[]>();
  MENU_CATEGORIES.forEach((cat) => defaultItemsByCategory.set(cat.name, cat.items));

  const merged: MenuCategory[] = [];
  const savedByName = new Map(saved.map((c) => [c.name, c] as const));

  for (const defCat of MENU_CATEGORIES) {
    const savedCat = savedByName.get(defCat.name);
    const defaultItems = defCat.items;

    if (!savedCat) {
      merged.push({ name: defCat.name, items: [...defCat.items] });
      continue;
    }

    const savedById = new Map(savedCat.items.map((i) => [i.id, i] as const));
    const defaultIds = new Set(defaultItems.map((i) => i.id));

    const nextItems: MenuItem[] = defaultItems.map((d) => {
      const existing = savedById.get(d.id);
      if (existing) return { ...existing, price: d.price, name: d.name };
      return { ...d };
    });

    for (const item of savedCat.items) {
      if (!defaultIds.has(item.id)) {
        nextItems.push(item);
      }
    }

    merged.push({ name: savedCat.name, items: nextItems });
  }

  for (const savedCat of saved) {
    if (!defaultItemsByCategory.has(savedCat.name)) {
      merged.push(savedCat);
    }
  }

  return merged;
}
