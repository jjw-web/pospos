import { useState, useCallback, useEffect } from 'react';
import type { MenuCategory } from '../types';
import { MENU_CATEGORIES } from '../../constants';
import { mergeMenuWithDefaults } from '../lib/merge-menu-defaults';
import { db, DB_KEYS } from '../lib/db';

function loadMenuCategories(): MenuCategory[] {
  try {
    const saved = localStorage.getItem(DB_KEYS.MENU_CATEGORIES);
    if (!saved) return MENU_CATEGORIES;
    return mergeMenuWithDefaults(JSON.parse(saved) as MenuCategory[]);
  } catch {
    return MENU_CATEGORIES;
  }
}

async function persistMenuCategoriesAsync(categories: MenuCategory[]): Promise<void> {
  const value = JSON.stringify(categories);
  localStorage.setItem(DB_KEYS.MENU_CATEGORIES, value);
  await db.setItem(DB_KEYS.MENU_CATEGORIES, value);
}

async function loadMenuFromDB(): Promise<MenuCategory[] | null> {
  try {
    const saved = await db.getItem<string>(DB_KEYS.MENU_CATEGORIES);
    if (saved) {
      return mergeMenuWithDefaults(JSON.parse(saved) as MenuCategory[]);
    }
  } catch {
    // ignore errors
  }
  return null;
}

export function useMenuManager() {
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>(loadMenuCategories);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadMenuFromDB().then((dbMenu) => {
      if (dbMenu) {
        setMenuCategories(dbMenu);
      }
      setIsLoaded(true);
    });
  }, []);

  const updateMenuCategories = useCallback((categories: MenuCategory[]) => {
    setMenuCategories(categories);
    persistMenuCategoriesAsync(categories);
  }, []);

  return { menuCategories, updateMenuCategories };
}