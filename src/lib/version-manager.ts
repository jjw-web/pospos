import { APP_CONFIG } from './config';
import { upgradeDataStructure } from './data-upgrader';

/**
 * Xử lý khi có phiên bản ứng dụng mới.
 * @param oldVersion Phiên bản cũ.
 * @param newVersion Phiên bản mới.
 */
function handleVersionUpgrade(oldVersion: string | null, newVersion: string) {
  console.log(`Nâng cấp phiên bản ứng dụng từ ${oldVersion || 'chưa có'} lên ${newVersion}`);
  // Set localStorage TRƯỚC khi reload — nếu set sau thì không bao giờ chạy được
  localStorage.setItem('app_version', newVersion);
  alert(`Đã cập nhật lên phiên bản ${newVersion}. Ứng dụng sẽ tự động tải lại.`);
  window.location.reload();
}

/**
 * Kiểm tra phiên bản ứng dụng và dữ liệu, thực hiện nâng cấp nếu cần.
 */
export function checkVersion() {
  const currentAppVersion = localStorage.getItem('app_version');
  const currentDataVersion = localStorage.getItem('data_version');
  const parsedDataVersion = currentDataVersion ? parseInt(currentDataVersion, 10) : null;

  let versionChanged = false;
  let dataChanged = false;

  // 1. Kiểm tra phiên bản ứng dụng (App Version)
  if (currentAppVersion !== APP_CONFIG.version) {
    handleVersionUpgrade(currentAppVersion, APP_CONFIG.version);
    // localStorage.setItem đã được xử lý trong handleVersionUpgrade
    versionChanged = true;
  }

  // 2. Kiểm tra phiên bản dữ liệu (Data Version)
  if (parsedDataVersion === null || parsedDataVersion < APP_CONFIG.dataVersion) {
    upgradeDataStructure(parsedDataVersion, APP_CONFIG.dataVersion);
    localStorage.setItem('data_version', APP_CONFIG.dataVersion.toString());
    dataChanged = true;
  }

  if (versionChanged || dataChanged) {
    console.log('Hoàn tất kiểm tra phiên bản. Phiên bản hiện tại:', {
      app: APP_CONFIG.version,
      data: APP_CONFIG.dataVersion,
    });
  }
}
