import type { Bill, PaymentMethod } from '../types';

/** Cùng ngày theo lịch local (YYYY-MM-DD). */
export function billDateKey(isoDate: string): string {
  const d = new Date(isoDate);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function isCash(m?: PaymentMethod): boolean {
  return m === 'Cash';
}

export function isTransfer(m?: PaymentMethod): boolean {
  return m === 'BIDV' || m === 'JJW';
}

export interface DailySummaryResult {
  dateKey: string;
  bills: Bill[];
  totalRevenue: number;
  cashTotal: number;
  transferTotal: number;
  otherTotal: number;
  /** tổng số lượng sản phẩm, bao gồm cả topping */
  totalItemsSold: number;
  /** món → tổng số lượng */
  itemSales: Map<string, number>;
}

export function computeDailySummary(history: Bill[], dateKey: string): DailySummaryResult {
  const bills = history.filter((b) => billDateKey(b.date) === dateKey);
  let totalRevenue = 0;
  let cashTotal = 0;
  let transferTotal = 0;
  let otherTotal = 0;
  let totalItemsSold = 0;
  const itemSales = new Map<string, number>();

  for (const bill of bills) {
    totalRevenue += bill.total;
    const m = bill.paymentMethod;
    if (isCash(m)) cashTotal += bill.total;
    else if (isTransfer(m)) transferTotal += bill.total;
    else otherTotal += bill.total;

    for (const line of bill.items) {
      const mainName = line.menuItem.name;
      itemSales.set(mainName, (itemSales.get(mainName) ?? 0) + line.quantity);
      totalItemsSold += line.quantity;

      if (line.toppings) {
        for (const topping of line.toppings) {
          const toppingName = topping.name;
          itemSales.set(toppingName, (itemSales.get(toppingName) ?? 0) + topping.quantity);
          totalItemsSold += topping.quantity;
        }
      }
    }
  }

  return {
    dateKey,
    bills,
    totalRevenue,
    cashTotal,
    transferTotal,
    otherTotal,
    totalItemsSold,
    itemSales,
  };
}

/** Top món theo số lượng (đã sort). */
export function getTopSellingItems(history: Bill[], dateKey: string, limit = 10): { name: string; qty: number }[] {
  const { itemSales } = computeDailySummary(history, dateKey);
  return Array.from(itemSales.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, qty]) => ({ name, qty }));
}
