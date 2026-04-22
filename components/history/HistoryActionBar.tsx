import React from 'react';

interface HistoryActionBarProps {
  totalBills: number;
  selectedCount: number;
  isAllSelected: boolean;
  onToggleSelectAll: () => void;
  onDeleteSelected: () => void;
  onClearAll: () => void;
  onExportSelected: () => void;
  onRevertSelected: () => void;
  canRevert: boolean;
  isDark: boolean;
  textMain: string;
}

const HistoryActionBar: React.FC<HistoryActionBarProps> = ({
  totalBills,
  selectedCount,
  isAllSelected,
  onToggleSelectAll,
  onDeleteSelected,
  onClearAll,
  onExportSelected,
  onRevertSelected,
  canRevert,
  isDark,
  textMain,
}) => {
  const btnBase: React.CSSProperties = {
    backgroundColor: isDark ? '#334155' : '#ecf0f1',
    color: textMain,
    border: `1px solid ${isDark ? '#475569' : '#bdc3c7'}`,
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'center',
    minHeight: '42px',
  };

  const dangerBtn: React.CSSProperties = {
    ...btnBase,
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        padding: '15px 0',
      }}
    >
      <button style={btnBase} onClick={onToggleSelectAll} disabled={totalBills === 0}>
        {isAllSelected ? 'Bỏ chọn tất cả' : `Chọn tất cả (${totalBills})`}
      </button>
      <button style={btnBase} onClick={onDeleteSelected} disabled={selectedCount === 0}>
        Xóa mục đã chọn ({selectedCount})
      </button>
      <button style={dangerBtn} onClick={onClearAll} disabled={totalBills === 0}>
        Xóa tất cả
      </button>
      <button style={btnBase} onClick={onExportSelected} disabled={selectedCount === 0}>
        Xuất ảnh ({selectedCount})
      </button>
      <button
        style={btnBase}
        onClick={onRevertSelected}
        disabled={selectedCount === 0 || !canRevert}
      >
        Hoàn tác
      </button>
    </div>
  );
};

export default React.memo(HistoryActionBar);
