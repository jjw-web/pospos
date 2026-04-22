import React, { useState } from 'react';
import type { MenuItem, ToppingItem } from '../src/types';

interface ToppingsModalProps {
  menuItem: MenuItem;
  availableToppings: ToppingItem[];
  onConfirm: (selectedToppings: ToppingItem[]) => void;
  onClose: () => void;
  isDark: boolean;
}

const ToppingsModal: React.FC<ToppingsModalProps> = ({
  menuItem,
  availableToppings,
  onConfirm,
  onClose,
  isDark
}) => {
  const [selectedToppings, setSelectedToppings] = useState<ToppingItem[]>([]);

  const toggleTopping = (topping: ToppingItem) => {
    setSelectedToppings(prev =>
      prev.find(t => t.id === topping.id)
        ? prev.filter(t => t.id !== topping.id)
        : [...prev, { ...topping, quantity: 1 }]
    );
  };

  const updateQuantity = (toppingId: number, quantity: number) => {
    if (quantity <= 0) {
      setSelectedToppings(prev => prev.filter(t => t.id !== toppingId));
    } else {
      setSelectedToppings(prev =>
        prev.map(t => t.id === toppingId ? { ...t, quantity } : t)
      );
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedToppings);
    onClose();
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: isDark ? '#1f2937' : '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '400px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: isDark ? '#f9fafb' : '#111827',
    textAlign: 'center',
  };

  const toppingItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
    borderRadius: '8px',
    marginBottom: '8px',
    backgroundColor: isDark ? '#374151' : '#f9fafb',
  };

  const toppingNameStyle: React.CSSProperties = {
    fontSize: '16px',
    color: isDark ? '#f9fafb' : '#111827',
  };

  const toppingPriceStyle: React.CSSProperties = {
    fontSize: '14px',
    color: isDark ? '#9ca3af' : '#6b7280',
  };

  const quantityControlsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const quantityBtnStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#3498db',
    color: 'white',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const quantityTextStyle: React.CSSProperties = {
    minWidth: '24px',
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
    color: isDark ? '#f9fafb' : '#111827',
  };

  const buttonRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  };

  const cancelBtnStyle: React.CSSProperties = {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
    backgroundColor: 'transparent',
    color: isDark ? '#f9fafb' : '#111827',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
  };

  const confirmBtnStyle: React.CSSProperties = {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#3498db',
    color: 'white',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
  };

  const totalStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: isDark ? '#f9fafb' : '#111827',
    textAlign: 'center',
    marginBottom: '16px',
  };

  const totalToppings = selectedToppings.reduce((sum, t) => sum + t.price * t.quantity, 0);
  const totalPrice = menuItem.price + totalToppings;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={titleStyle}>Chọn toppings cho {menuItem.name}</h2>

        <div style={totalStyle}>
          Tổng: {totalPrice.toLocaleString('vi-VN')}đ
        </div>

        <div style={{ marginBottom: '16px' }}>
          {availableToppings.map((topping) => {
            const selected = selectedToppings.find(t => t.id === topping.id);
            return (
              <div key={topping.id} style={toppingItemStyle}>
                <div>
                  <div style={toppingNameStyle}>{topping.name}</div>
                  <div style={toppingPriceStyle}>+{topping.price.toLocaleString('vi-VN')}đ</div>
                </div>
                {selected ? (
                  <div style={quantityControlsStyle}>
                    <button
                      style={quantityBtnStyle}
                      onClick={() => updateQuantity(topping.id, selected.quantity - 1)}
                    >
                      −
                    </button>
                    <span style={quantityTextStyle}>{selected.quantity}</span>
                    <button
                      style={quantityBtnStyle}
                      onClick={() => updateQuantity(topping.id, selected.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    style={quantityBtnStyle}
                    onClick={() => toggleTopping(topping)}
                  >
                    +
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div style={buttonRowStyle}>
          <button style={cancelBtnStyle} onClick={onClose}>
            Hủy
          </button>
          <button style={confirmBtnStyle} onClick={handleConfirm}>
            Thêm vào order ({totalPrice.toLocaleString('vi-VN')}đ)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToppingsModal;