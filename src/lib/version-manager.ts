import { APP_CONFIG } from './config';
import { upgradeDataStructure } from './data-upgrader';
import { db, DB_KEYS } from './db';

/**
 * Kiểm tra xem có bản cập nhật app mới không (so sánh localStorage vs bundle).
 * Không tự reload — để App.tsx hiển thị banner cho user bấm cập nhật (WKWebView-safe).
 */
export function getVersionUpdateInfo(): {
  hasUpdate: boolean;
  oldVersion: string | null;
  newVersion: string;
} {
  try {
    const current = localStorage.getItem(DB_KEYS.APP_VERSION);
    return {
      hasUpdate: current !== APP_CONFIG.version,
      oldVersion: current,
      newVersion: APP_CONFIG.version,
    };
  } catch {
    return { hasUpdate: false, oldVersion: null, newVersion: APP_CONFIG.version };
  }
}

/**
 * Áp dụng cập nhật version: lưu storage rồi reload trang.
 */
export function applyVersionUpdate(): void {
  try {
    localStorage.setItem(DB_KEYS.APP_VERSION, APP_CONFIG.version);
    db.setItem(DB_KEYS.APP_VERSION, APP_CONFIG.version);
  } catch {
    // ignore storage errors
  }
  window.location.reload();
}

/**
 * Kiểm tra phiên bản dữ liệu và thực hiện nâng cấp nếu cần.
 * Không còn tự reload cho app version — app version do App.tsx banner xử lý.
 * Toàn bộ lỗi storage được catch bên trong — hàm này không bao giờ reject,
 * tránh unhandled rejection làm trắng màn trên iOS WKWebView.
 */
export async function checkVersion(): Promise<void> {
  try {
    const currentDataVersion = localStorage.getItem(DB_KEYS.DATA_VERSION);
    const parsedDataVersion = currentDataVersion ? parseInt(currentDataVersion, 10) : null;

    // Chỉ xử lý dataVersion ở đây; app version do getVersionUpdateInfo() + banner xử lý
    if (parsedDataVersion === null || parsedDataVersion < APP_CONFIG.dataVersion) {
      upgradeDataStructure(parsedDataVersion, APP_CONFIG.dataVersion);
      localStorage.setItem(DB_KEYS.DATA_VERSION, APP_CONFIG.dataVersion.toString());
      // Hooks chỉ đọc IndexedDB — mirror bảng đã upgrade sang IDB,
      // nếu không upgrade sẽ bị mất và không bao giờ chạy lại (DATA_VERSION đã bump)
      try {
        const tables = localStorage.getItem(DB_KEYS.TABLES);
        if (tables) {
          await db.setItem(DB_KEYS.TABLES, tables);
        }
        await db.setItem(DB_KEYS.DATA_VERSION, APP_CONFIG.dataVersion.toString());
      } catch (err) {
        console.error('[version-manager] IndexedDB mirror failed:', err);
      }
    }
  } catch (err) {
    console.error('[version-manager] checkVersion failed:', err);
  }
}
