import { APP_CONFIG } from './config';
import { upgradeDataStructure } from './data-upgrader';
import { db, DB_KEYS } from './db';

/**
 * Hiển thị toast thông báo cập nhật bằng DOM thuần — tương thích WKWebView
 * (không dùng alert/confirm native). Toast tự biến mất sau khi reload.
 */
function showVersionUpdateToast(newVersion: string): void {
  try {
    const existing = document.getElementById('version-update-toast');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.id = 'version-update-toast';
    el.setAttribute('role', 'status');
    el.textContent = `Đã cập nhật lên phiên bản ${newVersion} — đang tải lại...`;
    el.style.position = 'fixed';
    el.style.left = '50%';
    el.style.bottom = 'calc(88px + env(safe-area-inset-bottom, 0px))';
    el.style.transform = 'translateX(-50%)';
    el.style.zIndex = '9999';
    el.style.maxWidth = 'min(90vw, 360px)';
    el.style.padding = '12px 18px';
    el.style.borderRadius = '12px';
    el.style.backgroundColor = 'rgba(30, 41, 59, 0.95)';
    el.style.color = '#f8fafc';
    el.style.fontSize = '15px';
    el.style.fontWeight = '500';
    el.style.textAlign = 'center';
    el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.25)';
    el.style.pointerEvents = 'none';
    document.body.appendChild(el);
  } catch {
    // ignore DOM errors (e.g. body not ready)
  }
}

/**
 * Xử lý khi có phiên bản ứng dụng mới.
 * @param oldVersion Phiên bản cũ.
 * @param newVersion Phiên bản mới.
 */
function handleVersionUpgrade(oldVersion: string | null, newVersion: string): never {
  localStorage.setItem(DB_KEYS.APP_VERSION, newVersion);
  db.setItem(DB_KEYS.APP_VERSION, newVersion);
  showVersionUpdateToast(newVersion);
  // Delay reload để user kịp đọc thông báo (WKWebView-safe, không dùng alert)
  window.setTimeout(() => window.location.reload(), 1800);
  throw new Error('App reloading');
}

/**
 * Kiểm tra phiên bản ứng dụng và dữ liệu, thực hiện nâng cấp nếu cần.
 */
export async function checkVersion() {
  const currentAppVersion = localStorage.getItem(DB_KEYS.APP_VERSION);
  const currentDataVersion = localStorage.getItem(DB_KEYS.DATA_VERSION);
  const parsedDataVersion = currentDataVersion ? parseInt(currentDataVersion, 10) : null;

  if (currentAppVersion !== APP_CONFIG.version) {
    handleVersionUpgrade(currentAppVersion, APP_CONFIG.version);
  }

  if (parsedDataVersion === null || parsedDataVersion < APP_CONFIG.dataVersion) {
    upgradeDataStructure(parsedDataVersion, APP_CONFIG.dataVersion);
    localStorage.setItem(DB_KEYS.DATA_VERSION, APP_CONFIG.dataVersion.toString());
    await db.setItem(DB_KEYS.DATA_VERSION, APP_CONFIG.dataVersion.toString());
  }
}
