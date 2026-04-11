import type { OrderItem } from '../../types';

const LINE = '────────────────';
const TOPPING_CATEGORY = 'TOPPING';

export function formatReceiptText(params: {
  shopName?: string;
  tableLabel: string;
  items: OrderItem[];
  total: number;
}): string {
  const { shopName = 'Bống Cà Phê', tableLabel, items, total } = params;

  const mainItems = items.filter(row => row.menuItem.category !== TOPPING_CATEGORY);
  const toppingItems = items.filter(row => row.menuItem.category === TOPPING_CATEGORY);

  const lines: string[] = [
    `🧾 ${shopName}`,
    LINE,
    `Bàn: ${tableLabel}`,
    '',
  ];

  // Món chính
  mainItems.forEach((row) => {
    const sub = row.menuItem.price * row.quantity;
    lines.push(`• ${row.menuItem.name} × ${row.quantity} — ${sub.toLocaleString('vi-VN')}đ`);
    if (row.note) {
      lines.push(`  ↳ ${row.note}`);
    }
    
    // Hiển thị toppings đi kèm món chính
    const itemToppings = toppingItems.filter(topping => 
      // Giả sử dụng một cách để liên kết topping với món chính
      // Có thể cần thêm field để liên kết
      mainItems.some(main => main.menuItem.id === row.menuItem.id)
    );
    
    if (itemToppings.length > 0) {
      itemToppings.forEach((topping) => {
        const toppingSub = topping.menuItem.price * topping.quantity;
        lines.push(`  + ${topping.menuItem.name} × ${topping.quantity} — ${toppingSub.toLocaleString('vi-VN')}đ`);
      });
    }
  });

  lines.push('', LINE, `Tổng cộng: ${total.toLocaleString('vi-VN')}đ`, '', 'Cảm ơn quý khách! 💚');

  return lines.join('\n');
}

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