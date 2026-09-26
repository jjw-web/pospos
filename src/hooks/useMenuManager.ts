import { useState, useCallback, useEffect } from 'react';
import type { MenuCategory } from '../types';
import { MENU_CATEGORIES } from '../../constants';
import { mergeMenuWithDefaults } from '../lib/merge-menu-defaults';
import { DB_KEYS } from '../lib/db';
import {
  isMenuCategoryArray,
  parseValidatedJSON,
  persistWithBackup,
  readWithFallback,
} from '../lib/safe-storage';

/**
 * Load menu qua 3 lớp fallback (IndexedDB → localStorage → backup),
 * kèm validate shape, rồi merge với defaults.
 */
async function loadMenuFromDB(): Promise<MenuCategory[]> {
  const raw = await readWithFallback(DB_KEYS.MENU_CATEGORIES);
  const parsed = parseValidatedJSON(raw, isMenuCategoryArray);
  if (raw && !parsed) {
    console.error('[useMenuManager] Stored menu failed validation, using defaults.');
  }
  if (parsed) {
    return mergeMenuWithDefaults(parsed);
  }
  return MENU_CATEGORIES;
}

/**
 * Persist menu kèm xoay vòng backup trước khi ghi đè.
 */
async function persistMenuCategoriesAsync(categories: MenuCategory[]): Promise<void> {
  await persistWithBackup(DB_KEYS.MENU_CATEGORIES, JSON.stringify(categories));
}

export function useMenuManager() {
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadMenuFromDB().then((dbMenu) => {
      setMenuCategories(dbMenu);
      setIsLoaded(true);
    });
  }, []);

  const updateMenuCategories = useCallback((categories: MenuCategory[]) => {
    setMenuCategories(categories);
    persistMenuCategoriesAsync(categories);
  }, []);

  return { menuCategories, isLoaded, updateMenuCategories };
}