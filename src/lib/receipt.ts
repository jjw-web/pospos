import type { OrderItem } from '../types';

const LINE = '────────────────';

/**
 * Format hóa đơn thành text để hiển thị hoặc chia sẻ.
 * @param params - Các tham số bao gồm shopName, tableLabel, items, total
 * @returns Text hóa đơn đã format
 */
export function formatReceiptText(params: {
  shopName?: string;
  tableLabel: string;
  items: OrderItem[];
  total: number;
}): string {
  const { shopName = 'Bống Cà Phê', tableLabel, items, total } = params;
  const lines: string[] = [`🧾 ${shopName}`, LINE, `Bàn: ${tableLabel}`, ''];

  items.forEach((row) => {
    const mainTotal = row.menuItem.price * row.quantity;
    const note = row.note ? `  (Ghi chú: ${row.note})` : '';
    lines.push(
      `• ${row.menuItem.name} × ${row.quantity} — ${mainTotal.toLocaleString('vi-VN')}đ${note}`
    );
    if (row.toppings && row.toppings.length > 0) {
      row.toppings.forEach((topping) => {
        lines.push(
          `   + ${topping.name} × ${topping.quantity} — ${(topping.price * topping.quantity).toLocaleString('vi-VN')}đ`
        );
      });
    }
  });

  lines.push('', LINE, `Tổng cộng: ${total.toLocaleString('vi-VN')}đ`, '', 'Cảm ơn quý khách! 💚');

  return lines.join('\n');
}

/**
 * Copy text vào clipboard.
 * @param text - Text cần copy
 * @returns true nếu thành công
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

/**
 * Chia sẻ text qua Web Share API (nếu có) hoặc copy vào clipboard.
 * @param text - Text cần chia sẻ
 * @param title - Title cho Web Share API
 * @returns true nếu thành công
 */
export async function shareReceiptText(text: string, title: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title, text });
      return true;
    } catch (e) {
      if ((e as Error).name === 'AbortError') return true;
    }
  }
  return copyTextToClipboard(text);
}
