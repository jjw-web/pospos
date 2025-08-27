import { TableData } from '../../types';

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

    // Nếu đang có 8 bàn, thêm 4 bàn mới
    if (tablesMap.size === 8) {
      console.log('Phát hiện 8 bàn, đang thêm 4 bàn mới...');
      for (let i = 9; i <= 12; i++) {
        tablesMap.set(i, {
          id: i,
          name: `Bàn ${i}`,
          layout: 'Inside', // Giả định layout mặc định
          status: 'available',
          order: [],
        });
      }
      
      // Lưu lại dữ liệu đã cập nhật theo đúng định dạng Map.entries()
      const newTableEntries = Array.from(tablesMap.entries());
      localStorage.setItem('tables', JSON.stringify(newTableEntries));
      console.log('Đã thêm 4 bàn mới. Tổng số bàn hiện tại:', tablesMap.size);
    }
  }

  // Thêm các điều kiện `else if` khác ở đây cho các lần nâng cấp trong tương lai
  // else if (oldVersion < 3 && newVersion >= 3) { ... }
}
