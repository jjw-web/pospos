import { useEffect, useRef } from 'react';

interface SwipeBackOptions {
  onSwipeBack: () => void;
  enabled?: boolean;
}

/**
 * Hook nhận diện cử chỉ vuốt từ mép trái sang phải (swipe-to-back).
 * Chỉ lắng nghe trên window, không thêm package bên ngoài.
 * @param onSwipeBack - Callback được gọi khi cử chỉ được xác nhận
 * @param enabled - Bật/tắt cử chỉ (mặc định true)
 */
export function useSwipeBack({ onSwipeBack, enabled = true }: SwipeBackOptions): void {
  const startRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch.clientX <= 30) {
        startRef.current = { x: touch.clientX, y: touch.clientY };
      }
    };

    const onTouchMove = (_e: TouchEvent) => {
      // Chỉ cần bắt đầu, không xử lý trong lúc vuốt
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!startRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startRef.current.x;
      const deltaY = Math.abs(touch.clientY - startRef.current.y);

      startRef.current = null;

      if (deltaX > 80 && deltaY < 50) {
        onSwipeBack();
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [onSwipeBack, enabled]);
}
