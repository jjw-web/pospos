import type { TableData } from '../types';

/**
 * Nâng cấp cấu trúc dữ liệu trong localStorage từ phiên bản cũ sang phiên bản mới.
 * @param oldVersion Phiên bản dữ liệu cũ (lấy từ localStorage).
 * @param newVersion Phiên bản dữ liệu mới (từ config).
 */
export function upgradeDataStructure(oldVersion: number | null, newVersion: number) {
  if ((oldVersion === null || oldVersion < 3) && newVersion >= 3) {
    const tablesJSON = localStorage.getItem('tables');
    if (!tablesJSON) return;
    try {
      const tableEntries: [number, TableData][] = JSON.parse(tablesJSON);
      const tablesMap = new Map(tableEntries);
      let changed = false;
      const fallbackSince = new Date().toISOString();
      for (const [id, t] of tablesMap.entries()) {
        if (t.order.length === 0 && t.occupiedSince != null) {
          tablesMap.set(id, { ...t, occupiedSince: undefined });
          changed = true;
        } else if (
          t.status === 'occupied' &&
          t.order.length > 0 &&
          (t.occupiedSince == null || t.occupiedSince === '')
        ) {
          tablesMap.set(id, { ...t, occupiedSince: fallbackSince });
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem('tables', JSON.stringify(Array.from(tablesMap.entries())));
      }
    } catch (e) {
      console.error('Lỗi nâng cấp dữ liệu v3 (tables)', e);
    }
  }
}
