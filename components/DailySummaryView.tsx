import React, { useMemo } from 'react';
import type { Bill } from '../src/types';
import { computeDailySummary, todayDateKey } from '../src/lib/daily-summary';
import { useTheme } from '../src/context/ThemeContext';

interface DailySummaryViewProps {
  history: Bill[];
  onBack: () => void;
}

const DailySummaryView: React.FC<DailySummaryViewProps> = ({ history, onBack }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const dateKey = todayDateKey();

  const summary = useMemo(() => computeDailySummary(history, dateKey), [history, dateKey]);

  const topList = useMemo(() => {
    return Array.from(summary.itemSales.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);
  }, [summary.itemSales]);

  const avgBill = summary.bills.length
    ? Math.round(summary.totalRevenue / summary.bills.length)
    : 0;

  const colors = useMemo(
    () => ({
      bg: isDark ? '#0f172a' : '#f8fafc',
      card: isDark ? '#1e293b' : '#ffffff',
      text: isDark ? '#f1f5f9' : '#0f172a',
      muted: isDark ? '#94a3b8' : '#64748b',
      border: isDark ? '#334155' : '#e2e8f0',
    }),
    [isDark]
  );

  const formatDayVi = (key: string) => {
    const [y, m, d] = key.split('-').map(Number);
    return `${d}/${m}/${y}`;
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.bg,
        padding: '16px',
        paddingBottom: '32px',
        boxSizing: 'border-box',
        color: colors.text,
      }}
    >
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              background: isDark ? '#334155' : '#e2e8f0',
              color: colors.text,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ← Quay lại
          </button>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Tổng kết ngày</h1>
        </div>

        <p style={{ margin: '0 0 16px', color: colors.muted, fontSize: '14px' }}>
          Ngày {formatDayVi(dateKey)} · {summary.bills.length} hóa đơn · {summary.totalItemsSold}{' '}
          món bán
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            marginBottom: '14px',
          }}
        >
          <div
            style={{
              backgroundColor: colors.card,
              borderRadius: '14px',
              padding: '18px',
              border: `1px solid ${colors.border}`,
              boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontSize: '14px', color: colors.muted, marginBottom: '6px' }}>
              Tổng hóa đơn
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#38bdf8' }}>
              {summary.bills.length}
            </div>
          </div>
          <div
            style={{
              backgroundColor: colors.card,
              borderRadius: '14px',
              padding: '18px',
              border: `1px solid ${colors.border}`,
              boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontSize: '14px', color: colors.muted, marginBottom: '6px' }}>
              Số món bán
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#38bdf8' }}>
              {summary.totalItemsSold}
            </div>
          </div>
          <div
            style={{
              backgroundColor: colors.card,
              borderRadius: '14px',
              padding: '18px',
              border: `1px solid ${colors.border}`,
              boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontSize: '14px', color: colors.muted, marginBottom: '6px' }}>
              Trung bình mỗi hóa đơn
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#38bdf8' }}>
              {avgBill.toLocaleString('vi-VN')}đ
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: colors.card,
            borderRadius: '14px',
            padding: '18px',
            marginBottom: '14px',
            border: `1px solid ${colors.border}`,
          }}
        >
          <div style={{ fontSize: '14px', color: colors.muted, marginBottom: '6px' }}>
            Tổng doanh thu
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#38bdf8' }}>
            {summary.totalRevenue.toLocaleString('vi-VN')}đ
          </div>
        </div>

        <div
          style={{
            backgroundColor: colors.card,
            borderRadius: '14px',
            padding: '18px',
            marginBottom: '14px',
            border: `1px solid ${colors.border}`,
          }}
        >
          <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>
            Theo hình thức thanh toán
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: colors.muted }}>💵 Tiền mặt</span>
              <strong>{summary.cashTotal.toLocaleString('vi-VN')}đ</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: colors.muted }}>🏦 Chuyển khoản (BIDV + Tintin)</span>
              <strong>{summary.transferTotal.toLocaleString('vi-VN')}đ</strong>
            </div>
            {summary.otherTotal > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: colors.muted }}>Khác / chưa ghi</span>
                <strong>{summary.otherTotal.toLocaleString('vi-VN')}đ</strong>
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            backgroundColor: colors.card,
            borderRadius: '14px',
            padding: '18px',
            border: `1px solid ${colors.border}`,
          }}
        >
          <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>
            Món bán chạy (số lượng)
          </div>
          {topList.length === 0 ? (
            <p style={{ color: colors.muted, margin: 0 }}>Chưa có dữ liệu trong ngày.</p>
          ) : (
            <ol
              style={{
                margin: 0,
                paddingLeft: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {topList.map(([name, qty]) => (
                <li key={name} style={{ fontSize: '14px' }}>
                  <strong>{name}</strong>
                  <span style={{ color: colors.muted }}> — {qty} ly/phần</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailySummaryView;
