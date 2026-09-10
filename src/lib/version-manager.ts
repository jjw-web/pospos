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
 */
export async function checkVersion() {
  const currentDataVersion = localStorage.getItem(DB_KEYS.DATA_VERSION);
  const parsedDataVersion = currentDataVersion ? parseInt(currentDataVersion, 10) : null;

  // Chỉ xử lý dataVersion ở đây; app version do getVersionUpdateInfo() + banner xử lý
  if (parsedDataVersion === null || parsedDataVersion < APP_CONFIG.dataVersion) {
    upgradeDataStructure(parsedDataVersion, APP_CONFIG.dataVersion);
    localStorage.setItem(DB_KEYS.DATA_VERSION, APP_CONFIG.dataVersion.toString());
    await db.setItem(DB_KEYS.DATA_VERSION, APP_CONFIG.dataVersion.toString());
  }
}
