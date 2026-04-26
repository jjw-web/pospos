import { useState, useCallback, useEffect } from 'react';
import type { Bill } from '../types';
import { db, DB_KEYS } from '../lib/db';

function loadHistory(): Bill[] {
  try {
    const saved = localStorage.getItem(DB_KEYS.HISTORY);
    return saved ? (JSON.parse(saved) as Bill[]) : [];
  } catch {
    return [];
  }
}

async function persistHistoryAsync(history: Bill[]): Promise<void> {
  const value = JSON.stringify(history);
  localStorage.setItem(DB_KEYS.HISTORY, value);
  await db.setItem(DB_KEYS.HISTORY, value);
}

async function loadHistoryFromDB(): Promise<Bill[] | null> {
  try {
    const saved = await db.getItem<string>(DB_KEYS.HISTORY);
    if (saved) {
      return JSON.parse(saved) as Bill[];
    }
  } catch {
    // ignore errors
  }
  return null;
}

export function useHistoryManager() {
  const [history, setHistory] = useState<Bill[]>(loadHistory);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadHistoryFromDB().then((dbHistory) => {
      if (dbHistory) {
        setHistory(dbHistory);
      }
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

  return { history, addBill, deleteBills, clearHistory, removeBill };
}