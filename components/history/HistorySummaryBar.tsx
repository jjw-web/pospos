import React from 'react';

interface HistorySummaryBarProps {
  totalBills: number;
  totalRevenue: number;
}

const HistorySummaryBar: React.FC<HistorySummaryBarProps> = ({
  totalBills,
  totalRevenue,
}) => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '16px',
    padding: '14px 18px',
    border: '1px solid var(--border)',
    color: 'var(--text-main)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        marginTop: '16px',
      }}
    >
      <div style={cardStyle}>
        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Số hóa đơn</span>
        <strong style={{ fontSize: '22px' }}>{totalBills}</strong>
      </div>
      <div style={cardStyle}>
        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Doanh thu</span>
        <strong style={{ fontSize: '22px' }}>{totalRevenue.toLocaleString()}đ</strong>
      </div>
    </div>
  );
};

export default React.memo(HistorySummaryBar);
