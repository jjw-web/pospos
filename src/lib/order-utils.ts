import type { OrderItem, MenuCategory } from '../types';

export interface OrderCounts {
  mainCount: number;
  toppingCount: number;
  snackCount: number;
}

/**
 * Tính tổng tiền của một order item bao gồm toppings.
 * @param item - OrderItem cần tính
 * @returns Tổng tiền tính bằng VND
 */
export function calcItemTotal(item: OrderItem): number {
  const toppingsTotal =
    item.toppings?.reduce(
      (sum, t) => sum + t.price * t.quantity,
      0
    ) ?? 0;
  return item.menuItem.price * item.quantity + toppingsTotal;
}

/**
 * Tính tổng tiền toàn bộ order.
 * @param items - Danh sách OrderItem
 * @returns Tổng tiền tính bằng VND
 */
export function calcOrderTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + calcItemTotal(item), 0);
}

/**
 * Phân loại và đếm số lượng món theo nhóm:
 * đồ uống chính, topping, snack.
 * @param items - Danh sách OrderItem
 * @param menuCategories - Danh sách category để xác định loại
 * @returns OrderCounts
 */
export function countOrderItems(
  items: OrderItem[],
  menuCategories: MenuCategory[]
): OrderCounts {
  const itemToCategoryMap = new Map<number, string>();
  menuCategories.forEach((cat) => {
    cat.items.forEach((item) => itemToCategoryMap.set(item.id, cat.name));
  });

  let mainCount = 0;
  let toppingCount = 0;
  let snackCount = 0;

  items.forEach((item) => {
    const categoryName =
      itemToCategoryMap.get(item.menuItem.id) ?? 'Khác';
    const lower = categoryName.toLowerCase();
    const qty = item.quantity;
    const extraToppings =
      item.toppings?.reduce((s, t) => s + t.quantity, 0) ?? 0;

    if (lower.includes('topping')) {
      toppingCount += qty;
    } else if (
      lower.includes('snack') ||
      lower.includes('khai vị')
    ) {
      snackCount += qty;
    } else {
      mainCount += qty;
    }
    toppingCount += extraToppings;
  });

  return { mainCount, toppingCount, snackCount };
}

/**
 * Group order items theo tên category.
 * Items không có category sẽ vào nhóm 'Khác'.
 * @param items - Danh sách OrderItem
 * @param menuCategories - Danh sách category
 * @returns Object với key là tên category, value là mảng OrderItem
 */
export function groupItemsByCategory(
  items: OrderItem[],
  menuCategories: MenuCategory[]
): Record<string, OrderItem[]> {
  const itemToCategoryMap = new Map<number, string>();
  menuCategories.forEach((cat) => {
    cat.items.forEach((item) => itemToCategoryMap.set(item.id, cat.name));
  });

  return items.reduce<Record<string, OrderItem[]>>((acc, item) => {
    const cat =
      itemToCategoryMap.get(item.menuItem.id) ?? 'Khác';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});
}