import React from 'react';

interface HistorySummaryBarProps {
  totalBills: number;
  totalRevenue: number;
  surface: string;
  textMain: string;
  textMuted: string;
  borderColor: string;
}

const HistorySummaryBar: React.FC<HistorySummaryBarProps> = ({
  totalBills,
  totalRevenue,
  surface,
  textMain,
  textMuted,
  borderColor,
}) => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: surface,
    borderRadius: '16px',
    padding: '14px 18px',
    border: `1px solid ${borderColor}`,
    color: textMain,
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
        <span style={{ color: textMuted, fontSize: '13px' }}>
          Số hóa đơn
        </span>
        <strong style={{ fontSize: '22px' }}>{totalBills}</strong>
      </div>
      <div style={cardStyle}>
        <span style={{ color: textMuted, fontSize: '13px' }}>
          Doanh thu
        </span>
        <strong style={{ fontSize: '22px' }}>
          {totalRevenue.toLocaleString()}đ
        </strong>
      </div>
    </div>
  );
};

export default React.memo(HistorySummaryBar);