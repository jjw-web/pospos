import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import type {
  TableData,
  MenuCategory,
  MenuItem,
  OrderItem,
  PaymentMethod,
  ToppingItem,
  TableTransferMode,
} from '../src/types';
import OrderHeader from './order/OrderHeader';
import MenuPanel from './order/MenuPanel';
import OrderPanel from './order/OrderPanel';
import NoteModal from './NoteModal';
import PaymentMethodModal from './PaymentMethodModal';
import TableTransferModal from './TableTransferModal';
import ToppingsModal from './ToppingsModal';
import Toast from './Toast';
import { useTheme } from '../src/context/ThemeContext';
import { calcOrderTotal, countOrderItems } from '../src/lib/order-utils';

interface OrderViewProps {
  table: TableData;
  menuCategories: MenuCategory[];
  allTables: TableData[];
  onBack: () => void;
  onAddItem: (
    tableId: number,
    menuItems: { menuItem: MenuItem; toppings?: ToppingItem[] }[]
  ) => void;
  onUpdateQuantity: (tableId: number, menuItemId: number, change: number) => void;
  onPayment: (tableId: number, paymentMethod: PaymentMethod) => void;
  onUpdateNote: (tableId: number, menuItemId: number, note: string) => void;
  onMoveTable: (fromId: number, toId: number) => void;
  onMergeFromTable: (currentId: number, sourceId: number) => void;
  onAddTopping?: (
    tableId: number,
    mainItemId: number,
    toppings: { id: number; name: string; price: number }[]
  ) => void;
}

const OrderView: React.FC<OrderViewProps> = ({
  table,
  menuCategories,
  allTables,
  onBack,
  onAddItem,
  onUpdateQuantity,
  onPayment,
  onUpdateNote,
  onMoveTable,
  onMergeFromTable,
  onAddTopping,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [selectedCategory, setSelectedCategory] = useState<string>(menuCategories[0]?.name ?? '');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNoteItem, setEditingNoteItem] = useState<OrderItem | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [transferMode, setTransferMode] = useState<TableTransferMode | null>(null);
  const [showToppingsModal, setShowToppingsModal] = useState(false);
  const [selectedOrderItemForToppings, setSelectedOrderItemForToppings] =
    useState<OrderItem | null>(null);
  const [, headerTick] = useState(0);

  const currentOrderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (table.status !== 'occupied' || !table.occupiedSince) return;
    const id = window.setInterval(() => headerTick((n) => n + 1), 30000);
    return () => window.clearInterval(id);
  }, [table.status, table.occupiedSince]);

  const total = useMemo(() => calcOrderTotal(table.order ?? []), [table.order]);

  const order = useMemo(() => table.order ?? [], [table.order]);

  const { mainCount, toppingCount, snackCount } = useMemo(
    () => countOrderItems(table.order ?? [], menuCategories),
    [table.order, menuCategories]
  );

  const orderSummaryTitle =
    mainCount === 0 && toppingCount === 0 && snackCount === 0
      ? 'Đơn hàng hiện tại (0 món)'
      : `Đơn hàng hiện tại — Đồ uống: ${mainCount}, Topping: ${toppingCount}, Snack: ${snackCount}`;

  const availableToppings = useMemo(
    () =>
      menuCategories
        .filter((cat) => cat.name.toLowerCase().includes('topping'))
        .flatMap((cat) => cat.items)
        .map((item) => ({ id: item.id, name: item.name, price: item.price, quantity: 1 })),
    [menuCategories]
  );

  const moveCandidates = useMemo(
    () =>
      allTables.filter(
        (t) => t.id !== table.id && t.status === 'available' && t.order.length === 0
      ),
    [allTables, table.id]
  );

  const mergeCandidates = useMemo(
    () =>
      allTables.filter((t) => t.id !== table.id && t.status === 'occupied' && t.order.length > 0),
    [allTables, table.id]
  );

  const handleAddMenuItem = useCallback(
    (menuItem: MenuItem) => {
      onAddItem(table.id, [{ menuItem }]);
      setToastMessage(`Đã thêm «${menuItem.name}»`);
    },
    [onAddItem, table.id]
  );

  const handleConfirmToppings = useCallback(
    (selectedToppings: ToppingItem[]) => {
      if (!selectedOrderItemForToppings) return;
      onAddTopping?.(
        table.id,
        selectedOrderItemForToppings.menuItem.id,
        selectedToppings.map((t) => ({
          id: t.id,
          name: t.name,
          price: t.price,
        }))
      );
      setToastMessage(
        `Đã thêm ${selectedToppings.length} topping cho «${selectedOrderItemForToppings.menuItem.name}»`
      );
    },
    [onAddTopping, table.id, selectedOrderItemForToppings]
  );

  const surface = isDark ? '#1e293b' : '#ffffff';
  const pageBg = isDark ? '#0f172a' : '#f5f5f5';
  const textMain = isDark ? '#f1f5f9' : '#2c3e50';
  const textMuted = isDark ? '#94a3b8' : '#7f8c8d';
  const borderColor = isDark ? '#334155' : '#eaeaea';
  const cardBorder = isDark ? '#475569' : '#eee';

  if (!table || table.order === undefined) {
    return <div style={{ padding: 24, color: textMain }}>Đang tải...</div>;
  }

  return (
    <div
      style={{
        maxWidth: '480px',
        margin: '0 auto',
        padding: '0 15px',
        paddingTop: 'calc(52px + env(safe-area-inset-top, 0px))',
        paddingBottom: '100px',
        backgroundColor: pageBg,
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      <OrderHeader
        table={table}
        onBack={onBack}
        onClickTitle={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        surface={surface}
        borderColor={borderColor}
        textMain={textMain}
        isDark={isDark}
      />

      <p
        style={{
          fontSize: '13px',
          color: textMuted,
          margin: '4px 0 0 0',
        }}
      >
        Chuyển / gộp bàn khi khách đổi chỗ. Thêm món sẽ có thông báo nhỏ phía dưới.
      </p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button
          type="button"
          style={{
            flex: 1,
            padding: '8px 10px',
            fontSize: '13px',
            fontWeight: 600,
            borderRadius: '8px',
            border: `1px solid ${isDark ? '#475569' : '#cbd5e1'}`,
            background: isDark ? '#334155' : '#f1f5f9',
            color: textMain,
            cursor: 'pointer',
          }}
          onClick={() => setTransferMode('move')}
          disabled={table.order.length === 0 || moveCandidates.length === 0}
        >
          Chuyển bàn
        </button>
        <button
          type="button"
          style={{
            flex: 1,
            padding: '8px 10px',
            fontSize: '13px',
            fontWeight: 600,
            borderRadius: '8px',
            border: `1px solid ${isDark ? '#475569' : '#cbd5e1'}`,
            background: isDark ? '#334155' : '#f1f5f9',
            color: textMain,
            cursor: 'pointer',
          }}
          onClick={() => setTransferMode('merge')}
          disabled={mergeCandidates.length === 0}
        >
          Gộp bàn
        </button>
      </div>

      <MenuPanel
        menuCategories={menuCategories}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        onCategoryChange={setSelectedCategory}
        onSearchChange={setSearchQuery}
        onAddItem={handleAddMenuItem}
        isDark={isDark}
        surface={surface}
        textMain={textMain}
        cardBorder={cardBorder}
      />

      <OrderPanel
        order={order}
        menuCategories={menuCategories}
        orderSummaryTitle={orderSummaryTitle}
        onUpdateQuantity={(menuItemId, change) => onUpdateQuantity(table.id, menuItemId, change)}
        onEditNote={setEditingNoteItem}
        onOpenToppings={(item) => {
          setSelectedOrderItemForToppings(item);
          setShowToppingsModal(true);
        }}
        panelRef={currentOrderRef}
        isDark={isDark}
        surface={surface}
        textMain={textMain}
        textMuted={textMuted}
        borderColor={borderColor}
      />

      <div
        style={{
          textAlign: 'center',
          padding: '15px 0',
          color: textMuted,
          fontSize: '12px',
        }}
      >
        pospos.vercel.app
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          maxWidth: '480px',
          margin: '0 auto',
          backgroundColor: surface,
          padding: '15px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: isDark ? '0 -2px 10px rgba(0,0,0,0.35)' : '0 -2px 10px rgba(0,0,0,0.1)',
          zIndex: 100,
          borderTop: `1px solid ${borderColor}`,
        }}
      >
        <button
          type="button"
          onClick={() =>
            currentOrderRef.current?.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            })
          }
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 600,
            color: textMain,
          }}
        >
          Tổng cộng: {total.toLocaleString()}đ
        </button>
        <button
          style={{
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 25px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
          onClick={() => setShowPaymentModal(true)}
          disabled={table.order.length === 0}
        >
          Thanh toán
        </button>
      </div>

      {editingNoteItem && (
        <NoteModal
          item={editingNoteItem}
          onClose={() => setEditingNoteItem(null)}
          onSave={(note) => {
            onUpdateNote(table.id, editingNoteItem.menuItem.id, note);
          }}
        />
      )}

      {showToppingsModal && selectedOrderItemForToppings && (
        <ToppingsModal
          menuItem={selectedOrderItemForToppings.menuItem}
          availableToppings={availableToppings}
          onConfirm={handleConfirmToppings}
          onClose={() => {
            setShowToppingsModal(false);
            setSelectedOrderItemForToppings(null);
          }}
          isDark={isDark}
        />
      )}

      {showPaymentModal && (
        <PaymentMethodModal
          total={total}
          onSelect={(method) => {
            onPayment(table.id, method);
            setShowPaymentModal(false);
          }}
          onClose={() => setShowPaymentModal(false)}
          receipt={
            table.order.length > 0 ? { tableLabel: table.name, items: table.order } : undefined
          }
        />
      )}

      {transferMode && (
        <TableTransferModal
          mode={transferMode}
          tables={transferMode === 'move' ? moveCandidates : mergeCandidates}
          onClose={() => setTransferMode(null)}
          onPick={(targetId) => {
            if (transferMode === 'move') {
              onMoveTable(table.id, targetId);
            } else {
              onMergeFromTable(table.id, targetId);
            }
            setTransferMode(null);
          }}
        />
      )}

      {toastMessage && <Toast message={toastMessage} onDone={() => setToastMessage(null)} />}
    </div>
  );
};

export default OrderView;
