/**
 * Đọc file ảnh thành dataURL, tự resize về vừa phải để khỏi phình storage.
 * dataURL base64 phình ~33% so với file gốc; ảnh chụp từ điện thoại
 * vài MB sẽ nhanh chóng làm đầy localStorage (~5MB) → resize trước khi lưu.
 * Dùng canvas của trình duyệt, không cần package.
 * @param file - File ảnh user chọn từ <input type="file">
 * @param maxDim - Cạnh dài nhất sau resize (mặc định 1000px — QR vẫn quét tốt)
 * @param quality - Chất lượng JPEG 0–1 (mặc định 0.85)
 * @returns dataURL JPEG (fallback: dataURL gốc nếu canvas lỗi)
 */
export function compressImageFile(
  file: File,
  maxDim = 1000,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve('');
    reader.onload = () => {
      const rawUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => resolve(rawUrl);
      img.onload = () => {
        try {
          const scale = Math.min(
            1,
            maxDim / Math.max(img.naturalWidth, img.naturalHeight)
          );
          const w = Math.max(1, Math.round(img.naturalWidth * scale));
          const h = Math.max(1, Math.round(img.naturalHeight * scale));
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawUrl);
            return;
          }
          // Nền trắng trước khi vẽ — JPEG không có alpha, tránh nền đen
          // khi ảnh gốc là PNG trong suốt
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch {
          resolve(rawUrl);
        }
      };
      img.src = rawUrl;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Kiểm tra URL dán vào có phải http(s) và trỏ tới file ảnh hay không.
 * Chỉ check hình thức (không fetch) để popup lưu nhanh, offline vẫn lưu được;
 * ảnh vỡ do mất mạng sẽ hiện fallback ở màn xem.
 * @param url - URL user dán
 * @returns true nếu là URL ảnh hợp lệ về hình thức
 */
export function isValidImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!/^https?:\/\/.+\..+/.test(trimmed)) return false;
  return true;
}
