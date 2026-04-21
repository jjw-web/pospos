import React, { useState, useMemo, useRef } from 'react';
import { Bill, MenuCategory, OrderItem } from '../types';
import { useTheme } from '../src/context/ThemeContext';
import { toPng } from 'html-to-image';

interface HistoryViewProps {
  history: Bill[];
  onClearHistory: () => void;
  onDeleteSelected: (selectedIds: number[]) => void;
  onBack: () => void;
  menuCategories: MenuCategory[];
  onRevertBill?: (bill: Bill) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onClearHistory, onDeleteSelected, onBack, menuCategories, onRevertBill }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const surface = isDark ? '#1e293b' : '#ffffff';
  const pageBg = isDark ? '#0f172a' : '#f5f5f5';
  const textMain = isDark ? '#f1f5f9' : '#2c3e50';
  const textMuted = isDark ? '#94a3b8' : '#7f8c8d';
  const borderColor = isDark ? '#334155' : '#eaeaea';

  const [selectedBills, setSelectedBills] = useState<number[]>([]);

  const itemToCategoryMap = useMemo(() => {
    const map = new Map<number, string>();
    menuCategories.forEach(category => {
        category.items.forEach(item => {
            map.set(item.id, category.name);
        });
    });
    return map;
  }, [menuCategories]);

  const historySummary = useMemo(() => {
    const totalRevenue = history.reduce((sum, bill) => sum + bill.total, 0);
    const totalItemsSold = history.reduce((sum, bill) => {
      return sum + bill.items.reduce((itemSum, item) => {
        const toppingCount = item.toppings?.reduce((tSum, t) => tSum + t.quantity, 0) || 0;
        return itemSum + item.quantity + toppingCount;
      }, 0);
    }, 0);
    return {
      totalRevenue,
      totalBills: history.length,
      totalItemsSold,
    };
  }, [history]);

  const isAllSelected = selectedBills.length === history.length && history.length > 0;
  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedBills([]);
    } else {
      setSelectedBills(history.map((bill) => bill.id));
    }
  };

  const getGroupedItems = (items: OrderItem[]) => {
    const grouped: { [category: string]: OrderItem[] } = {};
    items.forEach(item => {
        const categoryName = itemToCategoryMap.get(item.menuItem.id) || 'Khác';
        if (!grouped[categoryName]) {
            grouped[categoryName] = [];
        }
        grouped[categoryName].push(item);
    });
    return grouped;
  };

  const handleSelectBill = (billId: number) => {
    setSelectedBills(prevSelected =>
      prevSelected.includes(billId)
        ? prevSelected.filter(id => id !== billId)
        : [...prevSelected, billId]
    );
  };

  const handleClearHistory = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử không?')) {
      onClearHistory();
      setSelectedBills([]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedBills.length > 0 && window.confirm(`Bạn có chắc chắn muốn xóa ${selectedBills.length} hóa đơn đã chọn không?`)) {
      onDeleteSelected(selectedBills);
      setSelectedBills([]);
    }
  };

  const handleExportSelected = async () => {
    if (selectedBills.length === 0) {
      alert("Vui lòng chọn hóa đơn cần xuất ảnh");
      return;
    }
    
    const bill = history.find(b => b.id === selectedBills[0]);
    if (!bill) return;

    const element = cardRefs.current.get(bill.id);
    if (!element) {
      alert("Không tìm thấy hóa đơn để xuất ảnh");
      return;
    }

    try {
      const dataUrl = await toPng(element, { pixelRatio: 2, backgroundColor: surface });
      const link = document.createElement('a');
      link.download = `Hoa-don-Ban-${bill.table}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Lỗi xuất ảnh:', err);
      alert("Không thể xuất ảnh lúc này.");
    }
  };

  const handleRevertSelected = () => {
    if (selectedBills.length === 0 || !onRevertBill) {
      alert("Vui lòng chọn hóa đơn cần hoàn tác");
      return;
    }
    const bill = history.find(b => b.id === selectedBills[0]);
    if (bill) {
      onRevertBill(bill);
      setSelectedBills([]);
    }
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '480px',
    margin: '0 auto',
    padding: '0 15px',
    paddingBottom: '100px',
    minHeight: '100vh',
    backgroundColor: pageBg,
    boxSizing: 'border-box',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '15px 0',
    borderBottom: `1px solid ${borderColor}`,
    backgroundColor: surface,
    position: 'sticky',
    top: 0,
    zIndex: 100,
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
    fontSize: '18px',
    fontWeight: 600,
    color: textMain,
  };

  const actionsBarSyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '10px',
      padding: '15px 0',
  };

  const summaryCardStyle: React.CSSProperties = {
    backgroundColor: surface,
    borderRadius: '16px',
    padding: '14px 18px',
    border: `1px solid ${borderColor}`,
    color: textMain,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  const actionButtonStyle: React.CSSProperties = {
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
  }

  const deleteButtonStyle: React.CSSProperties = {
      ...actionButtonStyle,
      backgroundColor: '#e74c3c',
      color: 'white',
      border: 'none',
  }

  const billItemStyle: React.CSSProperties = {
    backgroundColor: surface,
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '15px',
    boxShadow: isDark ? '0 2px 10px rgba(0,0,0,0.25)' : '0 2px 10px rgba(0,0,0,0.08)',
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: 'border-color 0.3s',
  };

  const billItemSelectedStyle: React.CSSProperties = {
    ...billItemStyle,
    borderColor: '#3498db',
  };

  const billHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  };

  const billTotalStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#3498db',
  };

  const billMetaStyle: React.CSSProperties = {
    fontSize: '13px',
    color: textMuted,
  };

  const orderItemListStyle: React.CSSProperties = {
    listStyle: 'none',
    paddingLeft: '0',
    fontSize: '14px',
  };

  const orderItemStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '8px 0',
    borderBottom: `1px solid ${isDark ? '#334155' : '#f9f9f9'}`,
    color: textMain,
  };

  const emptyHistoryStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '50px 0',
    color: textMuted,
  };

  const categoryHeaderStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: isDark ? '#cbd5e1' : '#555',
    marginTop: '15px',
    marginBottom: '8px',
  };

  const noteTextStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#e74c3c',
    paddingLeft: '10px',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <button style={backBtnStyle} onClick={onBack}>←</button>
        <h1 style={headerTitleStyle}>Lịch sử thanh toán</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginTop: '16px' }}>
        <div style={summaryCardStyle}>
          <span style={{ color: textMuted, fontSize: '13px' }}>Số hóa đơn</span>
          <strong style={{ fontSize: '22px' }}>{historySummary.totalBills}</strong>
        </div>



        <div style={summaryCardStyle}>
          <span style={{ color: textMuted, fontSize: '13px' }}>Doanh thu</span>
          <strong style={{ fontSize: '22px' }}>{historySummary.totalRevenue.toLocaleString()}đ</strong>
        </div>
      </div>

      <div style={actionsBarSyle}>
        <button
          style={actionButtonStyle}
          onClick={handleToggleSelectAll}
          disabled={history.length === 0}
        >
          {isAllSelected ? 'Bỏ chọn tất cả' : `Chọn tất cả (${history.length})`}
        </button>
        <button 
            style={actionButtonStyle}
            onClick={handleDeleteSelected} 
            disabled={selectedBills.length === 0}
        >
            Xóa mục đã chọn ({selectedBills.length})
        </button>
        <button 
            style={deleteButtonStyle}
            onClick={handleClearHistory} 
            disabled={history.length === 0}
        >
            Xóa tất cả
        </button>
        <button 
            style={actionButtonStyle}
            onClick={handleExportSelected} 
            disabled={selectedBills.length === 0}
        >
            Xuất ảnh ({selectedBills.length})
        </button>
        <button 
            style={actionButtonStyle}
            onClick={handleRevertSelected} 
            disabled={selectedBills.length === 0 || !onRevertBill}
        >
            Hoàn tác
        </button>
      </div>

      {history.length === 0 ? (
        <div style={emptyHistoryStyle}>Không có lịch sử thanh toán.</div>
      ) : (
        <div>
          {history.map(bill => {
            let mainCount = 0;
            let toppingCount = 0;
            let snackCount = 0;

            bill.items.forEach(item => {
              const categoryName = itemToCategoryMap.get(item.menuItem.id) || 'Khác';
              const categoryLower = categoryName.toLowerCase();
              const itemQty = item.quantity;

              if (categoryLower.includes('topping') || categoryLower.includes('phụ gia') || categoryLower.includes('gia vị')) {
                toppingCount += itemQty;
              } else if (categoryLower.includes('snack') || categoryLower.includes('khai vị') || categoryLower.includes('đồ ăn nhẹ')) {
                snackCount += itemQty;
              } else {
                mainCount += itemQty;
              }

              const extraToppings = item.toppings?.reduce((tSum, t) => tSum + t.quantity, 0) || 0;
              toppingCount += extraToppings;
            });

            const groupedItems = getGroupedItems(bill.items);

            return (
                <div
                key={bill.id}
                ref={(el) => { if (el) cardRefs.current.set(bill.id, el); }}
                style={selectedBills.includes(bill.id) ? billItemSelectedStyle : billItemStyle}
                onClick={() => handleSelectBill(bill.id)}
                >
                <div style={billHeaderStyle}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={selectedBills.includes(bill.id)}
                        onChange={(e) => { e.stopPropagation(); handleSelectBill(bill.id); }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span style={{ fontWeight: 'bold', color: textMain }}>Bàn {bill.table}</span>
                    </label>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600, color: textMain }}>{bill.total.toLocaleString()}đ</div>
                      <div style={{ fontSize: '12px', color: textMuted }}>
                        {mainCount > 0 ? `Đồ uống: ${mainCount}` : ''}
                        {snackCount > 0 ? `${mainCount > 0 ? ', ' : ''}Snack: ${snackCount}` : ''}
                        {toppingCount > 0 ? `${mainCount > 0 || snackCount > 0 ? ', ' : ''}Topping: ${toppingCount}` : ''}
                      </div>
                    </div>
                </div>
                <div style={billMetaStyle}>
                    {new Date(bill.date).toLocaleString('vi-VN')}
                    {bill.paymentMethod && (
                      <span style={{marginLeft: '10px', color: '#3498db', fontWeight: 500}}>
                        • {bill.paymentMethod === 'Cash' ? '💵 Tiền mặt' : bill.paymentMethod === 'BIDV' ? '🏦 BIDV' : '💳 JJW'}
                      </span>
                    )}
                </div>
                <hr style={{border: 'none', borderTop: `1px solid ${borderColor}`, margin: '15px 0'}} />
                
                {Object.entries(groupedItems).map(([category, items]) => (
                    <div key={category}>
                        <h4 style={categoryHeaderStyle}>{category}</h4>
                        <ul style={orderItemListStyle}>
                            {items.map((item, index) => (
                            <li key={`${item.menuItem.id}-${index}`} style={orderItemStyle}>
                                <div style={{flex: 1}}>
                                    <span>{item.menuItem.name}</span>
                                    <div style={{fontSize: '12px', color: textMuted}}>{item.quantity} x {item.menuItem.price.toLocaleString()}đ</div>
                                    {item.note && <div style={noteTextStyle}>{item.note}</div>}
                                    {item.toppings && item.toppings.length > 0 && (
                                      <div style={{ marginTop: '6px', fontSize: '12px', color: textMuted, paddingLeft: '10px' }}>
                                        {item.toppings.map((topping, tIndex) => (
                                          <div key={`${item.menuItem.id}-topping-${tIndex}`}>
                                            + {topping.quantity} x {topping.name} — {(topping.price * topping.quantity).toLocaleString()}đ
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                </div>
                                <span style={{fontWeight: 'bold'}}>{((item.menuItem.price * item.quantity) + (item.toppings?.reduce((tSum, t) => tSum + t.price * t.quantity, 0) || 0)).toLocaleString()}đ</span>
                            </li>
                            ))}
                        </ul>
                    </div>
                ))}
                </div>
            )
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryView;