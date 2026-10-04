import { useState, useCallback, useEffect, useRef } from 'react';
import type { Bill } from '../types';
import { DB_KEYS } from '../lib/db';
import {
  isBillArray,
  persistWithBackup,
  readWithFallbackValidated,
} from '../lib/safe-storage';
import { ensureStorageReady } from '../lib/version-manager';

/**
 * Load history: đọc bản MỚI NHẤT trong 3 lớp, kèm validate shape.
 * Nâng cấp dữ liệu luôn chạy trước qua ensureStorageReady.
 */
async function loadHistoryFromDB(): Promise<Bill[]> {
  await ensureStorageReady();

  const result = await readWithFallbackValidated(DB_KEYS.HISTORY, isBillArray);
  if (!result) {
    console.error('[useHistoryManager] Khong co ban ghi lich su hop le, dung lich su rong.');
  }
  return result?.value ?? [];
}

export function useHistoryManager() {
  const [history, setHistory] = useState<Bill[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const lastPersistedHistoryRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadHistoryFromDB().then((dbHistory) => {
      if (cancelled) return;
      lastPersistedHistoryRef.current = JSON.stringify(dbHistory);
      setHistory(dbHistory);
      setIsLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist TAP TRUNG tai day — updater ben duoi phai thuan (pure).
  // Ghi [] sau "Xoa toan bo" la ban moi nhat hop le, phai thang ban cu (Phase 3
  // so sanh theo savedAt/revision) — khong them logic "rong thi thu lop khac".
  useEffect(() => {
    if (!isLoaded) return;
    const serialized = JSON.stringify(history);
    if (serialized === lastPersistedHistoryRef.current) return;
    lastPersistedHistoryRef.current = serialized;
    void persistWithBackup(DB_KEYS.HISTORY, serialized);
  }, [history, isLoaded]);

  const addBill = useCallback((bill: Bill) => {
    setHistory((prev) => [...prev, bill]);
  }, []);

  const deleteBills = useCallback((ids: number[]) => {
    setHistory((prev) => prev.filter((b) => !ids.includes(b.id)));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const removeBill = useCallback((billId: number) => {
    setHistory((prev) => prev.filter((b) => b.id !== billId));
  }, []);

  return { history, isLoaded, addBill, deleteBills, clearHistory, removeBill };
}
