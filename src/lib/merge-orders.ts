import type { OrderItem } from '../../types';

/** Gộp hai danh sách dòng order (cùng món → cộng số lượng, ghi chú nối). */
export function mergeOrderItems(primary: OrderItem[], secondary: OrderItem[]): OrderItem[] {
  const map = new Map<number, OrderItem>();

  for (const o of primary) {
    map.set(o.menuItem.id, { ...o, menuItem: { ...o.menuItem } });
  }

  for (const o of secondary) {
    const ex = map.get(o.menuItem.id);
    if (ex) {
      const noteA = ex.note?.trim();
      const noteB = o.note?.trim();
      let note: string | undefined;
      if (noteA && noteB) note = `${noteA}; ${noteB}`;
      else note = noteA || noteB;
      map.set(o.menuItem.id, {
        menuItem: { ...ex.menuItem },
        quantity: ex.quantity + o.quantity,
        note,
      });
    } else {
      map.set(o.menuItem.id, { ...o, menuItem: { ...o.menuItem } });
    }
  }

  return Array.from(map.values());
}
