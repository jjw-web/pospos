import { useState, useCallback, useEffect } from 'react';
import type { Bill } from '../types';
import { db, DB_KEYS } from '../lib/db';

/**
 * Load history from IndexedDB only.
 * Avoids double-render from sync localStorage + async DB loading race.
 */
async function loadHistoryFromDB(): Promise<Bill[]> {
  try {
    const saved = await db.getItem<string>(DB_KEYS.HISTORY);
    if (saved) {
      return JSON.parse(saved) as Bill[];
    }
  } catch {
    // ignore — empty history on error
  }
  return [];
}

/**
 * Persist history to localStorage (sync fallback) + IndexedDB (primary).
 */
async function persistHistoryAsync(history: Bill[]): Promise<void> {
  const value = JSON.stringify(history);

  try {
    localStorage.setItem(DB_KEYS.HISTORY, value);
  } catch (err) {
    console.error('[useHistoryManager] localStorage write failed:', err);
  }

  try {
    await db.setItem(DB_KEYS.HISTORY, value);
  } catch (err) {
    console.error('[useHistoryManager] IndexedDB write failed:', err);
  }
}

export function useHistoryManager() {
  const [history, setHistory] = useState<Bill[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadHistoryFromDB().then((dbHistory) => {
      setHistory(dbHistory);
      setIsLoaded(true);
    });
  }, []);

  const addBill = useCallback((bill: Bill) => {
    setHistory((prev) => {
      const next = [...prev, bill];
      persistHistoryAsync(next);
      return next;
    });
  }, []);

  const deleteBills = useCallback((ids: number[]) => {
    setHistory((prev) => {
      const next = prev.filter((b) => !ids.includes(b.id));
      persistHistoryAsync(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    persistHistoryAsync([]);
  }, []);

  const removeBill = useCallback((billId: number) => {
    setHistory((prev) => {
      const next = prev.filter((b) => b.id !== billId);
      persistHistoryAsync(next);
      return next;
    });
  }, []);

  return { history, isLoaded, addBill, deleteBills, clearHistory, removeBill };
}