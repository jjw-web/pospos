import React from 'react';
import { formatOccupiedDuration } from '../../src/lib/table-utils';
import type { TableData } from '../../src/types';
import { HomeIcon } from '../icons';

interface OrderHeaderProps {
  table: TableData;
  onBack: () => void;
  onHome: () => void;
  onClickTitle: () => void;
}

const OrderHeader: React.FC<OrderHeaderProps> = ({
  table,
  onBack,
  onHome,
  onClickTitle,
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
    borderBottom: '1px solid var(--border)',
    backgroundColor: 'var(--bg-surface)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
    zIndex: 101,
  };

  return (
    <div style={headerBarStyle}>
      <button
        type="button"
        style={{
          fontSize: '24px',
          color: 'var(--text-main)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0 5px',
        }}
        onClick={onBack}
        aria-label="Quay lại"
      >
        ←
      </button>
      <button
        type="button"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-main)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '5px',
        }}
        onClick={onHome}
        aria-label="Về trang chủ"
      >
        <HomeIcon />
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
            color: 'var(--text-main)',
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
