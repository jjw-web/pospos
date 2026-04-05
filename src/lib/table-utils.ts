/** Hiển thị thời gian đã ngồi từ `occupiedSince` (ISO). */
export function formatOccupiedDuration(iso?: string | null): string | null {
  if (!iso) return null;
  const start = new Date(iso).getTime();
  if (Number.isNaN(start)) return null;
  const mins = Math.floor((Date.now() - start) / 60000);
  if (mins < 1) return '<1p';
  if (mins < 60) return `${mins}p`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}g${m}p` : `${h}g`;
}
