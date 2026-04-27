/**
 * IndexedDB wrapper for Bống Cà Phê POS
 * Replaces localStorage with more robust storage
 */

const DB_NAME = 'bong-ca-phe-pos';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

async function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains('keyval')) {
        database.createObjectStore('keyval', { keyPath: 'key' });
      }
    };
  });
}

async function getItem<T>(key: string): Promise<T | null> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('keyval', 'readonly');
    const store = transaction.objectStore('keyval');
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const result = request.result as { key: string; value: T } | undefined;
      resolve(result?.value ?? null);
    };
  });
}

async function setItem<T>(key: string, value: T): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('keyval', 'readwrite');
    const store = transaction.objectStore('keyval');
    const request = store.put({ key, value });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function removeItem(key: string): Promise<void> {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('keyval', 'readwrite');
    const store = transaction.objectStore('keyval');
    const request = store.delete(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
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
  APP_VERSION: 'app_version',
  DATA_VERSION: 'data_version',
  THEME: 'pos_app_theme',
} as const;