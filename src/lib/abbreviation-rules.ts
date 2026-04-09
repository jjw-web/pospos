// src/lib/abbreviation-rules.ts
/**
 * QUY TẮC VIẾT TẮT CHUẨN HÓA CHO QUICK ORDER
 * 
 * CẤU TRÚC CHUNG:
 * [SỐ LƯỢNG] [TÊN MÓN VIẾT TẮT] [TOPPING...]
 * 
 * VÍ DỤ:
 * 1 dẻo hqua hạt nổ
 * 2 mc dầm 1 thêm tc trắng
 * 3 hd
 * 1 cacao đá ít đường
 */

export const ABBREVIATION_RULES = {
  // === QUY TẮC SỮA CHUA DẺO ===
  // Format: dẻo [tên viết tắt]
  'dẻo hqua': 'Sữa chua dẻo hoa quả',
  'dẻo hq': 'Sữa chua dẻo hoa quả',
  'dẻo bơ': 'Sữa chua dẻo bơ',
  'dẻo xoài': 'Sữa chua dẻo xoài',
  'dẻo dâu': 'Sữa chua dẻo dâu',
  'dẻo mc': 'Sữa chua dẻo mãng cầu',
  'dẻo dx': 'Sữa chua dẻo dâu xoài',
  'dẻo bx': 'Sữa chua dẻo bơ xoài',
  'dẻo bd': 'Sữa chua dẻo bơ dâu',
  'dẻo mít': 'Sữa chua dẻo mít',
  'dẻo cacao': 'Sữa chua dẻo cacao',
  'dẻo vs': 'Sữa chua dẻo việt quất',
  'dẻo cl': 'Sữa chua dẻo chanh leo',
  'dẻo tc': 'Sữa chua dẻo trân châu',
  'dẻo matcha': 'Sữa chua dẻo matcha',
  'dẻo nd': 'Sữa chua dẻo nha đam',
  'dẻo trắng': 'Sữa chua dẻo trắng',
  'dẻo bm': 'Sữa chua dẻo bơ mãng cầu',

  // === QUY TẮC HOA QUẢ DẦM ===
  // Format: [tên viết tắt] dầm
  'hq dầm': 'Hoa quả dầm sữa chua',
  'bơ dầm': 'Bơ dầm sữa chua',
  'xoài dầm': 'Xoài dầm sữa chua',
  'mc dầm': 'Mãng cầu dầm sữa chua',
  'dâu dầm': 'Dâu dầm sữa chua',
  'bm dầm': 'Bơ mãng cầu dầm sữa chua',
  'bd dầm': 'Bơ dâu dầm sữa chua',
  'bx dầm': 'Bơ xoài dầm sữa chua',
  'dx dầm': 'Dâu xoài dầm sữa chua',
  'mít dầm': 'Mít dầm sữa chua',

  // === QUY TẮC ĐỒ UỐNG KHÁC ===
  'hd': 'Hướng dương',
  'hs': 'Hạt sen',
  'hđ': 'Hạt dẻ',
  'cacao': 'Cacao (nóng/đá)',
  'cacao kn': 'Cacao kem ngậy (nóng/đá)',
  'cafe sữa': 'Cà phê sữa',
  'cafe đen': 'Cà phê đen',
  'trà sữa': 'Trà sữa',
  'trà chanh': 'Trà chanh',
  'nước ép': 'Nước ép',
  'sinh tố': 'Sinh tố',

  // === QUY TẮC TOPPING (có giá) ===
  // Format: [tên viết tắt] - giá mặc định 5000đ
  'hạt nổ': 'TOPPING: Hạt nổ|5000',
  'hạt đác': 'TOPPING: Hạt đác|5000',
  'tc trắng': 'TOPPING: Trân châu trắng|5000',
  'tc đen': 'TOPPING: Trân châu đen|5000',
  'tc': 'TOPPING: Trân châu|5000',
  'trân châu': 'TOPPING: Trân châu|5000',
  'hạt sen': 'TOPPING: Hạt sen|5000',
  'hạt điều': 'TOPPING: Hạt điều|5000',
  'dừa khô': 'TOPPING: Dừa khô|3000',
  'thập cẩm': 'TOPPING: Thập cẩm|8000',
  'kem': 'TOPPING: Kem|5000',
  'kem cheese': 'TOPPING: Kem cheese|7000',
  'pudding': 'TOPPING: Pudding|5000',
  'flan': 'TOPPING: Flan|5000',

  // === QUY TẮC SỐ LƯỢNG VÀ ĐIỀU KIỆN ===
  'n': 'nóng',
  'l': 'lạnh',
  'ld': 'lạnh',
  'đ': 'đá',
  'kđ': 'không đá',
  'ítđ': 'ít đá',
  'nhiềuđ': 'nhiều đá',
  'ítđg': 'ít đường',
  'nhiềuđg': 'nhiều đường',
  'kđg': 'không đường',
  'đđ': 'đường đen',
  'ít ngọt': 'ít ngọt',
  'nhiều ngọt': 'nhiều ngọt',
  'không ngọt': 'không ngọt',

  // === QUY TẮC ĐẶC BIỆT ===
  'thêm': 'TOPPING:', // Từ khóa để nhận diện topping
  'topping': 'TOPPING:', // Từ khóa để nhận diện topping
} as const;

export const ORDER_PATTERNS = {
  // Pattern chính: [SỐ LƯỢNG] [TÊN MÓN] [TOPPING...]
  MAIN_PATTERN: /^(\d+)\s+(.+?)(?:\s+(.+))?$/i,
  
  // Pattern topping: [SỐ LƯỢNG] thêm [TOPPING]
  TOPPING_PATTERN: /(\d+)\s+(thêm|topping)\s+(.+)$/i,
  
  // Pattern topping: thêm [TOPPING]
  SIMPLE_TOPPING_PATTERN: /^(?:thêm|topping)\s+(.+)$/i,
  
  // Pattern note: [GHI CHÚ]
  NOTE_PATTERN: /^(nóng|lạnh|ít|nhiều|không|ítđ|nhiềuđ|ítđg|nhiềuđg|kđg|đđ|ít ngọt|nhiều ngọt|không ngọt)/i,
} as const;

/**
 * Chuẩn hóa chuỗi input theo quy tắc
 */
export function normalizeOrderInput(input: string): string {
  let normalized = input.toLowerCase().trim();
  
  // 1. Thay thế theo quy tắc abbreviations
  // Sắp xếp theo độ dài giảm dần để xử lý từ dài trước (tránh "hạt nổ" bị hỏng bởi "n")
  const sortedEntries = Object.entries(ABBREVIATION_RULES).sort((a, b) => b[0].length - a[0].length);
  
  for (const [abbr, full] of sortedEntries) {
    // Escape special regex characters in abbreviation
    const escapedAbbr = abbr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Use space-based matching for Vietnamese
    const regex = new RegExp(`(^|\\s)${escapedAbbr}(\\s|$)`, 'gi');
    normalized = normalized.replace(regex, (match, p1, p2) => {
      return p1 + full + p2;
    });
  }
  
  // 2. Chuẩn hóa khoảng trắng
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  // 3. Xóa ký tự đặc biệt không cần thiết
  normalized = normalized.replace(/[.,;:!?]/g, '');
  
  return normalized;
}

/**
 * Phân tích chuỗi đã chuẩn hóa thành các thành phần
 */
export function parseNormalizedOrder(normalizedInput: string) {
  const result = {
    quantity: 1,
    mainItem: '',
    toppings: [] as { name: string; price: number; quantity: number }[],
    notes: [] as string[],
  };
  
  // 1. Tách số lượng
  const quantityMatch = normalizedInput.match(/^(\d+)\s+(.+)/);
  if (quantityMatch) {
    result.quantity = parseInt(quantityMatch[1], 10);
    let remaining = quantityMatch[2];
    
    // 2. Tách toppings (có tiền tố TOPPING: và giá)
    // Format: TOPPING: Name|Price
    const toppingRegex = /TOPPING:\s*([^|]+)\|(\d+)/gi;
    let toppingMatch;
    
    while ((toppingMatch = toppingRegex.exec(remaining)) !== null) {
      result.toppings.push({
        name: toppingMatch[1].trim(),
        price: parseInt(toppingMatch[2], 10),
        quantity: 1
      });
    }
    
    // Xóa các phần topping khỏi remaining
    remaining = remaining.replace(/TOPPING:\s*[^|]+\|\d+/gi, '').trim();
    
    // 3. Xử lý remaining để tách main item và notes
    const parts = remaining.split(/\s+/);
    const cleanMainItem: string[] = [];
    const notes: string[] = [];
    
    // Các từ khóa cho notes (nhiệt độ, đường, đá)
    const noteKeywords = ['nóng', 'lạnh', 'ít', 'nhiều', 'không', 'ítđ', 'nhiềuđ', 'ítđg', 'nhiềuđg', 'kđg', 'đđ', 'đá', 'không đá', 'ít đá', 'nhiều đá', 'ít ngọt', 'nhiều ngọt', 'không ngọt', 'ít đường', 'nhiều đường', 'không đường'];
    
    for (const part of parts) {
      const partLower = part.toLowerCase();
      if (noteKeywords.some(keyword => partLower.includes(keyword))) {
        notes.push(part);
      } else {
        cleanMainItem.push(part);
      }
    }
    
    result.mainItem = cleanMainItem.join(' ');
    result.notes = notes;
  } else {
    // Không có số lượng, coi toàn bộ là main item
    result.mainItem = normalizedInput;
  }
  
  return result;
}

/**
 * Documentation cho người dùng
 */
export const QUICK_ORDER_GUIDE = `
📖 HƯỚNG DẪN VIẾT TẮT QUICK ORDER

=== CẤU TRÚC CHUNG ===
[SỐ LƯỢNG] [TÊN MÓN VIẾT TẮT] [TOPPING...]

=== SỮA CHUA DẺO ===
• dẻo hqua → Sữa chua dẻo hoa quả
• dẻo bơ → Sữa chua dẻo bơ
• dẻo mc → Sữa chua dẻo mãng cầu
• dẻo dx → Sữa chua dẻo dâu xoài

=== HOA QUẢ DẦM ===
• hq dầm → Hoa quả dầm sữa chua
• mc dầm → Mãng cầu dầm sữa chua
• bơ dầm → Bơ dầm sữa chua

=== ĐỒ UỐNG KHÁC ===
• hd → Hướng dương
• cacao → Cacao (nóng/đá)
• hs → Hạt sen

=== TOPPING ===
• hạt nổ, hạt đác, tc trắng, tc đen
• kem, kem cheese, pudding, flan

=== VÍ DỤ THỰC TẾ ===
✅ 1 dẻo hqua hạt nổ
✅ 2 mc dầm 1 thêm tc trắng  
✅ 3 hd ít đường
✅ 1 cacao đá ít ngọt thêm tc

=== LƯU Ý ===
• Mỗi món trên 1 dòng
• Số lượng đứng đầu tiên
• Topping đứng sau "thêm" hoặc ở cuối
• Notes (nóng/lạnh/ít đường) đứng cuối
`;
