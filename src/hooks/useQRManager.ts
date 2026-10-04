import { useState, useCallback, useEffect, useRef } from 'react';
import type { QRAccount, TransferHistoryItem } from '../types';
import { DB_KEYS } from '../lib/db';
import {
  isQRAccountArray,
  isStringArray,
  isTransferHistoryArray,
  persistWithBackup,
  readWithFallbackValidated,
} from '../lib/safe-storage';
import { ensureStorageReady } from '../lib/version-manager';

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
  await ensureStorageReady();

  const result = await readWithFallbackValidated(key, validate);
  if (!result) {
    console.error(`[useQRManager] ${tag} khong co ban ghi hop le, dung fallback.`);
  }
  return result?.value ?? fallback;
}

/**
 * Quản lý tab Pics (QR tự thêm + ẩn QR mặc định) và lịch sử STK tab Cash.
 * Load bản mới nhất 3 lớp + validate shape, persist qua useEffect —
 * cùng pattern với useMenuManager để IPA offline không mất data.
 */
export function useQRManager() {
  const [customQRs, setCustomQRs] = useState<QRAccount[]>([]);
  const [hiddenDefaults, setHiddenDefaults] = useState<string[]>([]);
  const [transferHistory, setTransferHistory] = useState<TransferHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const lastPersistedCustomQRRef = useRef<string | null>(null);
  const lastPersistedHiddenRef = useRef<string | null>(null);
  const lastPersistedTransferRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      loadValidated(DB_KEYS.CUSTOM_QR, isQRAccountArray, [], 'customQRs'),
      loadValidated(DB_KEYS.HIDDEN_DEFAULT_QR, isStringArray, [], 'hiddenDefaults'),
      loadValidated(DB_KEYS.TRANSFER_HISTORY, isTransferHistoryArray, [], 'transferHistory'),
    ]).then(([qr, hidden, hist]) => {
      if (cancelled) return;
      lastPersistedCustomQRRef.current = JSON.stringify(qr);
      lastPersistedHiddenRef.current = JSON.stringify(hidden);
      lastPersistedTransferRef.current = JSON.stringify(hist);
      setCustomQRs(qr);
      setHiddenDefaults(hidden);
      setTransferHistory(hist);
      setIsLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // 3 effect persist rieng — thay doi key nao chi ghi lai key do
  useEffect(() => {
    if (!isLoaded) return;
    const serialized = JSON.stringify(customQRs);
    if (serialized === lastPersistedCustomQRRef.current) return;
    lastPersistedCustomQRRef.current = serialized;
    void persistWithBackup(DB_KEYS.CUSTOM_QR, serialized);
  }, [customQRs, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    const serialized = JSON.stringify(hiddenDefaults);
    if (serialized === lastPersistedHiddenRef.current) return;
    lastPersistedHiddenRef.current = serialized;
    void persistWithBackup(DB_KEYS.HIDDEN_DEFAULT_QR, serialized);
  }, [hiddenDefaults, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    const serialized = JSON.stringify(transferHistory);
    if (serialized === lastPersistedTransferRef.current) return;
    lastPersistedTransferRef.current = serialized;
    void persistWithBackup(DB_KEYS.TRANSFER_HISTORY, serialized);
  }, [transferHistory, isLoaded]);

  const addCustomQR = useCallback((qr: QRAccount) => {
    setCustomQRs((prev) => [...prev, qr]);
  }, []);

  const removeCustomQR = useCallback((id: string) => {
    setCustomQRs((prev) => prev.filter((qr) => qr.id !== id));
  }, []);

  const hideDefaultQR = useCallback((name: string) => {
    setHiddenDefaults((prev) => (prev.includes(name) ? prev : [...prev, name]));
  }, []);

  const restoreDefaults = useCallback(() => {
    setHiddenDefaults([]);
  }, []);

  const pushTransferHistory = useCallback((item: TransferHistoryItem) => {
    setTransferHistory((prev) => {
      const withoutDup = prev.filter(
        (h) => !(h.bankBin === item.bankBin && h.accountNumber === item.accountNumber)
      );
      return [item, ...withoutDup].slice(0, MAX_HISTORY);
    });
  }, []);

  const removeTransferHistory = useCallback((bankBin: string, accountNumber: string) => {
    setTransferHistory((prev) =>
      prev.filter((h) => !(h.bankBin === bankBin && h.accountNumber === accountNumber))
    );
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
      // Doc tu ref thay vi closure: tranh trung khi goi 2 lan lien tiep
      // truoc khi effect persist/state kip cap nhat.
      const current: QRAccount[] = lastPersistedCustomQRRef.current
        ? (JSON.parse(lastPersistedCustomQRRef.current) as QRAccount[])
        : [];
      const existingIds = new Set(current.map((q) => q.id));
      const existingNames = new Set(current.map((q) => q.name.toLowerCase()));
      const fresh = parsed.filter(
        (q) => !existingIds.has(q.id) && !existingNames.has(q.name.toLowerCase())
      );
      const next = [...current, ...fresh];
      lastPersistedCustomQRRef.current = JSON.stringify(next);
      setCustomQRs(next);
      void persistWithBackup(DB_KEYS.CUSTOM_QR, JSON.stringify(next));
      return { added: fresh.length, skipped: parsed.length - fresh.length };
    },
    []
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
