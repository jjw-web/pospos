import React, { useState, useMemo } from 'react';
import { Bill, MenuCategory, OrderItem } from '../types';

interface HistoryViewProps {
  history: Bill[];
  onClearHistory: () => void;
  onDeleteSelected: (selectedIds: number[]) => void;
  onBack: () => void;
  menuCategories: MenuCategory[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onClearHistory, onDeleteSelected, onBack, menuCategories }) => {
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

  // Styles inspired by the new OrderView
  const containerStyle: React.CSSProperties = {
    maxWidth: '480px',
    margin: '0 auto',
    padding: '0 15px',
    paddingBottom: '100px', // Space for potential bottom bar
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '15px 0',
    borderBottom: '1px solid #eaeaea',
    backgroundColor: '#fff',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  };

  const backBtnStyle: React.CSSProperties = {
    fontSize: '24px',
    marginRight: '15px',
    textDecoration: 'none',
    color: '#2c3e50',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  };

  const headerTitleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    color: '#2c3e50',
  };

  const actionsBarSyle: React.CSSProperties = {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px',
      padding: '15px 0',
  };

  const actionButtonStyle: React.CSSProperties = {
      backgroundColor: '#ecf0f1',
      color: '#2c3e50',
      border: '1px solid #bdc3c7',
      borderRadius: '8px',
      padding: '8px 15px',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
  }

  const deleteButtonStyle: React.CSSProperties = {
      ...actionButtonStyle,
      backgroundColor: '#e74c3c',
      color: 'white',
      border: 'none',
  }

  const billItemStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '15px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
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
    color: '#7f8c8d',
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
    borderBottom: '1px solid #f9f9f9',
  };

  const emptyHistoryStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '50px 0',
    color: '#95a5a6',
  };

  const categoryHeaderStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#555',
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

      <div style={actionsBarSyle}>
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
      </div>

      {history.length === 0 ? (
        <div style={emptyHistoryStyle}>Không có lịch sử thanh toán.</div>
      ) : (
        <div>
          {history.map(bill => {
            const totalQuantity = bill.items.reduce((sum, item) => sum + item.quantity, 0);
            const groupedItems = getGroupedItems(bill.items);

            return (
                <div
                key={bill.id}
                style={selectedBills.includes(bill.id) ? billItemSelectedStyle : billItemStyle}
                onClick={() => handleSelectBill(bill.id)}
                >
                <div style={billHeaderStyle}>
                    <div style={{fontWeight: 'bold'}}>Bàn {bill.table} ({totalQuantity} món)</div>
                    <div style={billTotalStyle}>{bill.total.toLocaleString()}đ</div>
                </div>
                <div style={billMetaStyle}>
                    {new Date(bill.date).toLocaleString('vi-VN')}
                </div>
                <hr style={{border: 'none', borderTop: '1px solid #f0f0f0', margin: '15px 0'}} />
                
                {Object.entries(groupedItems).map(([category, items]) => (
                    <div key={category}>
                        <h4 style={categoryHeaderStyle}>{category}</h4>
                        <ul style={orderItemListStyle}>
                            {items.map(item => (
                            <li key={item.menuItem.id} style={orderItemStyle}>
                                <div style={{flex: 1}}>
                                    <span>{item.menuItem.name}</span>
                                    <div style={{fontSize: '12px', color: '#777'}}>{item.quantity} x {item.menuItem.price.toLocaleString()}đ</div>
                                    {item.note && <div style={noteTextStyle}>{item.note}</div>}
                                </div>
                                <span style={{fontWeight: 'bold'}}>{(item.menuItem.price * item.quantity).toLocaleString()}đ</span>
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