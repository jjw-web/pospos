import { APP_CONFIG } from './config';
import { upgradeDataStructure } from './data-upgrader';

/**
 * Hiển thị thông báo cập nhật cho người dùng.
 * @param message Nội dung thông báo.
 */
function showUpdateNotification(message: string) {
  // Tạm thời dùng alert, sau này có thể thay bằng một component UI đẹp hơn
  alert(message);
}

/**
 * Xử lý khi có phiên bản ứng dụng mới.
 * @param oldVersion Phiên bản cũ.
 * @param newVersion Phiên bản mới.
 */
function handleVersionUpgrade(oldVersion: string | null, newVersion: string) {
  console.log(`Nâng cấp phiên bản ứng dụng từ ${oldVersion || 'chưa có'} lên ${newVersion}`);
  // Service worker được quản lý bởi vite-plugin-pwa với chế độ autoUpdate
  // sẽ tự động xóa cache cũ và tải phiên bản mới.
  // Nếu cần xóa các loại cache khác (vd: cache API), có thể thêm logic ở đây.
  showUpdateNotification(`Ứng dụng đã được cập nhật lên phiên bản ${newVersion}.`);
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
    localStorage.setItem('app_version', APP_CONFIG.version);
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
      data: APP_CONFIG.dataVersion
    });
  }
}
