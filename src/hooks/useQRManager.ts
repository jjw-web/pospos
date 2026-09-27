import { useState, useCallback, useEffect } from 'react';
import type { QRAccount, TransferHistoryItem } from '../types';
import { DB_KEYS } from '../lib/db';
import {
  isQRAccountArray,
  isStringArray,
  isTransferHistoryArray,
  parseValidatedJSON,
  persistWithBackup,
  readWithFallback,
} from '../lib/safe-storage';

const MAX_HISTORY = 20;

async function loadValidated<T>(
  key: string,
  validate: (v: unknown) => v is T,
  fallback: T,
  tag: string
): Promise<T> {
  const raw = await readWithFallback(key);
  const parsed = parseValidatedJSON(raw, validate);
  if (raw && !parsed) {
    console.error(`[useQRManager] ${tag} failed validation, using fallback.`);
  }
  return parsed ?? fallback;
}

/**
 * Quản lý tab Pics (QR tự thêm + ẩn QR mặc định) và lịch sử STK tab Cash.
 * Load 3 lớp fallback + validate shape, persist kèm xoay backup —
 * cùng pattern với useMenuManager để IPA offline không mất data.
 */
export function useQRManager() {
  const [customQRs, setCustomQRs] = useState<QRAccount[]>([]);
  const [hiddenDefaults, setHiddenDefaults] = useState<string[]>([]);
  const [transferHistory, setTransferHistory] = useState<TransferHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      loadValidated(DB_KEYS.CUSTOM_QR, isQRAccountArray, [], 'customQRs'),
      loadValidated(DB_KEYS.HIDDEN_DEFAULT_QR, isStringArray, [], 'hiddenDefaults'),
      loadValidated(DB_KEYS.TRANSFER_HISTORY, isTransferHistoryArray, [], 'transferHistory'),
    ]).then(([qr, hidden, hist]) => {
      setCustomQRs(qr);
      setHiddenDefaults(hidden);
      setTransferHistory(hist);
      setIsLoaded(true);
    });
  }, []);

  const addCustomQR = useCallback((qr: QRAccount) => {
    setCustomQRs((prev) => {
      const next = [...prev, qr];
      persistWithBackup(DB_KEYS.CUSTOM_QR, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeCustomQR = useCallback((id: string) => {
    setCustomQRs((prev) => {
      const next = prev.filter((qr) => qr.id !== id);
      persistWithBackup(DB_KEYS.CUSTOM_QR, JSON.stringify(next));
      return next;
    });
  }, []);

  const hideDefaultQR = useCallback((name: string) => {
    setHiddenDefaults((prev) => {
      if (prev.includes(name)) return prev;
      const next = [...prev, name];
      persistWithBackup(DB_KEYS.HIDDEN_DEFAULT_QR, JSON.stringify(next));
      return next;
    });
  }, []);

  const restoreDefaults = useCallback(() => {
    setHiddenDefaults([]);
    persistWithBackup(DB_KEYS.HIDDEN_DEFAULT_QR, JSON.stringify([]));
  }, []);

  const pushTransferHistory = useCallback((item: TransferHistoryItem) => {
    setTransferHistory((prev) => {
      const withoutDup = prev.filter(
        (h) => !(h.bankBin === item.bankBin && h.accountNumber === item.accountNumber)
      );
      const next = [item, ...withoutDup].slice(0, MAX_HISTORY);
      persistWithBackup(DB_KEYS.TRANSFER_HISTORY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeTransferHistory = useCallback((bankBin: string, accountNumber: string) => {
    setTransferHistory((prev) => {
      const next = prev.filter(
        (h) => !(h.bankBin === bankBin && h.accountNumber === accountNumber)
      );
      persistWithBackup(DB_KEYS.TRANSFER_HISTORY, JSON.stringify(next));
      return next;
    });
  }, []);

  return {
    customQRs,
    hiddenDefaults,
    transferHistory,
    isLoaded,
    addCustomQR,
    removeCustomQR,
    hideDefaultQR,
    restoreDefaults,
    pushTransferHistory,
    removeTransferHistory,
  };
}
