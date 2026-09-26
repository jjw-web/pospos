import type { Bill, MenuCategory, TableData } from '../types';

import { db } from './db';

/**
 * Suffix cho key backup trong localStorage (ví dụ: `tables_backup`).
 * Backup giữ bản ghi tốt gần nhất để khôi phục khi bản chính bị cắt cụt
 * (WKWebView bị kill giữa lúc ghi — nguyên nhân gây "reset" mất data).
 */
export const BACKUP_SUFFIX = '_backup';

/**
 * Parse chuỗi JSON và kiểm tra hình dạng dữ liệu.
 * Trả về null khi chuỗi rỗng, parse lỗi, hoặc không đúng shape —
 * caller phải fallback sang nguồn khác, không được dùng data sai.
 * @param raw - Chuỗi JSON đọc từ storage (có thể null).
 * @param validate - Type guard kiểm tra shape sau khi parse.
 * @returns Dữ liệu hợp lệ, hoặc null khi hỏng.
 */
export function parseValidatedJSON<T>(
  raw: string | null | undefined,
  validate: (value: unknown) => value is T
): T | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return validate(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Type guard cho dữ liệu bàn dạng Map.entries đã serialize.
 */
export function isTableEntries(value: unknown): value is [number, TableData][] {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) =>
        Array.isArray(entry) &&
        typeof entry[0] === 'number' &&
        typeof entry[1] === 'object' &&
        entry[1] !== null &&
        Array.isArray((entry[1] as TableData).order)
    )
  );
}

/**
 * Type guard cho lịch sử hóa đơn.
 */
export function isBillArray(value: unknown): value is Bill[] {
  return (
    Array.isArray(value) &&
    value.every(
      (bill) =>
        typeof bill === 'object' &&
        bill !== null &&
        typeof (bill as Bill).id === 'number' &&
        Array.isArray((bill as Bill).items) &&
        typeof (bill as Bill).total === 'number'
    )
  );
}

/**
 * Type guard cho danh mục menu đã lưu.
 */
export function isMenuCategoryArray(value: unknown): value is MenuCategory[] {
  return (
    Array.isArray(value) &&
    value.every(
      (cat) =>
        typeof cat === 'object' &&
        cat !== null &&
        typeof (cat as MenuCategory).name === 'string' &&
        Array.isArray((cat as MenuCategory).items)
    )
  );
}

/**
 * Đọc dữ liệu qua 3 lớp fallback: IndexedDB (chính) → localStorage (chính)
 * → localStorage (backup). Lớp nào parse hỏng thì bỏ qua, thử lớp tiếp theo.
 * Ngăn trường hợp một bản ghi hỏng khiến toàn bộ data "reset" về rỗng.
 * @param key - Storage key chính (ví dụ: 'tables').
 * @returns Chuỗi JSON hợp lệ đầu tiên tìm được, hoặc null.
 */
export async function readWithFallback(key: string): Promise<string | null> {
  try {
    const fromDB = await db.getItem<string>(key);
    if (fromDB) return fromDB;
  } catch {
    // IndexedDB lỗi — thử tiếp localStorage
  }

  try {
    const fromLS = localStorage.getItem(key);
    if (fromLS) return fromLS;
  } catch {
    // localStorage lỗi — thử tiếp backup
  }

  try {
    return localStorage.getItem(key + BACKUP_SUFFIX);
  } catch {
    return null;
  }
}

/**
 * Ghi dữ liệu kèm xoay vòng backup: bản chính hiện tại trong localStorage
 * được copy sang `<key>_backup` TRƯỚC khi ghi đè. Nếu app bị kill giữa lúc
 * ghi khiến bản chính cắt cụt, lần mở sau vẫn còn backup nguyên vẹn.
 * @param key - Storage key chính.
 * @param value - Chuỗi JSON mới cần ghi.
 */
export async function persistWithBackup(key: string, value: string): Promise<void> {
  try {
    const current = localStorage.getItem(key);
    if (current) {
      localStorage.setItem(key + BACKUP_SUFFIX, current);
    }
  } catch {
    // Không xoay được backup thì vẫn tiếp tục ghi bản chính
  }

  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.error(`[safe-storage] localStorage write failed for ${key}:`, err);
  }

  try {
    await db.setItem(key, value);
  } catch (err) {
    console.error(`[safe-storage] IndexedDB write failed for ${key}:`, err);
  }
}
