import { APP_CONFIG } from './config';
import { upgradeTablesPayload } from './data-upgrader';
import { db, DB_KEYS } from './db';
import {
  BACKUP_SUFFIX,
  isTableEntries,
  persistWithBackup,
  readWithFallbackValidated,
} from './safe-storage';

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
    void db.setItem(DB_KEYS.APP_VERSION, APP_CONFIG.version).catch(() => {
      // IndexedDB lỗi cũng vẫn reload — banner version không phải đường dữ liệu
    });
  } catch {
    // ignore storage errors
  }
  window.location.reload();
}

let storageReadyPromise: Promise<void> | null = null;

/**
 * Diem khoi dong storage duy nhat. Moi hook phai await ham nay truoc khi
 * doc du lieu, de nang cap du lieu luon chay truoc va chi chay 1 lan.
 */
export function ensureStorageReady(): Promise<void> {
  if (!storageReadyPromise) {
    storageReadyPromise = (async () => {
      await snapshotBeforeFirstMigration();
      await checkVersion();
    })().catch((err) => {
      // Khong duoc de unhandled rejection lam trang man hinh tren WKWebView.
      // Load du lieu van tiep tuc bang ban thang hien co.
      console.error('[version-manager] ensureStorageReady failed:', err);
    });
  }
  return storageReadyPromise;
}

async function readDataVersion(): Promise<number | null> {
  const versions: number[] = [];
  try {
    const fromLS = localStorage.getItem(DB_KEYS.DATA_VERSION);
    if (fromLS) {
      const parsed = parseInt(fromLS, 10);
      if (!Number.isNaN(parsed)) versions.push(parsed);
    }
  } catch {
    // bo qua — thu tiep IndexedDB
  }
  try {
    const fromDB = await db.getItem<string>(DB_KEYS.DATA_VERSION);
    if (fromDB) {
      const parsed = parseInt(fromDB, 10);
      if (!Number.isNaN(parsed)) versions.push(parsed);
    }
  } catch {
    // bo qua
  }
  return versions.length > 0 ? Math.max(...versions) : null;
}

/**
 * Kiem tra phien ban du lieu va nang cap neu can.
 * Chi tang data_version SAU KHI ghi ban nang cap thanh cong.
 * Ham nay khong bao gio reject (moi loi deu duoc catch ben trong).
 */
export async function checkVersion(): Promise<void> {
  try {
    const currentDataVersion = await readDataVersion();

    if (currentDataVersion !== null && currentDataVersion >= APP_CONFIG.dataVersion) {
      return; // Da o phien ban moi nhat
    }

    // Doc BAN THANG cua tables (chua heal — ban nang cap sap ghi se la moi nhat)
    const result = await readWithFallbackValidated(DB_KEYS.TABLES, isTableEntries, {
      heal: false,
    });

    if (result) {
      const upgradedPayload = upgradeTablesPayload(
        result.candidate.payload,
        currentDataVersion,
        APP_CONFIG.dataVersion
      );
      if (upgradedPayload !== result.candidate.payload) {
        await persistWithBackup(DB_KEYS.TABLES, upgradedPayload);
      }
    }

    // Chi danh dau da nang cap SAU khi ghi xong (hoac khong co gi de ghi)
    try {
      localStorage.setItem(DB_KEYS.DATA_VERSION, APP_CONFIG.dataVersion.toString());
    } catch (err) {
      console.error('[version-manager] localStorage data_version write failed:', err);
    }
    try {
      await db.setItem(DB_KEYS.DATA_VERSION, APP_CONFIG.dataVersion.toString());
    } catch (err) {
      console.error('[version-manager] IndexedDB data_version write failed:', err);
    }
  } catch (err) {
    console.error('[version-manager] checkVersion failed:', err);
  }
}

const PREMIGRATION_KEYS: Array<{
  key: (typeof DB_KEYS)[keyof typeof DB_KEYS];
  suffixes: { indexedDB: string; localStorage: string; localStorageBackup: string };
}> = [
  {
    key: DB_KEYS.TABLES,
    suffixes: {
      indexedDB: 'tables_premigration_idb',
      localStorage: 'tables_premigration_ls',
      localStorageBackup: 'tables_premigration_backup',
    },
  },
  {
    key: DB_KEYS.HISTORY,
    suffixes: {
      indexedDB: 'history_premigration_idb',
      localStorage: 'history_premigration_ls',
      localStorageBackup: 'history_premigration_backup',
    },
  },
];

/**
 * Chup nguyen trang 3 ung vien cua tables/history truoc lan migrate dau tien.
 * Chi tao key khi chua ton tai — khong bao gio ghi de o cac lan mo sau.
 * Khong duoc xoa hay sua cac key nay trong code van hanh binh thuong.
 */
async function snapshotBeforeFirstMigration(): Promise<void> {
  for (const { key, suffixes } of PREMIGRATION_KEYS) {
    try {
      if (localStorage.getItem(suffixes.indexedDB) === null) {
        const fromDB = await db.getItem<string>(key);
        if (fromDB) localStorage.setItem(suffixes.indexedDB, fromDB);
      }
    } catch (err) {
      console.error(`[version-manager] snapshot IndexedDB failed for ${key}:`, err);
    }
    try {
      if (localStorage.getItem(suffixes.localStorage) === null) {
        const fromLS = localStorage.getItem(key);
        if (fromLS) localStorage.setItem(suffixes.localStorage, fromLS);
      }
    } catch (err) {
      console.error(`[version-manager] snapshot localStorage failed for ${key}:`, err);
    }
    try {
      if (localStorage.getItem(suffixes.localStorageBackup) === null) {
        const fromBackup = localStorage.getItem(key + BACKUP_SUFFIX);
        if (fromBackup) localStorage.setItem(suffixes.localStorageBackup, fromBackup);
      }
    } catch (err) {
      console.error(`[version-manager] snapshot backup failed for ${key}:`, err);
    }
  }
}
