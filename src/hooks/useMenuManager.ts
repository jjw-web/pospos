import { useState, useCallback, useEffect, useRef } from 'react';
import type { MenuCategory } from '../types';
import { MENU_CATEGORIES } from '../../constants';
import { mergeMenuWithDefaults } from '../lib/merge-menu-defaults';
import { DB_KEYS } from '../lib/db';
import {
  isMenuCategoryArray,
  persistWithBackup,
  readWithFallbackValidated,
} from '../lib/safe-storage';
import { ensureStorageReady } from '../lib/version-manager';

/**
 * Load menu: đọc bản MỚI NHẤT trong 3 lớp, kèm validate shape,
 * rồi merge với defaults. Nâng cấp dữ liệu luôn chạy trước qua ensureStorageReady.
 */
async function loadMenuFromDB(): Promise<MenuCategory[]> {
  await ensureStorageReady();

  const result = await readWithFallbackValidated(DB_KEYS.MENU_CATEGORIES, isMenuCategoryArray);
  if (!result) {
    console.error('[useMenuManager] Khong co ban ghi menu hop le, dung menu mac dinh.');
    return MENU_CATEGORIES;
  }
  return mergeMenuWithDefaults(result.value);
}

export function useMenuManager() {
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const lastPersistedMenuRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadMenuFromDB().then((dbMenu) => {
      if (cancelled) return;
      // Ref ghi nho menu DA merge (khong phai chuoi tho), tranh ghi thua sau load
      lastPersistedMenuRef.current = JSON.stringify(dbMenu);
      setMenuCategories(dbMenu);
      setIsLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist TAP TRUNG tai day — updater ben duoi phai thuan (pure)
  useEffect(() => {
    if (!isLoaded) return;
    const serialized = JSON.stringify(menuCategories);
    if (serialized === lastPersistedMenuRef.current) return;
    lastPersistedMenuRef.current = serialized;
    void persistWithBackup(DB_KEYS.MENU_CATEGORIES, serialized);
  }, [menuCategories, isLoaded]);

  const updateMenuCategories = useCallback((categories: MenuCategory[]) => {
    setMenuCategories(categories); // persist do effect o tren dam nhiem
  }, []);

  return { menuCategories, isLoaded, updateMenuCategories };
}
