/**
 * Loại bỏ dấu tiếng Việt và chuyển về lowercase.
 * Dùng cho tìm kiếm không phân biệt dấu.
 * @param str - Chuỗi cần chuẩn hóa
 * @returns Chuỗi đã loại bỏ dấu, lowercase
 */
export function normalizeVietnamese(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd');
}

/**
 * Kiểm tra chuỗi text có chứa query không,
 * không phân biệt dấu tiếng Việt và hoa thường.
 * @param text - Chuỗi cần tìm trong
 * @param query - Chuỗi cần tìm
 * @returns true nếu tìm thấy
 */
export function includesNormalized(text: string, query: string): boolean {
  if (!query) return true;
  return normalizeVietnamese(text).includes(normalizeVietnamese(query));
}
