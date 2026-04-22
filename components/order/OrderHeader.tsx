import React from 'react';
import { formatOccupiedDuration } from '../../src/lib/table-utils';
import type { TableData } from '../../src/types';

interface OrderHeaderProps {
  table: TableData;
  onBack: () => void;
  onClickTitle: () => void;
  surface: string;
  borderColor: string;
  textMain: string;
  isDark: boolean;
}

const OrderHeader: React.FC<OrderHeaderProps> = ({
  table,
  onBack,
  onClickTitle,
  surface,
  borderColor,
  textMain,
  isDark,
}) => {
  const durationLabel =
    table.status === 'occupied' ? formatOccupiedDuration(table.occupiedSince) : null;

  const headerBarStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    maxWidth: '480px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '6px',
    paddingLeft: '15px',
    paddingRight: '15px',
    paddingTop: 'calc(10px + env(safe-area-inset-top, 0px))',
    paddingBottom: '10px',
    borderBottom: `1px solid ${borderColor}`,
    backgroundColor: surface,
    boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
    zIndex: 101,
  };

  return (
    <div style={headerBarStyle}>
      <button
        type="button"
        style={{
          fontSize: '24px',
          marginRight: '15px',
          color: textMain,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
        onClick={onBack}
        aria-label="Quay lại chọn bàn"
      >
        ←
      </button>
      <div
        style={{ flex: '1 1 160px', minWidth: 0, cursor: 'pointer' }}
        onClick={onClickTitle}
        title="Click để cuộn lên đầu trang"
      >
        <h1
          style={{
            fontSize: '17px',
            fontWeight: 600,
            color: textMain,
            margin: 0,
          }}
        >
          {table.name} — {table.status === 'available' ? 'Trống' : 'Có khách'}
          {durationLabel ? ` · ${durationLabel}` : ''}
        </h1>
      </div>
    </div>
  );
};

export default React.memo(OrderHeader);
