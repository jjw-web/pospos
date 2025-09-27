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

    // 3. Phân tích phần còn lại để tìm số lượng và ghi chú
    const quantityRegex = /^(?:sl:?|x)?\s*(\d+)\s*(.*)|(.*)\s*(?:x|sl:?)\s*(\d+)$/i;
    const match = remainingText.match(quantityRegex);

    let noteText = remainingText;

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

    if (noteText) {
      result.note = noteText;
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