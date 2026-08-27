import React, { useState, useMemo, useRef } from 'react';
import type { Bill, MenuCategory } from '../src/types';
import { toPng } from 'html-to-image';
import HistorySummaryBar from './history/HistorySummaryBar';
import HistoryActionBar from './history/HistoryActionBar';
import BillCard from './history/BillCard';
import ConfirmDialog from './ConfirmDialog';

interface HistoryViewProps {
  history: Bill[];
  onClearHistory: () => void;
  onDeleteSelected: (selectedIds: number[]) => void;
  onBack: () => void;
  menuCategories: MenuCategory[];
  onRevertBill?: (bill: Bill) => void;
}

interface ConfirmState {
  message: string;
  onConfirm: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onClearHistory,
  onDeleteSelected,
  onBack,
  menuCategories,
  onRevertBill,
}) => {
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const [selectedBills, setSelectedBills] = useState<number[]>([]);
  const [exportedImageUrl, setExportedImageUrl] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  const historySummary = useMemo(() => {
    const totalRevenue = history.reduce((sum, bill) => sum + (bill.total ?? 0), 0);
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
    setConfirm({
      message: `Bạn có chắc chắn muốn xóa ${selectedBills.length} hóa đơn đã chọn không?`,
      onConfirm: () => {
        onDeleteSelected(selectedBills);
        setSelectedBills([]);
      },
    });
  };

  const handleClearAll = () => {
    setConfirm({
      message: 'Bạn có chắc chắn muốn xóa toàn bộ lịch sử không?',
      onConfirm: () => {
        onClearHistory();
        setSelectedBills([]);
      },
    });
  };

  const handleExportSelected = async () => {
    if (selectedBills.length === 0) return;
    const bill = history.find((b) => b.id === selectedBills[0]);
    if (!bill) return;
    const element = cardRefs.current.get(bill.id);
    if (!element) return;
    try {
      const dataUrl = await toPng(element, {
        pixelRatio: 2,
        backgroundColor: '#1e293b',
      });
      setExportedImageUrl(dataUrl);
    } catch (err) {
      console.error('Lỗi xuất ảnh:', err);
    }
  };

  const handleRevertSelected = () => {
    if (selectedBills.length === 0 || !onRevertBill) return;
    const bill = history.find((b) => b.id === selectedBills[0]);
    if (bill) {
      setConfirm({
        message: `Bạn có chắc muốn hoàn tác hóa đơn bàn ${bill.table}?`,
        onConfirm: () => {
          onRevertBill(bill);
          setSelectedBills([]);
        },
      });
    }
  };

  return (
    <div
      style={{
        maxWidth: '480px',
        margin: '0 auto',
        padding: '0 15px',
        paddingTop: 'calc(52px + env(safe-area-inset-top, 0px))',
        paddingBottom: '100px',
        height: '100dvh',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        backgroundColor: 'var(--bg-page)',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          maxWidth: '480px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          padding: '15px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--bg-surface)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          zIndex: 101,
          paddingTop: 'calc(10px + env(safe-area-inset-top, 0px))',
        }}
      >
        <button
          type="button"
          style={{
            fontSize: '24px',
            marginRight: '15px',
            color: 'var(--text-main)',
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
            color: 'var(--text-main)',
          }}
        >
          Lịch sử thanh toán
        </h1>
      </div>

      <HistorySummaryBar
        totalBills={historySummary.totalBills}
        totalRevenue={historySummary.totalRevenue}
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
      />

      {history.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '50px 0',
            color: 'var(--text-muted)',
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
          />
        ))
      )}

      {exportedImageUrl && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setExportedImageUrl(null)}
        >
          <div style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%' }}>
            <button
              type="button"
              style={{
                position: 'absolute',
                top: '-40px',
                right: 0,
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
              }}
              onClick={(e) => { e.stopPropagation(); setExportedImageUrl(null); }}
            >
              ✕
            </button>
            <img
              src={exportedImageUrl}
              style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px' }}
              alt="Hóa đơn"
            />
          </div>
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          onConfirm={() => { confirm.onConfirm(); setConfirm(null); }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
};

export default HistoryView;
