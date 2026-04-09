// src/lib/order-parser.ts
import { MenuItem, ParsedLine } from '../types';
import { normalizeOrderInput, parseNormalizedOrder, ABBREVIATION_RULES } from './abbreviation-rules';

/**
 * Fuzzy matching function cho lỗi chính tả phổ biến
 */
function fuzzyMatch(text: string, pattern: string): number {
  const replacements: { [key: string]: string } = {
    'hqa': 'hoa quả',
    'hq': 'hoa quả', 
    'hqua': 'hoa quả',
    'sc': 'sữa chua',
    'mc': 'mãng cầu',
    'bm': 'bơ mãng cầu',
    'dx': 'dâu xoài',
    'bx': 'bơ xoài',
    'bd': 'bơ dâu',
    'tc': 'trân châu',
    'nc': 'nước',
    'sto': 'sinh tố',
    'ep': 'ép',
    'scl': 'socola',
    'ko': 'không',
    'k': 'không',
    'kg': 'không',
    'it': 'ít',
    'nh': 'nhiều',
    'dg': 'đường',
    'd': 'đá',
    'n': 'nóng',
    'l': 'lạnh',
    'ld': 'lạnh',
    'xc': 'xay',
    'kđ': 'không đá',
    'ítđ': 'ít đá',
    'nhiềuđ': 'nhiều đá',
    'ítđg': 'ít đường',
    'nhiềuđg': 'nhiều đường',
    'kđg': 'không đường',
    'đđ': 'đường đen',
  };

  let modifiedPattern = pattern;
  for (const [abbr, full] of Object.entries(replacements)) {
    modifiedPattern = modifiedPattern.replace(new RegExp(full, 'g'), abbr);
  }

  const index = text.indexOf(modifiedPattern);
  if (index !== -1) {
    return index;
  }

  let modifiedText = text;
  for (const [abbr, full] of Object.entries(replacements)) {
    modifiedText = modifiedText.replace(new RegExp(abbr, 'g'), full);
  }

  return modifiedText.indexOf(pattern);
}

/**
 * Phân tích một dòng văn bản để tìm số lượng, tên món và ghi chú.
 */
function parseSingleLine(line: string, menuItems: MenuItem[]): ParsedLine {
  const result: ParsedLine = {
    originalLine: line,
    quantity: 1,
  };

  // 1. Chuẩn hóa input theo quy tắc
  const normalizedInput = normalizeOrderInput(line);
  const parsed = parseNormalizedOrder(normalizedInput);

  // 2. Tạo danh sách sản phẩm bao gồm cả toppings từ ABBREVIATION_RULES
  const toppingItems: MenuItem[] = [];
  Object.entries(ABBREVIATION_RULES).forEach(([abbr, full]) => {
    if (typeof full === 'string' && full.startsWith('TOPPING:')) {
      const match = full.match(/TOPPING:\s*([^|]+)\|(\d+)/);
      if (match) {
        toppingItems.push({
          id: -1, // Special ID for toppings
          name: match[1].trim(),
          price: parseInt(match[2], 10)
        });
      }
    }
  });

  // 3. Greedy Search: Tìm tất cả sản phẩm có trong dòng
  let remainingText = parsed.mainItem.toLowerCase();
  const allItems = [...menuItems, ...toppingItems];
  const foundItems: { item: MenuItem; quantity: number }[] = [];
  
  // Sắp xếp sản phẩm theo tên dài nhất trước để tránh khớp sai
  const sortedProducts = allItems.sort((a, b) => b.name.length - a.name.length);

  sortedProducts.forEach(product => {
    const productName = product.name.toLowerCase();
    
    // Thử exact match trước
    if (remainingText.includes(productName)) {
      foundItems.push({
        item: product,
        quantity: parsed.quantity
      });
      // Xóa phần đã tìm thấy khỏi chuỗi để tránh trùng lặp
      remainingText = remainingText.replace(productName, '').trim();
    } else {
      // Thử fuzzy matching
      const fuzzyIndex = fuzzyMatch(remainingText, productName);
      if (fuzzyIndex !== -1) {
        foundItems.push({
          item: product,
          quantity: parsed.quantity
        });
        // Xóa phần đã tìm thấy khỏi chuỗi
        remainingText = remainingText.substring(0, fuzzyIndex) + 
                       remainingText.substring(fuzzyIndex + productName.length);
        remainingText = remainingText.trim();
      }
    }
  });

  // 4. Xử lý kết quả
  if (foundItems.length > 0) {
    // Tìm sản phẩm chính (không phải topping)
    const mainProduct = foundItems.find(f => f.item.id !== -1) || foundItems[0];
    
    result.matchedItem = mainProduct.item;
    result.quantity = mainProduct.quantity;
    
    // Tìm các toppings khác
    const toppings = foundItems.filter(f => f.item.id === -1);
    if (toppings.length > 0) {
      result.toppings = toppings.map(t => ({
        name: t.item.name,
        price: t.item.price,
        quantity: t.quantity
      }));
    }
    
    // Các sản phẩm khác (không phải topping) được coi là món phụ
    const otherItems = foundItems.filter(f => f.item.id !== -1 && f.item.id !== mainProduct.item.id);
    if (otherItems.length > 0) {
      result.note = `Cùng với: ${otherItems.map(f => f.item.name).join(', ')}`;
    }
    
    // Xử lý notes từ parseNormalizedOrder
    if (parsed.notes.length > 0) {
      result.note = result.note ? `${result.note}, ${parsed.notes.join(', ')}` : parsed.notes.join(', ');
    }
  } else {
    result.error = `Không tìm thấy món: "${parsed.mainItem}"`;
  }

  return result;
}

/**
 * Phân tích toàn bộ đoạn văn bản order, chia thành từng dòng.
 */
export function parseOrderText(text: string, allMenuItems: MenuItem[]): ParsedLine[] {
  const lines = text.split('\n').filter(line => line.trim());
  return lines.map(line => parseSingleLine(line.trim(), allMenuItems));
}
