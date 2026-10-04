/**
 * IndexedDB wrapper for Bống Cà Phê POS
 * Replaces localStorage with more robust storage
 *
 * Fix rollback P0 (theo HUONG-DAN-FIX-MAT-DU-LIEU + Fix_Rollback_Bug_Guide):
 * - Ghi chỉ resolve tại transaction.oncomplete (commit thật xuống đĩa),
 *   không resolve sớm tại request.onsuccess như trước.
 * - Kết nối chết (WKWebView suspend/kill) tự mở lại ở lần gọi sau
 *   qua onclose/onversionchange + reset khi transaction() ném đồng bộ.
 * - Các lần openDB() đồng thời gộp chung một openPromise.
 */

const DB_NAME = 'bong-ca-phe-pos';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;
let openPromise: Promise<IDBDatabase> | null = null;

function resetDBConnection(): void {
  try {
    dbInstance?.close();
  } catch {
    // Kết nối có thể đã đóng — bỏ qua
  }
  dbInstance = null;
  openPromise = null;
}

async function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;
  if (openPromise) return openPromise;

  openPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      openPromise = null;
      reject(request.error);
    };
    request.onblocked = () => {
      openPromise = null;
      reject(new Error('[db] indexedDB.open bị blocked bởi kết nối khác'));
    };
    request.onsuccess = () => {
      const database = request.result;
      dbInstance = database;

      // Kết nối bị đóng bất ngờ (iOS kill tiến trình IDB, storage pressure...)
      // -> lần gọi sau phải mở kết nối mới thay vì dùng kết nối chết cả ngày.
      database.onclose = () => {
        if (dbInstance === database) {
          dbInstance = null;
          openPromise = null;
        }
      };
      database.onversionchange = () => {
        try {
          database.close();
        } catch {
          // bỏ qua
        }
        if (dbInstance === database) {
          dbInstance = null;
          openPromise = null;
        }
      };

      resolve(database);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains('keyval')) {
        database.createObjectStore('keyval', { keyPath: 'key' });
      }
    };
  });

  return openPromise;
}

async function getItem<T>(key: string): Promise<T | null> {
  const database = await openDB();
  return new Promise<T | null>((resolve, reject) => {
    let transaction: IDBTransaction;
    try {
      transaction = database.transaction('keyval', 'readonly');
    } catch (err) {
      resetDBConnection();
      reject(err);
      return;
    }
    const store = transaction.objectStore('keyval');
    const request = store.get(key);

    let resultValue: T | null = null;
    let requestError: unknown = null;
    request.onerror = () => {
      requestError = request.error;
    };
    request.onsuccess = () => {
      const result = request.result as { key: string; value: T } | undefined;
      resultValue = result?.value ?? null;
    };
    transaction.oncomplete = () => resolve(resultValue);
    transaction.onerror = () => reject(transaction.error ?? requestError);
    transaction.onabort = () => reject(transaction.error ?? requestError);
  });
}

async function setItem<T>(key: string, value: T): Promise<void> {
  const database = await openDB();
  return new Promise<void>((resolve, reject) => {
    let transaction: IDBTransaction;
    try {
      transaction = database.transaction('keyval', 'readwrite');
    } catch (err) {
      // Kết nối đã chết (InvalidStateError...) — reset để lần sau mở lại
      resetDBConnection();
      reject(err);
      return;
    }
    const store = transaction.objectStore('keyval');
    const request = store.put({ key, value });

    let requestError: unknown = null;
    request.onerror = () => {
      requestError = request.error;
    };
    // QUAN TRỌNG: Chỉ coi là ghi xong khi transaction COMMIT xong,
    // không resolve tại request.onsuccess như code cũ.
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? requestError);
    transaction.onabort = () => reject(transaction.error ?? requestError);
  });
}

async function removeItem(key: string): Promise<void> {
  const database = await openDB();
  return new Promise<void>((resolve, reject) => {
    let transaction: IDBTransaction;
    try {
      transaction = database.transaction('keyval', 'readwrite');
    } catch (err) {
      resetDBConnection();
      reject(err);
      return;
    }
    const store = transaction.objectStore('keyval');
    const request = store.delete(key);

    let requestError: unknown = null;
    request.onerror = () => {
      requestError = request.error;
    };
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? requestError);
    transaction.onabort = () => reject(transaction.error ?? requestError);
  });
}

export const db = {
  getItem,
  setItem,
  removeItem,
  openDB,
};

export const DB_KEYS = {
  TABLES: 'tables',
  CURRENT_SCREEN: 'currentScreen',
  SELECTED_TABLE_ID: 'selectedTableId',
  HISTORY: 'history',
  MENU_CATEGORIES: 'menuCategories',
  CUSTOM_QR: 'custom_qr_accounts',
  HIDDEN_DEFAULT_QR: 'hidden_default_qrs',
  TRANSFER_HISTORY: 'qr_transfer_history',
  APP_VERSION: 'app_version',
  DATA_VERSION: 'data_version',
  THEME: 'pos_app_theme',
} as const;
