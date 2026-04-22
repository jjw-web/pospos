import { useState, useCallback } from 'react';
import type { Bill } from '../types';

function loadHistory(): Bill[] {
  try {
    const saved = localStorage.getItem('history');
    return saved ? (JSON.parse(saved) as Bill[]) : [];
  } catch {
    return [];
  }
}

function persistHistory(history: Bill[]): void {
  localStorage.setItem('history', JSON.stringify(history));
}

export function useHistoryManager() {
  const [history, setHistory] = useState<Bill[]>(loadHistory);

  const addBill = useCallback((bill: Bill) => {
    setHistory((prev) => {
      const next = [...prev, bill];
      persistHistory(next);
      return next;
    });
  }, []);

  const deleteBills = useCallback((ids: number[]) => {
    setHistory((prev) => {
      const next = prev.filter((b) => !ids.includes(b.id));
      persistHistory(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    persistHistory([]);
  }, []);

  const removeBill = useCallback((billId: number) => {
    setHistory((prev) => {
      const next = prev.filter((b) => b.id !== billId);
      persistHistory(next);
      return next;
    });
  }, []);

  return { history, addBill, deleteBills, clearHistory, removeBill };
}
