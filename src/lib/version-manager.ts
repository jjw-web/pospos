import { APP_CONFIG } from './config';
import { upgradeDataStructure } from './data-upgrader';
import { db, DB_KEYS } from './db';

/**
 * Xử lý khi có phiên bản ứng dụng mới.
 * @param oldVersion Phiên bản cũ.
 * @param newVersion Phiên bản mới.
 */
function handleVersionUpgrade(oldVersion: string | null, newVersion: string) {
  localStorage.setItem(DB_KEYS.APP_VERSION, newVersion);
  db.setItem(DB_KEYS.APP_VERSION, newVersion);
  alert(`Đã cập nhật lên phiên bản ${newVersion}. Ứng dụng sẽ tự động tải lại.`);
  window.location.reload();
}

/**
 * Kiểm tra phiên bản ứng dụng và dữ liệu, thực hiện nâng cấp nếu cần.
 */
export async function checkVersion() {
  const currentAppVersion = localStorage.getItem(DB_KEYS.APP_VERSION);
  const currentDataVersion = localStorage.getItem(DB_KEYS.DATA_VERSION);
  const parsedDataVersion = currentDataVersion ? parseInt(currentDataVersion, 10) : null;

  let versionChanged = false;
  let dataChanged = false;

  // 1. Kiểm tra phiên bản ứng dụng (App Version)
  if (currentAppVersion !== APP_CONFIG.version) {
    handleVersionUpgrade(currentAppVersion, APP_CONFIG.version);
    versionChanged = true;
  }

  // 2. Kiểm tra phiên bản dữ liệu (Data Version)
  if (parsedDataVersion === null || parsedDataVersion < APP_CONFIG.dataVersion) {
    upgradeDataStructure(parsedDataVersion, APP_CONFIG.dataVersion);
    localStorage.setItem(DB_KEYS.DATA_VERSION, APP_CONFIG.dataVersion.toString());
    await db.setItem(DB_KEYS.DATA_VERSION, APP_CONFIG.dataVersion.toString());
    dataChanged = true;
  }

  if (versionChanged || dataChanged) {
    // Version check completed
  }
}
