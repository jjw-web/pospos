import React, { useState, useMemo, useRef } from 'react';
import type { Bill, MenuCategory } from '../src/types';
import { useTheme } from '../src/context/ThemeContext';
import { toPng } from 'html-to-image';
import HistorySummaryBar from './history/HistorySummaryBar';
import HistoryActionBar from './history/HistoryActionBar';
import BillCard from './history/BillCard';

interface HistoryViewProps {
  history: Bill[];
  onClearHistory: () => void;
  onDeleteSelected: (selectedIds: number[]) => void;
  onBack: () => void;
  menuCategories: MenuCategory[];
  onRevertBill?: (bill: Bill) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onClearHistory,
  onDeleteSelected,
  onBack,
  menuCategories,
  onRevertBill,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const surface = isDark ? '#1e293b' : '#ffffff';
  const pageBg = isDark ? '#0f172a' : '#f5f5f5';
  const textMain = isDark ? '#f1f5f9' : '#2c3e50';
  const textMuted = isDark ? '#94a3b8' : '#7f8c8d';
  const borderColor = isDark ? '#334155' : '#eaeaea';

  const [selectedBills, setSelectedBills] = useState<number[]>([]);

  const historySummary = useMemo(() => {
    const totalRevenue = history.reduce((sum, bill) => sum + bill.total, 0);
    return { totalRevenue, totalBills: history.length };
  }, [history]);

  const isAllSelected = selectedBills.length === history.length && history.length > 0;

  const handleToggleSelect = (billId: number) => {
    setSelectedBills((prev) =>
      prev.includes(billId) ? prev.filter((id) => id !== billId) : [...prev, billId]
    );
  };

  const handleToggleSelectAll = () => {
    setSelectedBills(isAllSelected ? [] : history.map((b) => b.id));
  };

  const handleDeleteSelected = () => {
    if (selectedBills.length === 0) return;
    if (
      window.confirm(`Bạn có chắc chắn muốn xóa ${selectedBills.length} hóa đơn đã chọn không?`)
    ) {
      onDeleteSelected(selectedBills);
      setSelectedBills([]);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử không?')) {
      onClearHistory();
      setSelectedBills([]);
    }
  };

  const handleExportSelected = async () => {
    if (selectedBills.length === 0) {
      alert('Vui lòng chọn hóa đơn cần xuất ảnh');
      return;
    }
    const bill = history.find((b) => b.id === selectedBills[0]);
    if (!bill) return;
    const element = cardRefs.current.get(bill.id);
    if (!element) {
      alert('Không tìm thấy hóa đơn để xuất ảnh');
      return;
    }
    try {
      const dataUrl = await toPng(element, {
        pixelRatio: 2,
        backgroundColor: surface,
      });
      const link = document.createElement('a');
      link.download = `Hoa-don-Ban-${bill.table}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Lỗi xuất ảnh:', err);
      alert('Không thể xuất ảnh lúc này.');
    }
  };

  const handleRevertSelected = () => {
    if (selectedBills.length === 0 || !onRevertBill) {
      alert('Vui lòng chọn hóa đơn cần hoàn tác');
      return;
    }
    const bill = history.find((b) => b.id === selectedBills[0]);
    if (bill) {
      onRevertBill(bill);
      setSelectedBills([]);
    }
  };

  return (
    <div
      style={{
        maxWidth: '480px',
        margin: '0 auto',
        padding: '0 15px',
        paddingBottom: '100px',
        minHeight: '100vh',
        backgroundColor: pageBg,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '15px 0',
          borderBottom: `1px solid ${borderColor}`,
          backgroundColor: surface,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <button
          style={{
            fontSize: '24px',
            marginRight: '15px',
            color: textMain,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
          onClick={onBack}
        >
          ←
        </button>
        <h1
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: textMain,
          }}
        >
          Lịch sử thanh toán
        </h1>
      </div>

      <HistorySummaryBar
        totalBills={historySummary.totalBills}
        totalRevenue={historySummary.totalRevenue}
        surface={surface}
        textMain={textMain}
        textMuted={textMuted}
        borderColor={borderColor}
      />

      <HistoryActionBar
        totalBills={history.length}
        selectedCount={selectedBills.length}
        isAllSelected={isAllSelected}
        onToggleSelectAll={handleToggleSelectAll}
        onDeleteSelected={handleDeleteSelected}
        onClearAll={handleClearAll}
        onExportSelected={handleExportSelected}
        onRevertSelected={handleRevertSelected}
        canRevert={!!onRevertBill}
        isDark={isDark}
        textMain={textMain}
      />

      {history.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '50px 0',
            color: textMuted,
          }}
        >
          Không có lịch sử thanh toán.
        </div>
      ) : (
        history.map((bill) => (
          <BillCard
            key={bill.id}
            bill={bill}
            isSelected={selectedBills.includes(bill.id)}
            menuCategories={menuCategories}
            onToggleSelect={handleToggleSelect}
            cardRef={(el) => {
              if (el) cardRefs.current.set(bill.id, el);
            }}
            surface={surface}
            textMain={textMain}
            textMuted={textMuted}
            borderColor={borderColor}
            isDark={isDark}
          />
        ))
      )}
    </div>
  );
};

export default HistoryView;
