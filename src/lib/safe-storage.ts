import type { Bill, MenuCategory, QRAccount, TableData, TransferHistoryItem } from '../types';

import { db } from './db';

/**
 * Suffix cho key backup trong localStorage (ví dụ: `tables_backup`).
 * Backup giữ bản ghi tốt gần nhất để khôi phục khi bản chính bị cắt cụt
 * (WKWebView bị kill giữa lúc ghi — nguyên nhân gây "reset" mất data).
 */
export const BACKUP_SUFFIX = '_backup';

/**
 * Parse chuỗi JSON và kiểm tra hình dạng dữ liệu.
 * Trả về null khi chuỗi rỗng, parse lỗi, hoặc không đúng shape —
 * caller phải fallback sang nguồn khác, không được dùng data sai.
 * @param raw - Chuỗi JSON đọc từ storage (có thể null).
 * @param validate - Type guard kiểm tra shape sau khi parse.
 * @returns Dữ liệu hợp lệ, hoặc null khi hỏng.
 */
export function parseValidatedJSON<T>(
  raw: string | null | undefined,
  validate: (value: unknown) => value is T
): T | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return validate(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Type guard cho dữ liệu bàn dạng Map.entries đã serialize.
 */
export function isTableEntries(value: unknown): value is [number, TableData][] {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) =>
        Array.isArray(entry) &&
        typeof entry[0] === 'number' &&
        typeof entry[1] === 'object' &&
        entry[1] !== null &&
        Array.isArray((entry[1] as TableData).order)
    )
  );
}

/**
 * Type guard cho lịch sử hóa đơn.
 */
export function isBillArray(value: unknown): value is Bill[] {
  return (
    Array.isArray(value) &&
    value.every(
      (bill) =>
        typeof bill === 'object' &&
        bill !== null &&
        typeof (bill as Bill).id === 'number' &&
        Array.isArray((bill as Bill).items) &&
        typeof (bill as Bill).total === 'number'
    )
  );
}

/**
 * Type guard cho danh mục menu đã lưu.
 */
export function isMenuCategoryArray(value: unknown): value is MenuCategory[] {
  return (
    Array.isArray(value) &&
    value.every(
      (cat) =>
        typeof cat === 'object' &&
        cat !== null &&
        typeof (cat as MenuCategory).name === 'string' &&
        Array.isArray((cat as MenuCategory).items)
    )
  );
}

/**
 * Type guard cho QR tự thêm của tab Pics.
 */
export function isQRAccountArray(value: unknown): value is QRAccount[] {
  return (
    Array.isArray(value) &&
    value.every(
      (qr) =>
        typeof qr === 'object' &&
        qr !== null &&
        typeof (qr as QRAccount).id === 'string' &&
        typeof (qr as QRAccount).name === 'string' &&
        typeof (qr as QRAccount).path === 'string'
    )
  );
}

/**
 * Type guard cho tên QR mặc định bị ẩn (mảng string).
 */
export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

/**
 * Type guard cho lịch sử STK tab Cash.
 */
export function isTransferHistoryArray(value: unknown): value is TransferHistoryItem[] {
  return (
    Array.isArray(value) &&
    value.every(
      (h) =>
        typeof h === 'object' &&
        h !== null &&
        typeof (h as TransferHistoryItem).bankBin === 'string' &&
        typeof (h as TransferHistoryItem).accountNumber === 'string'
    )
  );
}

// ============================================================================
// Storage envelope: moi ban ghi deu mang savedAt + revision de biet ban nao
// moi nhat. Du lieu cu (legacy, khong co envelope) duoc coi la savedAt=0,
// revision=0 va tie-break theo nguon (localStorage > IndexedDB > backup),
// vi code cu luon ghi localStorage truoc (dong bo) roi moi ghi IndexedDB.
// ============================================================================

const ENVELOPE_VERSION = 1;

interface StorageEnvelope {
  __bongEnvelope: typeof ENVELOPE_VERSION;
  savedAt: number;
  revision: number;
  data: string;
}

type StorageSource = 'indexedDB' | 'localStorage' | 'localStorageBackup';

interface StorageCandidate {
  source: StorageSource;
  raw: string;
  payload: string;
  savedAt: number;
  revision: number;
  isLegacy: boolean;
}

const SOURCE_PRIORITY: Record<StorageSource, number> = {
  localStorage: 3,
  indexedDB: 2,
  localStorageBackup: 1,
};

/** Metadata cua ban ghi moi nhat da biet cho moi key (de tang revision). */
const lastKnownMeta = new Map<string, { savedAt: number; revision: number }>();

/** Hang doi ghi theo tung key — dam bao cac lenh ghi khong chay chong cheo. */
const writeQueues = new Map<string, Promise<void>>();

function parseCandidate(
  raw: string | null | undefined,
  source: StorageSource
): StorageCandidate | null {
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null; // Chuoi hong — loai ung vien nay, thu ung vien khac
  }

  // Dinh dang moi (co envelope)
  if (
    typeof parsed === 'object' &&
    parsed !== null &&
    (parsed as StorageEnvelope).__bongEnvelope === ENVELOPE_VERSION &&
    typeof (parsed as StorageEnvelope).savedAt === 'number' &&
    typeof (parsed as StorageEnvelope).revision === 'number' &&
    typeof (parsed as StorageEnvelope).data === 'string'
  ) {
    const envelope = parsed as StorageEnvelope;
    try {
      JSON.parse(envelope.data); // payload ben trong cung phai parse duoc
    } catch {
      return null;
    }
    return {
      source,
      raw,
      payload: envelope.data,
      savedAt: envelope.savedAt,
      revision: envelope.revision,
      isLegacy: false,
    };
  }

  // Dinh dang cu (legacy): ca chuoi raw chinh la payload.
  // Chi chap nhan neu raw la mot JSON hop le (da parse thanh cong o tren).
  // Tat ca payload legacy cua app (tables/history/menu/qr) deu la JSON array.
  if (!Array.isArray(parsed) && typeof parsed !== 'object') {
    return null;
  }
  return { source, raw, payload: raw, savedAt: 0, revision: 0, isLegacy: true };
}

function compareCandidates(a: StorageCandidate, b: StorageCandidate): number {
  if (a.savedAt !== b.savedAt) return a.savedAt - b.savedAt;
  if (a.revision !== b.revision) return a.revision - b.revision;
  return SOURCE_PRIORITY[a.source] - SOURCE_PRIORITY[b.source];
}

function rememberMeta(key: string, candidate: StorageCandidate): void {
  const prev = lastKnownMeta.get(key);
  if (
    !prev ||
    candidate.savedAt > prev.savedAt ||
    (candidate.savedAt === prev.savedAt && candidate.revision > prev.revision)
  ) {
    lastKnownMeta.set(key, { savedAt: candidate.savedAt, revision: candidate.revision });
  }
}

function enqueueWrite(key: string, task: () => Promise<void>): Promise<void> {
  const previous = writeQueues.get(key) ?? Promise.resolve();
  // Chay task ke tiep bat ke task truoc thanh cong hay that bai
  const next = previous.then(task, task);
  // Ban luu trong map khong duoc reject, de cac task sau van chay tiep
  writeQueues.set(
    key,
    next.catch(() => undefined)
  );
  return next;
}

/**
 * Ghi lai ban thang vao cac lop dang cu/thieu/hong (self-heal).
 * Phai enqueue DONG BO ngay khi doc xong, truoc khi caller kip phat sinh
 * thao tac ghi moi, de khong bao gio ghi de du lieu moi hon.
 */
function healStorage(key: string, winner: StorageCandidate): Promise<void> {
  return enqueueWrite(key, async () => {
    if (winner.isLegacy) {
      // Boc du lieu cu vao envelope moi va ghi lai ca 2 lop
      await persistOnce(key, winner.payload);
      return;
    }
    // Da co envelope: ghi lai NGUYEN VAN raw vao cac lop chua co ban nay
    try {
      if (localStorage.getItem(key) !== winner.raw) {
        localStorage.setItem(key, winner.raw);
      }
    } catch (err) {
      console.error(`[safe-storage] heal localStorage failed for ${key}:`, err);
    }
    try {
      const fromDB = await db.getItem<string>(key);
      if (fromDB !== winner.raw) {
        await db.setItem(key, winner.raw);
      }
    } catch (err) {
      console.error(`[safe-storage] heal IndexedDB failed for ${key}:`, err);
    }
  });
}

export interface StorageReadResult<T> {
  value: T;
  candidate: StorageCandidate;
}

/**
 * Doc du lieu tu CA BA lop (IndexedDB, localStorage chinh, localStorage
 * backup), loai bo cac ban hong/sai shape, chon ban MOI NHAT hop le va
 * tu chua lanh cac lop con lai. Day la ham doc chinh sau ban fix —
 * cac hook phai dung ham nay thay cho readWithFallback cu.
 * @param key - Storage key chính (ví dụ: 'tables').
 * @param validate - Type guard kiểm tra shape dữ liệu nghiệp vụ.
 * @param options - heal: false để bỏ qua tự chữa (dùng khi nâng cấp version).
 * @returns Bản thắng kèm metadata, hoặc null khi không có bản nào dùng được.
 */
export async function readWithFallbackValidated<T>(
  key: string,
  validate: (value: unknown) => value is T,
  options?: { heal?: boolean }
): Promise<StorageReadResult<T> | null> {
  const candidates: StorageCandidate[] = [];

  try {
    const fromDB = await db.getItem<string>(key);
    const candidate = parseCandidate(fromDB, 'indexedDB');
    if (candidate) candidates.push(candidate);
  } catch (err) {
    console.error(`[safe-storage] IndexedDB read failed for ${key}:`, err);
  }

  try {
    const candidate = parseCandidate(localStorage.getItem(key), 'localStorage');
    if (candidate) candidates.push(candidate);
  } catch (err) {
    console.error(`[safe-storage] localStorage read failed for ${key}:`, err);
  }

  try {
    const candidate = parseCandidate(localStorage.getItem(key + BACKUP_SUFFIX), 'localStorageBackup');
    if (candidate) candidates.push(candidate);
  } catch (err) {
    console.error(`[safe-storage] backup read failed for ${key}:`, err);
  }

  const valid = candidates.filter((candidate) => {
    try {
      return validate(JSON.parse(candidate.payload));
    } catch {
      return false;
    }
  });

  if (valid.length === 0) {
    if (candidates.length > 0) {
      console.error(
        `[safe-storage] Tat ca cac ban ghi cua ${key} deu hong/sai shape, dung du lieu mac dinh.`
      );
    }
    return null;
  }

  const winner = valid.reduce((best, candidate) =>
    compareCandidates(candidate, best) > 0 ? candidate : best
  );
  rememberMeta(key, winner);

  if (options?.heal !== false) {
    // Enqueue dong bo (khong await) — xem ghi chu trong healStorage
    void healStorage(key, winner).catch((err) =>
      console.error(`[safe-storage] heal failed for ${key}:`, err)
    );
  }

  return { value: JSON.parse(winner.payload) as T, candidate: winner };
}

/**
 * Ham doc cu — giu lai de tuong thich nguoc, nay tra ve payload cua ban
 * moi nhat hop le (thay vi ban dau tien tim thay nhu truoc).
 * Code moi nen dung readWithFallbackValidated de co ca validator.
 * @param key - Storage key chính.
 * @returns Chuỗi payload của bản mới nhất, hoặc null.
 */
export async function readWithFallback(key: string): Promise<string | null> {
  const result = await readWithFallbackValidated<unknown>(
    key,
    (_value: unknown): _value is unknown => true
  );
  return result ? result.candidate.payload : null;
}

async function persistOnce(key: string, value: string): Promise<void> {
  // Chi ghi du lieu parse duoc — khong bao gio ghi chuoi hong xuong storage
  try {
    JSON.parse(value);
  } catch {
    console.error(`[safe-storage] Tu choi ghi du lieu khong phai JSON hop le cho ${key}`);
    return;
  }

  const prev = lastKnownMeta.get(key);
  const meta = {
    savedAt: Math.max(Date.now(), prev?.savedAt ?? 0),
    revision: (prev?.revision ?? 0) + 1,
  };
  lastKnownMeta.set(key, meta);

  const envelope: StorageEnvelope = {
    __bongEnvelope: ENVELOPE_VERSION,
    savedAt: meta.savedAt,
    revision: meta.revision,
    data: value,
  };
  const raw = JSON.stringify(envelope);

  // Xoay vong backup: chi copy khi ban hien tai con parse duoc,
  // tranh ghi de ban backup tot bang mot ban hong.
  try {
    const current = localStorage.getItem(key);
    if (current && parseCandidate(current, 'localStorage')) {
      localStorage.setItem(key + BACKUP_SUFFIX, current);
    }
  } catch {
    // Khong xoay duoc backup thi van tiep tuc ghi ban chinh
  }

  try {
    localStorage.setItem(key, raw);
  } catch (err) {
    console.error(`[safe-storage] localStorage write failed for ${key}:`, err);
  }

  try {
    await db.setItem(key, raw);
  } catch (err) {
    // Khong nem loi ra ngoai: ban trong localStorage van la ban moi nhat
    // va se thang trong lan doc sau. Chi ghi log de debug.
    console.error(`[safe-storage] IndexedDB write failed for ${key}:`, err);
  }
}

/**
 * Ghi du lieu kem metadata + xoay vong backup, qua hang doi ghi theo key.
 * Signature giu nguyen nhu ban cu de cac noi goi khong phai sua.
 * @param key - Storage key chính.
 * @param value - Chuỗi JSON dữ liệu nghiệp vụ cần ghi.
 */
export function persistWithBackup(key: string, value: string): Promise<void> {
  return enqueueWrite(key, () => persistOnce(key, value));
}

/**
 * Cho moi hang doi ghi hoan tat. Dung khi app xuong nen (pagehide /
 * visibilitychange) va trong test.
 */
export async function flushStorageWrites(): Promise<void> {
  await Promise.allSettled(Array.from(writeQueues.values()));
}
