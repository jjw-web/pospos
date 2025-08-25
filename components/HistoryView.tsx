
import React, { useState } from 'react';
import { Bill } from '../types';

interface HistoryViewProps {
  history: Bill[];
  onClearHistory: () => void;
  onDeleteSelected: (selectedIds: number[]) => void;
  onBack: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onClearHistory, onDeleteSelected, onBack }) => {
  const [selectedBills, setSelectedBills] = useState<number[]>([]);

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
    }
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedBills.length} hóa đơn đã chọn không?`)) {
      onDeleteSelected(selectedBills);
      setSelectedBills([]);
    }
  };

  const containerStyle: React.CSSProperties = {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
  };

  const backButtonStyle: React.CSSProperties = {
    padding: '12px 24px',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
  };

  const clearButtonStyle: React.CSSProperties = {
    padding: '12px 24px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    marginLeft: '16px',
  };

  const deleteSelectedButtonStyle: React.CSSProperties = {
    padding: '12px 24px',
    backgroundColor: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    marginLeft: '16px',
  };

  const billListStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  };

  const billItemStyle: React.CSSProperties = {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const billItemSelectedStyle: React.CSSProperties = {
    ...billItemStyle,
    borderColor: '#8FBC8F',
    backgroundColor: '#f0f9ff',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Lịch sử thanh toán</h1>
        <div>
          <button style={backButtonStyle} onClick={onBack}>
            ← Quay lại
          </button>
          <button style={deleteSelectedButtonStyle} onClick={handleDeleteSelected} disabled={selectedBills.length === 0}>
            Xóa đã chọn
          </button>
          <button style={clearButtonStyle} onClick={handleClearHistory} disabled={history.length === 0}>
            Xóa tất cả
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <p>Không có lịch sử thanh toán.</p>
      ) : (
        <div style={billListStyle}>
          {history.map(bill => (
            <div
              key={bill.id}
              style={selectedBills.includes(bill.id) ? billItemSelectedStyle : billItemStyle}
              onClick={() => handleSelectBill(bill.id)}
            >
              <p><strong>Bàn:</strong> {bill.table}</p>
              <p><strong>Tổng tiền:</strong> {bill.total.toLocaleString()}đ</p>
              <p><strong>Thời gian:</strong> {new Date(bill.date).toLocaleString()}</p>
              <ul>
                {bill.items.map(item => (
                  <li key={item.menuItem.id}>
                    {item.menuItem.name} x {item.quantity}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryView;
