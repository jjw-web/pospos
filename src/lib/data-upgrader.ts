import type { TableData } from '../types';

const NEW_TABLES_V4: TableData[] = [
  { id: 21, name: 'T9', layout: 'Inside', status: 'available', order: [] },
  { id: 22, name: 'T10', layout: 'Inside', status: 'available', order: [] },
  { id: 23, name: 'T11', layout: 'Inside', status: 'available', order: [] },
  { id: 24, name: 'T12', layout: 'Inside', status: 'available', order: [] },
];

/**
 * Nang cap cau truc du lieu ban tren CHUOI PAYLOAD cho truoc.
 * Ham THUAN: khong doc/ghi storage, khong side-effect.
 * @param payload - Chuỗi JSON entries bàn (đã bóc envelope, nếu có).
 * @param oldVersion - Phiên bản dữ liệu cũ (null nếu chưa có).
 * @param newVersion - Phiên bản dữ liệu mới (từ config).
 * @returns Chuoi payload sau nang cap (co the giong het dau vao neu khong doi)
 */
export function upgradeTablesPayload(
  payload: string,
  oldVersion: number | null,
  newVersion: number
): string {
  let entries: [number, TableData][];
  try {
    entries = JSON.parse(payload) as [number, TableData][];
  } catch (e) {
    console.error('[data-upgrader] Payload ban khong hop le, bo qua nang cap:', e);
    return payload;
  }
  const tablesMap = new Map<number, TableData>(entries);
  let result = payload;

  if ((oldVersion === null || oldVersion < 3) && newVersion >= 3) {
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
      result = JSON.stringify(Array.from(tablesMap.entries()));
    }
  }

  if ((oldVersion === null || oldVersion < 4) && newVersion >= 4) {
    // Parse lai tu `result` de bao gom ca thay doi cua buoc v3 o tren
    const currentMap = new Map<number, TableData>(
      JSON.parse(result) as [number, TableData][]
    );
    let changed = false;
    for (const newTable of NEW_TABLES_V4) {
      if (!currentMap.has(newTable.id)) {
        currentMap.set(newTable.id, newTable);
        changed = true;
      }
    }
    if (changed) {
      result = JSON.stringify(Array.from(currentMap.entries()));
    }
  }

  return result;
}
