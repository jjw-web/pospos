import type { TableData } from '../types';

/**
 * Nâng cấp cấu trúc dữ liệu trong localStorage từ phiên bản cũ sang phiên bản mới.
 * @param oldVersion Phiên bản dữ liệu cũ (lấy từ localStorage).
 * @param newVersion Phiên bản dữ liệu mới (từ config).
 */
export function upgradeDataStructure(oldVersion: number | null, newVersion: number) {
  console.log(`Kiểm tra nâng cấp dữ liệu từ v${oldVersion || 'ban đầu'} lên v${newVersion}...`);

  // Nâng cấp từ v1 (hoặc chưa có) lên v2
  if ((oldVersion === null || oldVersion < 2) && newVersion >= 2) {
    console.log('Thực hiện nâng cấp dữ liệu lên v2...');
    
    const tablesJSON = localStorage.getItem('tables');
    let tablesMap: Map<number, TableData>;

    try {
      // App.tsx lưu dữ liệu dạng Map.entries(), tức là [[key, value], ...]
      const tableEntries: [number, TableData][] = tablesJSON ? JSON.parse(tablesJSON) : [];
      tablesMap = new Map(tableEntries);
    } catch (error) {
      console.error('Lỗi khi đọc dữ liệu bàn ăn cũ, có thể dữ liệu không đúng định dạng Map.entries().', error);
      // Khởi tạo rỗng để tránh lỗi
      tablesMap = new Map();
    }

    // Logic để thêm 4 bàn mới khi có 8 bàn đã được xóa vì không còn phù hợp.
  }

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
        console.log('Đã chuẩn hóa occupiedSince cho bàn (v3).');
      }
    } catch (e) {
      console.error('Lỗi nâng cấp dữ liệu v3 (tables)', e);
    }
  }
}
