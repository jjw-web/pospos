import { useState, useCallback, useEffect } from 'react';
import type { Bill } from '../types';
import { DB_KEYS } from '../lib/db';
import {
  isBillArray,
  parseValidatedJSON,
  persistWithBackup,
  readWithFallback,
} from '../lib/safe-storage';

/**
 * Load history qua 3 lớp fallback (IndexedDB → localStorage → backup),
 * kèm validate shape. Bản ghi hỏng bị bỏ qua thay vì làm mất lịch sử.
 */
async function loadHistoryFromDB(): Promise<Bill[]> {
  const raw = await readWithFallback(DB_KEYS.HISTORY);
  const parsed = parseValidatedJSON(raw, isBillArray);
  if (raw && !parsed) {
    console.error('[useHistoryManager] Stored history failed validation, using empty history.');
  }
  return parsed ?? [];
}

/**
 * Persist history kèm xoay vòng backup trước khi ghi đè.
 */
async function persistHistoryAsync(history: Bill[]): Promise<void> {
  await persistWithBackup(DB_KEYS.HISTORY, JSON.stringify(history));
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