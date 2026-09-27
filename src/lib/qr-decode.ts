import jsQR from 'jsqr';
import { getBankShortName } from './vietqr';

export interface DecodedQRAccount {
  bankBin: string;
  accountNumber: string;
}

interface TLVField {
  id: string;
  value: string;
}

/**
 * Cắt chuỗi TLV (Type-Length-Value) thành danh sách field.
 * Trả về mảng rỗng khi chuỗi hỏng — caller tự coi như decode thất bại.
 * @param s - Chuỗi TLV cần cắt
 * @returns Danh sách {id, value}
 */
function parseTLVFields(s: string): TLVField[] {
  const fields: TLVField[] = [];
  let i = 0;
  while (i + 4 <= s.length) {
    const id = s.slice(i, i + 2);
    const len = parseInt(s.slice(i + 2, i + 4), 10);
    if (!/^[0-9]{2}$/.test(id) || Number.isNaN(len) || i + 4 + len > s.length) {
      return [];
    }
    fields.push({ id, value: s.slice(i + 4, i + 4 + len) });
    i += 4 + len;
  }
  return i === s.length ? fields : [];
}

/**
 * Bóc BIN + STK từ payload text VietQR (tag 38 → subtag 01 → 00=BIN, 01=STK).
 * Đúng chiều ngược với buildVietQRPayload — đã đối chiếu byte với QR chuẩn.
 * @param payload - Text đọc được từ ảnh QR
 * @returns BIN + STK, hoặc null khi không phải VietQR
 */
export function parseVietQRAccount(payload: string): DecodedQRAccount | null {
  const top = parseTLVFields(payload.trim());
  if (top.length === 0) return null;
  const tag38 = top.find((f) => f.id === '38');
  if (!tag38) return null;
  const inner = parseTLVFields(tag38.value);
  const sub01 = inner.find((f) => f.id === '01');
  if (!sub01) return null;
  const beneficiary = parseTLVFields(sub01.value);
  const bin = beneficiary.find((f) => f.id === '00')?.value ?? '';
  const stk = beneficiary.find((f) => f.id === '01')?.value ?? '';
  if (!/^[0-9]{6}$/.test(bin) || !/^[A-Z0-9]{6,25}$/i.test(stk)) return null;
  return { bankBin: bin, accountNumber: stk.toUpperCase() };
}

/**
 * Sinh tên gợi nhớ chuẩn: `QR + tên bank + 4 số cuối STK`.
 * Vd: `QR MBBank 8888`, `QR Vietcombank 8769`.
 * @param bankBin - Mã BIN 6 số
 * @param accountNumber - STK hoặc mã merchant
 * @returns Tên gợi nhớ
 */
export function buildAutoQRName(bankBin: string, accountNumber: string): string {
  const bank = getBankShortName(bankBin) ?? bankBin;
  const tail =
    accountNumber.length > 4 ? accountNumber.slice(-4) : accountNumber;
  return `QR ${bank} ${tail}`;
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('load'));
    img.src = dataUrl;
  });
}

/**
 * Đọc text QR từ dataURL ảnh bằng jsQR trên canvas (offline 100%).
 * Ảnh lớn được thu về max 1000px để decode nhanh.
 * @param dataUrl - Ảnh dạng dataURL (JPEG/PNG)
 * @returns Text trong QR, hoặc null khi không đọc được
 */
export async function decodeQRFromDataUrl(dataUrl: string): Promise<string | null> {
  try {
    const img = await loadImage(dataUrl);
    const scale = Math.min(1, 1000 / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, w, h);
    const imageData = ctx.getImageData(0, 0, w, h);
    const code = jsQR(imageData.data, w, h);
    return code?.data ?? null;
  } catch {
    return null;
  }
}

/**
 * Tải ảnh từ URL về dataURL để decode (dán link trong popup).
 * Fetch có thể fail do CORS/offline — trả null để UI fallback nhập tay.
 * @param url - Link ảnh http(s)
 * @returns dataURL, hoặc null
 */
export async function fetchImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url.trim());
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.type.startsWith('image/')) return null;
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onerror = () => resolve(null);
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Pipeline tự động 1 chạm: dataURL → text QR → BIN/STK.
 * @param dataUrl - Ảnh QR dạng dataURL
 * @returns BIN + STK, hoặc null để UI giữ nhập tay
 */
export async function detectAccountFromDataUrl(
  dataUrl: string
): Promise<DecodedQRAccount | null> {
  const text = await decodeQRFromDataUrl(dataUrl);
  if (!text) return null;
  return parseVietQRAccount(text);
}
