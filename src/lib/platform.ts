/**
 * Nhận diện app đang chạy trong Capacitor native (IPA/APK) hay trên web.
 * Dùng để tắt các cơ chế chỉ dành cho web (service worker auto-update,
 * pixelRatio cao khi xuất ảnh) — chúng gây double reload / jetsam trên iOS.
 * @returns true khi chạy trong WebView native của Capacitor.
 */
export function isNativePlatform(): boolean {
  try {
    const cap = (
      window as unknown as {
        Capacitor?: { isNativePlatform?: () => boolean };
      }
    ).Capacitor;
    return cap?.isNativePlatform?.() ?? false;
  } catch {
    return false;
  }
}
