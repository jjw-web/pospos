import type { TableData } from '../types';

const NEW_TABLES_V4: TableData[] = [
  { id: 21, name: 'T9', layout: 'Inside', status: 'available', order: [] },
  { id: 22, name: 'T10', layout: 'Inside', status: 'available', order: [] },
  { id: 23, name: 'T11', layout: 'Inside', status: 'available', order: [] },
  { id: 24, name: 'T12', layout: 'Inside', status: 'available', order: [] },
];

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

  if ((oldVersion === null || oldVersion < 4) && newVersion >= 4) {
    try {
      const tablesJSON = localStorage.getItem('tables');
      if (!tablesJSON) return;
      const tableEntries: [number, TableData][] = JSON.parse(tablesJSON);
      const tablesMap = new Map(tableEntries);
      let changed = false;
      for (const newTable of NEW_TABLES_V4) {
        if (!tablesMap.has(newTable.id)) {
          tablesMap.set(newTable.id, newTable);
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem('tables', JSON.stringify(Array.from(tablesMap.entries())));
      }
    } catch (e) {
      console.error('Lỗi nâng cấp dữ liệu v4 (add tables)', e);
    }
  }
}
