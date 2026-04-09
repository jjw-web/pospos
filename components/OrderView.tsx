import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { TableData, MenuCategory, MenuItem, OrderItem } from '../types';
import SearchBar from './SearchBar';
import NoteModal from './NoteModal';
import PaymentMethodModal, { PaymentMethod } from './PaymentMethodModal';
import TableTransferModal, { TableTransferMode } from './TableTransferModal';
import Toast from './Toast';
import { useTheme } from '../src/context/ThemeContext';
import { formatOccupiedDuration } from '../src/lib/table-utils';

// A simple note icon
const NoteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

interface OrderViewProps {
  table: TableData;
  menuCategories: MenuCategory[];
  allTables: TableData[];
  onBack: () => void;
  onAddItem: (tableId: number, menuItem: MenuItem) => void;
  onUpdateQuantity: (tableId: number, menuItemId: number, change: number) => void;
  onPayment: (tableId: number, paymentMethod: PaymentMethod) => void;
  onUpdateNote: (tableId: number, menuItemId: number, note: string) => void;
  onMoveTable: (fromId: number, toId: number) => void;
  onMergeFromTable: (currentId: number, sourceId: number) => void;
  onAddTopping?: (tableId: number, mainItemId: number, toppingItem: MenuItem) => void;
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

  const [selectedCategory, setSelectedCategory] = useState<string>(menuCategories[0]?.name || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNoteItem, setEditingNoteItem] = useState<OrderItem | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [transferMode, setTransferMode] = useState<TableTransferMode | null>(null);
  const [, headerTick] = useState(0);
  const currentOrderRef = useRef<HTMLDivElement>(null);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const scrollToCurrentOrder = useCallback(() => {
    currentOrderRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  useEffect(() => {
    if (table.status !== 'occupied' || !table.occupiedSince) return;
    const id = window.setInterval(() => headerTick((n) => n + 1), 30000);
    return () => window.clearInterval(id);
  }, [table.status, table.occupiedSince]);

  const order = table?.order ?? [];
  const total = order.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const totalQuantity = order.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddItem = (menuItem: MenuItem) => {
    onAddItem(table.id, menuItem);
    setToastMessage(`Đã thêm «${menuItem.name}»`);
  };

  const handleUpdateQuantity = (menuItemId: number, change: number) => {
    onUpdateQuantity(table.id, menuItemId, change);
  };

  const handlePayment = () => {
    setShowPaymentModal(true);
  };

  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    onPayment(table.id, method);
    setShowPaymentModal(false);
  };

  const handleSaveNote = (note: string) => {
    if (editingNoteItem) {
      onUpdateNote(table.id, editingNoteItem.menuItem.id, note);
    }
  };

  // Hàm loại bỏ dấu tiếng Việt
  const removeVietnameseTones = (str: string): string => {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền, sắc, ngã, hỏi, nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ô, Ă, Ơ, Ư
    return str;
  };

  const filteredMenuItems = useMemo(() => {
    if (searchQuery) {
      const allItems = menuCategories.flatMap(cat => cat.items);
      const normalizedQuery = removeVietnameseTones(searchQuery);
      return allItems.filter((item) => {
        const normalizedItemName = removeVietnameseTones(item.name);
        return normalizedItemName.includes(normalizedQuery);
      });
    }
    const category = menuCategories.find((cat) => cat.name === selectedCategory);
    return category ? category.items : [];
  }, [selectedCategory, searchQuery, menuCategories]);

  const groupedOrder = useMemo(() => {
    const grouped: { [category: string]: OrderItem[] } = {};
    const itemToCategoryMap = new Map<number, string>();
    menuCategories.forEach(category => {
        category.items.forEach(item => {
            itemToCategoryMap.set(item.id, category.name);
        });
    });

    order.forEach(item => {
      const categoryName = itemToCategoryMap.get(item.menuItem.id) || 'Khác';
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(item);
    });
    return grouped;
  }, [order, menuCategories]);

  const moveCandidates = useMemo(
    () =>
      allTables.filter(
        (t) => t.id !== table.id && t.status === 'available' && t.order.length === 0
      ),
    [allTables, table.id]
  );

  const mergeCandidates = useMemo(
    () =>
      allTables.filter(
        (t) => t.id !== table.id && t.status === 'occupied' && t.order.length > 0
      ),
    [allTables, table.id]
  );

  const surface = isDark ? '#1e293b' : '#ffffff';
  const pageBg = isDark ? '#0f172a' : '#f5f5f5';
  const textMain = isDark ? '#f1f5f9' : '#2c3e50';
  const textMuted = isDark ? '#94a3b8' : '#7f8c8d';
  const borderColor = isDark ? '#334155' : '#eaeaea';
  const cardBorder = isDark ? '#475569' : '#eee';

  const containerStyle: React.CSSProperties = {
    maxWidth: '480px',
    margin: '0 auto',
    padding: '0 15px',
    paddingTop: 'calc(52px + env(safe-area-inset-top, 0px))',
    paddingBottom: '100px',
    backgroundColor: pageBg,
    minHeight: '100vh',
    boxSizing: 'border-box',
  };

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

  const backBtnStyle: React.CSSProperties = {
    fontSize: '24px',
    marginRight: '15px',
    textDecoration: 'none',
    color: textMain,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  };

  const headerTitleStyle: React.CSSProperties = {
    fontSize: '17px',
    fontWeight: 600,
    color: textMain,
    margin: 0,
    flex: '1 1 120px',
    minWidth: 0,
  };

  const subHeaderStyle: React.CSSProperties = {
    fontSize: '13px',
    color: textMuted,
    margin: '4px 0 0 0',
    width: '100%',
  };

  const searchContainerStyle: React.CSSProperties = {
    margin: '15px 0',
  };

  const categoriesGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '20px',
  };

  const categoryItemStyle: React.CSSProperties = {
    backgroundColor: surface,
    borderRadius: '10px',
    padding: '15px 10px',
    textAlign: 'center',
    boxShadow: isDark ? '0 2px 5px rgba(0,0,0,0.2)' : '0 2px 5px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
    border: `1px solid ${cardBorder}`,
  };
  
  const categoryItemActiveStyle: React.CSSProperties = {
      ...categoryItemStyle,
      borderColor: '#3498db',
      boxShadow: '0 4px 8px rgba(52, 152, 219, 0.2)',
      transform: 'translateY(-3px)',
  }

  const categoryNameStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 500,
    color: textMain,
  };

  const menuListStyle: React.CSSProperties = {
    marginBottom: '20px',
  };

  const menuItemStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: surface,
    borderRadius: '8px',
    marginBottom: '10px',
    boxShadow: isDark ? '0 2px 5px rgba(0,0,0,0.2)' : '0 2px 5px rgba(0,0,0,0.05)',
    cursor: 'pointer',
    border: `1px solid ${isDark ? '#334155' : 'transparent'}`,
  };

  const menuItemNameStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    color: textMain,
  };

  const menuItemPriceStyle: React.CSSProperties = {
    fontSize: '15px',
    color: '#3498db',
    fontWeight: 'bold',
  };

  const orderPanelStyle: React.CSSProperties = {
    backgroundColor: surface,
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: isDark ? '0 2px 10px rgba(0,0,0,0.25)' : '0 2px 10px rgba(0,0,0,0.08)',
    scrollMarginTop: 'calc(52px + env(safe-area-inset-top, 0px))',
    border: `1px solid ${isDark ? '#334155' : 'transparent'}`,
  };

  const orderTitleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '15px',
    color: textMain,
  };

  const emptyOrderStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '30px 0',
    color: textMuted,
  };

  const orderItemStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: `1px solid ${isDark ? '#334155' : '#f0f0f0'}`,
  };

  const orderItemNameStyle: React.CSSProperties = {
    fontSize: '16px',
    color: textMain,
  };

  const quantityControlStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const quantityButtonStyle: React.CSSProperties = {
    width: '28px',
    height: '28px',
    border: `1px solid ${isDark ? '#475569' : '#ddd'}`,
    borderRadius: '50%',
    backgroundColor: isDark ? '#334155' : '#f8f9fa',
    color: textMain,
    cursor: 'pointer',
    fontSize: '18px',
    lineHeight: '24px',
  };

  const checkoutBarStyle: React.CSSProperties = {
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
  };

  const totalAmountStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    color: textMain,
  };

  const checkoutBtnStyle: React.CSSProperties = {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 25px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
  };

  const categoryHeaderStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 'bold',
    color: textMain,
    marginTop: '20px',
    marginBottom: '10px',
    borderBottom: `1px solid ${borderColor}`,
    paddingBottom: '5px',
  };

  const noteTextStyle: React.CSSProperties = {
    fontSize: '13px',
    color: '#e74c3c',
    marginTop: '4px',
  };

  const noteButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    marginLeft: '10px',
    color: '#3498db',
  };

  const actionRowBtn: React.CSSProperties = {
    flex: 1,
    padding: '8px 10px',
    fontSize: '13px',
    fontWeight: 600,
    borderRadius: '8px',
    border: `1px solid ${isDark ? '#475569' : '#cbd5e1'}`,
    background: isDark ? '#334155' : '#f1f5f9',
    color: textMain,
    cursor: 'pointer',
  };

  if (!table || table.order === undefined) {
    return <div style={{ padding: 24, color: textMain }}>Đang tải...</div>;
  }

  const durationLabel =
    table.status === 'occupied' ? formatOccupiedDuration(table.occupiedSince) : null;

  return (
    <div style={containerStyle}>
      <div style={headerBarStyle}>
        <button type="button" style={backBtnStyle} onClick={onBack} aria-label="Quay lại chọn bàn">
          ←
        </button>
        <div 
          style={{ flex: '1 1 160px', minWidth: 0, cursor: 'pointer' }}
          onClick={scrollToTop}
          title="Click để cuộn lên đầu trang"
        >
          <h1 style={headerTitleStyle}>
            {table.name} — {table.status === 'available' ? 'Trống' : 'Có khách'}
            {durationLabel ? ` · ${durationLabel}` : ''}
          </h1>
        </div>
      </div>

      <p style={subHeaderStyle}>
        Chuyển / gộp bàn khi khách đổi chỗ. Thêm món sẽ có thông báo nhỏ phía dưới.
      </p>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button
          type="button"
          style={actionRowBtn}
          onClick={() => setTransferMode('move')}
          disabled={table.order.length === 0 || moveCandidates.length === 0}
        >
          Chuyển bàn
        </button>
        <button
          type="button"
          style={actionRowBtn}
          onClick={() => setTransferMode('merge')}
          disabled={mergeCandidates.length === 0}
        >
          Gộp bàn
        </button>
      </div>

      <div style={searchContainerStyle}>
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder="Tìm kiếm món ăn..."
          darkMode={isDark}
        />
      </div>

      <div style={categoriesGridStyle}>
        {menuCategories.map((category) => (
          <div
            key={category.name}
            style={selectedCategory === category.name && !searchQuery ? categoryItemActiveStyle : categoryItemStyle}
            onClick={() => {
              setSelectedCategory(category.name);
              setSearchQuery('');
            }}
          >
            <div style={categoryNameStyle}>{category.name}</div>
          </div>
        ))}
      </div>

      <div style={menuListStyle}>
        {filteredMenuItems.map((item) => (
          <div key={item.id} style={menuItemStyle} onClick={() => handleAddItem(item)}>
            <div>
              <div style={menuItemNameStyle}>{item.name}</div>
              <div style={menuItemPriceStyle}>{item.price.toLocaleString()}đ</div>
            </div>
            <span style={{fontSize: '24px', color: '#3498db'}}>+</span>
          </div>
        ))}
      </div>

      <div ref={currentOrderRef} style={orderPanelStyle}>
        <h2 style={orderTitleStyle}>Đơn hàng hiện tại ({totalQuantity})</h2>
        {table.order.length === 0 ? (
          <div style={emptyOrderStyle}>Chưa có món nào trong đơn hàng</div>
        ) : (
          Object.entries(groupedOrder).map(([category, items]) => (
            <div key={category}>
              <h3 style={categoryHeaderStyle}>{category}</h3>
              {items.map((item) => (
                <div key={item.menuItem.id} style={orderItemStyle}>
                  <div>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <div style={orderItemNameStyle}>{item.menuItem.name}</div>
                        <button style={noteButtonStyle} onClick={() => setEditingNoteItem(item)}>
                            <NoteIcon />
                        </button>
                        {item.note && <div style={noteTextStyle}>{item.note}</div>}
                    </div>
                    <div style={{ color: textMuted }}>{item.menuItem.price.toLocaleString()}đ</div>
                  </div>
                  <div style={quantityControlStyle}>
                    <button type="button" style={quantityButtonStyle} onClick={() => handleUpdateQuantity(item.menuItem.id, -1)}>-</button>
                    <span style={{ color: textMain, minWidth: '22px', textAlign: 'center' }}>{item.quantity}</span>
                    <button type="button" style={quantityButtonStyle} onClick={() => handleUpdateQuantity(item.menuItem.id, 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      <div style={{ textAlign: 'center', padding: '15px 0', color: textMuted, fontSize: '12px' }}>
        pospos.vercel.app
      </div>

      <div style={checkoutBarStyle}>
        <button
          type="button"
          onClick={scrollToCurrentOrder}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            textAlign: 'left',
            ...totalAmountStyle,
          }}
          aria-label="Cuộn tới đơn hàng hiện tại"
        >
          Tổng cộng: {total.toLocaleString()}đ
        </button>
        <button 
          style={checkoutBtnStyle} 
          onClick={handlePayment}
          disabled={table.order.length === 0}
        >
          Thanh toán
        </button>
      </div>

      {editingNoteItem && (
        <NoteModal
          item={editingNoteItem}
          onClose={() => setEditingNoteItem(null)}
          onSave={handleSaveNote}
        />
      )}

      {showPaymentModal && (
        <PaymentMethodModal
          total={total}
          onSelect={handleSelectPaymentMethod}
          onClose={() => setShowPaymentModal(false)}
          receipt={
            table.order.length > 0
              ? { tableLabel: table.name, items: table.order }
              : undefined
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

      {toastMessage && (
        <Toast message={toastMessage} onDone={() => setToastMessage(null)} />
      )}
    </div>
  );
};

export default OrderView;