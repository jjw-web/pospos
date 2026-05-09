import { useState, useCallback, useEffect } from 'react';
import type { MenuCategory } from '../types';
import { MENU_CATEGORIES } from '../../constants';
import { mergeMenuWithDefaults } from '../lib/merge-menu-defaults';
import { db, DB_KEYS } from '../lib/db';

/**
 * Load menu from IndexedDB only, merge with defaults.
 * Avoids double-render from sync localStorage + async DB loading race.
 */
async function loadMenuFromDB(): Promise<MenuCategory[]> {
  try {
    const saved = await db.getItem<string>(DB_KEYS.MENU_CATEGORIES);
    if (saved) {
      return mergeMenuWithDefaults(JSON.parse(saved) as MenuCategory[]);
    }
  } catch {
    // ignore — fall through to defaults
  }
  return MENU_CATEGORIES;
}

/**
 * Persist menu to localStorage (sync fallback) + IndexedDB (primary).
 */
async function persistMenuCategoriesAsync(categories: MenuCategory[]): Promise<void> {
  const value = JSON.stringify(categories);

  try {
    localStorage.setItem(DB_KEYS.MENU_CATEGORIES, value);
  } catch (err) {
    console.error('[useMenuManager] localStorage write failed:', err);
  }

  try {
    await db.setItem(DB_KEYS.MENU_CATEGORIES, value);
  } catch (err) {
    console.error('[useMenuManager] IndexedDB write failed:', err);
  }
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