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

export interface ImportQRResult {
  added: number;
  skipped: number;
  error?: string;
}

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

  /**
   * Nhập danh sách QR từ chuỗi JSON (dán từ máy khác / lão gia gửi).
   * Validate shape, bỏ qua mục trùng id hoặc trùng tên.
   * @param jsonText - Chuỗi JSON mảng QRAccount
   * @returns Số mục đã thêm / bỏ qua / lỗi (message tiếng Việt)
   */
  const importCustomQRs = useCallback(
    (jsonText: string): ImportQRResult => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(jsonText);
      } catch {
        return { added: 0, skipped: 0, error: 'Chuỗi JSON không đúng.' };
      }
      if (!isQRAccountArray(parsed)) {
        return { added: 0, skipped: 0, error: 'JSON không phải danh sách QR.' };
      }
      const existingIds = new Set(customQRs.map((q) => q.id));
      const existingNames = new Set(customQRs.map((q) => q.name.toLowerCase()));
      const fresh = parsed.filter(
        (q) => !existingIds.has(q.id) && !existingNames.has(q.name.toLowerCase())
      );
      const next = [...customQRs, ...fresh];
      setCustomQRs(next);
      void persistWithBackup(DB_KEYS.CUSTOM_QR, JSON.stringify(next));
      return { added: fresh.length, skipped: parsed.length - fresh.length };
    },
    [customQRs]
  );

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
    importCustomQRs,
  };
}
