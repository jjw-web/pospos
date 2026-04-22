import { useState, useCallback } from 'react';
import type { MenuCategory } from '../types';
import { MENU_CATEGORIES } from '../../constants';
import { mergeMenuWithDefaults } from '../lib/merge-menu-defaults';

function loadMenuCategories(): MenuCategory[] {
  try {
    const saved = localStorage.getItem('menuCategories');
    if (!saved) return MENU_CATEGORIES;
    return mergeMenuWithDefaults(JSON.parse(saved) as MenuCategory[]);
  } catch {
    return MENU_CATEGORIES;
  }
}

function persistMenuCategories(categories: MenuCategory[]): void {
  localStorage.setItem('menuCategories', JSON.stringify(categories));
}

export function useMenuManager() {
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>(loadMenuCategories);

  const updateMenuCategories = useCallback((categories: MenuCategory[]) => {
    setMenuCategories(categories);
    persistMenuCategories(categories);
  }, []);

  return { menuCategories, updateMenuCategories };
}
