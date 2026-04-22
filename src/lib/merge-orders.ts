import type { OrderItem, ToppingItem } from '../types';

/**
 * Gộp toppings của hai order items cùng món.
 * Cùng topping id → cộng số lượng.
 * Khác id → thêm mới.
 */
function mergeToppings(
  toppingsA: ToppingItem[],
  toppingsB: ToppingItem[]
): ToppingItem[] {
  const map = new Map<number, ToppingItem>();
  for (const t of toppingsA) {
    map.set(t.id, { ...t });
  }
  for (const t of toppingsB) {
    const existing = map.get(t.id);
    if (existing) {
      map.set(t.id, { ...existing, quantity: existing.quantity + t.quantity });
    } else {
      map.set(t.id, { ...t });
    }
  }
  return Array.from(map.values());
}

/**
 * Gộp hai danh sách order items.
 * Cùng món (id) → cộng số lượng, nối ghi chú, merge toppings.
 * Khác món → thêm mới.
 */
export function mergeOrderItems(
  primary: OrderItem[],
  secondary: OrderItem[]
): OrderItem[] {
  const map = new Map<number, OrderItem>();

  for (const o of primary) {
    map.set(o.menuItem.id, {
      ...o,
      menuItem: { ...o.menuItem },
      toppings: [...(o.toppings ?? [])],
    });
  }

  for (const o of secondary) {
    const existing = map.get(o.menuItem.id);
    if (existing) {
      const noteA = existing.note?.trim();
      const noteB = o.note?.trim();
      let note: string | undefined;
      if (noteA && noteB) note = `${noteA}; ${noteB}`;
      else note = noteA || noteB;

      map.set(o.menuItem.id, {
        menuItem: { ...existing.menuItem },
        quantity: existing.quantity + o.quantity,
        note,
        toppings: mergeToppings(
          existing.toppings ?? [],
          o.toppings ?? []
        ),
      });
    } else {
      map.set(o.menuItem.id, {
        ...o,
        menuItem: { ...o.menuItem },
        toppings: [...(o.toppings ?? [])],
      });
    }
  }

  return Array.from(map.values());
}