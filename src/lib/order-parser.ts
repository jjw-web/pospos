// src/lib/order-parser.ts
import { MenuItem, ParsedLine } from '../types';

// Danh sách các từ viết tắt và cách thay thế tương ứng
const abbreviations: { [key: string]: string } = {
  'sc': 'sữa chua',
  'scl': 'socola',
  'nc': 'nước',
  'ep': 'ép',
  'sto': 'sinh tố',
  'ko': 'không',
  'k': 'không',
  'kg': 'không',
  'it': 'ít',
  'nh': 'nhiều',
  'dg': 'đường',
  'd': 'đá',
  'tc': 'trân châu',
  'bm': 'bơ mãng',
  'mc': 'mãng cầu',
  'cl': 'chanh leo',
  'dc': 'dẻo cacao',
  'hq': 'hoa quả',
  'vs': 'việt quất',
  // Các từ viết tắt cho sữa chua dẻo
  'dẻo hqua': 'sữa chua dẻo hoa quả',
  'dẻo hq': 'sữa chua dẻo hoa quả',
  'dẻo bơ': 'sữa chua dẻo bơ',
  'dẻo xoài': 'sữa chua dẻo xoài',
  'dẻo dâu': 'sữa chua dẻo dâu',
  'dẻo mc': 'sữa chua dẻo mãng cầu',
  'dẻo dx': 'sữa chua dẻo dâu xoài',
  'dẻo bx': 'sữa chua dẻo bơ xoài',
  // Các từ viết tắt cho hạt
  'hd': 'hướng dương',
  'hs': 'hạt sen',
  'hđ': 'hạt dẻ',
  // Các từ viết tắt cho loại đồ uống
  'n': 'nóng',
  'l': 'lạnh',
  'ld': 'lạnh',
  'xc': 'xay',
  'đ': 'đá',
  'kđ': 'không đá',
  'ítđ': 'ít đá',
  'nhiềuđ': 'nhiều đá',
  // Các từ viết tắt cho đường
  'ítđg': 'ít đường',
  'nhiềuđg': 'nhiều đường',
  'kđg': 'không đường',
  'đđ': 'đường đen',
  // Các từ viết tắt cho dầm sữa chua
  'hq dầm': 'hoa quả dầm sữa chua',
  'bơ dầm': 'bơ dầm sữa chua',
  'xoài dầm': 'xoài dầm sữa chua',
  'mc dầm': 'mãng cầu dầm sữa chua',
  'dâu dầm': 'dâu dầm sữa chua',
  'bm dầm': 'bơ mãng cầu dầm sữa chua',
  'bd dầm': 'bơ dâu dầm sữa chua',
  'bx dầm': 'bơ xoài dầm sữa chua',
  'dx dầm': 'dâu xoài dầm sữa chua',
  'mít dầm': 'mít dầm sữa chua',
  // Các từ viết tắt khác
  'cn': 'chanh',
  'cam': 'cam',
  'táo': 'táo',
  'ổi': 'ổi',
  'thơm': 'thơm',
  'xoài': 'xoài',
  'dâu': 'dâu',
  'cherry': 'cherry',
  'dừa': 'dừa',
  'sầu': 'sầu riêng',
  'mít': 'mít',
  'vải': 'vải',
  'nhãn': 'nhãn',
  'long': 'long nhãn',
  // Các từ viết tắt cho topping
  'hạt nổ': 'topping hạt nổ',
  'hạt đác': 'topping hạt đác',
  'tc trắng': 'topping trân châu trắng',
  'tc đen': 'topping trân châu đen',
  'thập cẩm': 'topping thập cẩm',
  'hạt sen': 'topping hạt sen',
  'hạt điều': 'topping hạt điều',
  'dừa khô': 'topping dừa khô',
  'hạt': 'topping hạt',
  'kem': 'topping kem',
  'kem cheese': 'topping kem cheese',
  'pudding': 'topping pudding',
  'flan': 'topping flan',
  // Các từ viết tắt cho số lượng topping
  'thêm': 'thêm topping',
  'thêm tc': 'thêm topping trân châu',
  'thêm hạt': 'thêm topping hạt',
  '1 thêm': '1 topping',
  '2 thêm': '2 topping',
  '3 thêm': '3 topping',
};

/**
 * Mở rộng các từ viết tắt trong một chuỗi văn bản.
 * @param text - Chuỗi văn bản đầu vào.
 * @returns Chuỗi văn bản đã được mở rộng.
 */
function expandAbbreviations(text: string): string {
  let expandedText = ` ${text} `;
  for (const abbr in abbreviations) {
    // Sử dụng regex với word boundary để tránh thay thế một phần của từ
    // Ví dụ: không thay thế 'sc' trong 'screen'
    // Thêm khoảng trắng ở đầu và cuối để xử lý các từ ở biên
    const regex = new RegExp(` ${abbr} `, 'gi');
    expandedText = expandedText.replace(regex, ` ${abbreviations[abbr]} `);
  }
  return expandedText.trim();
}

/**
 * Phân tích một dòng văn bản để tìm số lượng, tên món và ghi chú.
 * @param line - Dòng văn bản cần phân tích (ví dụ: "2 cafe sữa ít ngọt")
 * @param menuItems - Danh sách tất cả các món ăn có sẵn
 * @returns Một đối tượng ParsedLine
 */
function parseSingleLine(line: string, menuItems: MenuItem[]): ParsedLine {
  const expandedLine = expandAbbreviations(line);

  const result: ParsedLine = {
    originalLine: line,
    quantity: 1, // Mặc định số lượng là 1
  };

  // 1. Tìm món ăn khớp nhất (longest match) trong toàn bộ dòng
  let bestMatch: MenuItem | null = null;
  let bestMatchScore = 0;
  let bestMatchIndex = -1;

  const lineLower = expandedLine.toLowerCase();

  for (const item of menuItems) {
    const itemNameLower = item.name.toLowerCase();
    const index = lineLower.indexOf(itemNameLower);
    if (index !== -1) {
      const score = itemNameLower.length; // Ưu tiên tên dài hơn
      if (score > bestMatchScore) {
        bestMatch = item;
        bestMatchScore = score;
        bestMatchIndex = index;
      }
    }
  }

  if (bestMatch) {
    result.matchedItem = bestMatch;

    // 2. Tách phần văn bản còn lại sau khi đã loại bỏ tên món
    const remainingText = (
      expandedLine.substring(0, bestMatchIndex) +
      expandedLine.substring(bestMatchIndex + bestMatch.name.length)
    ).trim();

    // 3. Phân tích phần còn lại để tìm số lượng, topping và ghi chú
    const quantityRegex = /^(?:sl:?|x)?\s*(\d+)\s*(.*)|(.*)\s*(?:x|sl:?)\s*(\d+)$/i;
    const match = remainingText.match(quantityRegex);

    let noteText = remainingText;
    let toppings: string[] = [];

    if (match) {
      const quantity = parseInt(match[1] || match[4], 10);
      if (!isNaN(quantity)) {
        result.quantity = quantity;
        noteText = (match[2] || match[3] || '').trim();
      }
    } else {
      // Nếu không khớp regex trên, kiểm tra xem phần còn lại có phải chỉ là một con số không
      const num = parseInt(remainingText, 10);
      if (!isNaN(num) && num.toString() === remainingText) {
        result.quantity = num;
        noteText = '';
      }
    }

    // 4. Phân tích topping từ noteText
    if (noteText) {
      // Tìm các pattern topping trong note
      const toppingPatterns = [
        /(\d+)\s*(thêm|topping)\s*(.+)/i,
        /(thêm|topping)\s*(.+)/i,
        /(.+)\s*(thêm|topping)/i
      ];

      for (const pattern of toppingPatterns) {
        const toppingMatch = noteText.match(pattern);
        if (toppingMatch) {
          const quantity = toppingMatch[1] ? parseInt(toppingMatch[1], 10) : 1;
          const toppingText = toppingMatch[toppingMatch[1] ? 3 : 2];
          toppings = toppingText.split(/,\s*|\s+và\s+|\s+and\s+/i).map(t => t.trim());
          noteText = noteText.replace(toppingMatch[0], '').trim();
          break;
        }
      }

      // Nếu vẫn còn text và có chứa từ topping, extract ra
      if (noteText) {
        const remainingWords = noteText.split(/\s+/);
        const toppingWords = ['topping', 'thêm', 'hạt', 'tc', 'trân châu', 'kem', 'cheese', 'pudding', 'flan'];
        const foundToppings = remainingWords.filter(word => 
          toppingWords.some(topping => word.toLowerCase().includes(topping))
        );
        
        if (foundToppings.length > 0) {
          toppings = [...toppings, ...foundToppings];
          noteText = remainingWords.filter(word => 
            !toppingWords.some(topping => word.toLowerCase().includes(topping))
          ).join(' ');
        }
      }
    }

    if (noteText) {
      result.note = noteText;
    }
    
    if (toppings.length > 0) {
      result.toppings = toppings;
    }

  } else {
    // Nếu không tìm thấy món nào, báo lỗi
    result.error = 'Không tìm thấy món';
  }

  return result;
}

/**
 * Phân tích toàn bộ đoạn văn bản order, chia thành từng dòng.
 * @param text - Toàn bộ văn bản từ textarea
 * @param allMenuItems - Danh sách tất cả các món ăn
 * @returns Mảng các đối tượng ParsedLine
 */
export const parseOrderText = (text: string, allMenuItems: MenuItem[]): ParsedLine[] => {
  if (!text.trim()) {
    return [];
  }

  return text
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => parseSingleLine(line, allMenuItems));
};