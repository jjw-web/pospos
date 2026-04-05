import React, { useState } from 'react';
import type { OrderItem } from '../types';
import { formatReceiptText, copyTextToClipboard, shareReceiptText } from '../src/lib/receipt';

export type PaymentMethod = 'Cash' | 'BIDV' | 'Tintin';

interface PaymentMethodModalProps {
  total: number;
  onSelect: (method: PaymentMethod) => void;
  onClose: () => void;
  receipt?: {
    tableLabel: string;
    items: OrderItem[];
  };
}

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({ total, onSelect, onClose, receipt }) => {
  const [receiptHint, setReceiptHint] = useState<string | null>(null);

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 600,
    marginBottom: '20px',
    color: '#2c3e50',
    textAlign: 'center',
  };

  const totalStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '24px',
    color: '#3498db',
    textAlign: 'center',
  };

  const methodsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
  };

  const methodButtonStyle: React.CSSProperties = {
    padding: '16px 20px',
    backgroundColor: '#f8f9fa',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: '#2c3e50',
  };

  const secondaryRowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
  };

  const secondaryBtnStyle: React.CSSProperties = {
    padding: '12px 16px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #6ee7b7',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    color: '#065f46',
  };

  const cancelButtonStyle: React.CSSProperties = {
    padding: '12px 24px',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 500,
    cursor: 'pointer',
    width: '100%',
  };

  const buildReceiptBody = () => {
    if (!receipt) return '';
    return formatReceiptText({
      tableLabel: receipt.tableLabel,
      items: receipt.items,
      total,
    });
  };

  const handleCopyReceipt = async () => {
    const text = buildReceiptBody();
    if (!text) return;
    const ok = await copyTextToClipboard(text);
    setReceiptHint(ok ? 'Đã sao chép — dán vào Zalo/Messenger' : 'Không sao chép được, thử trình duyệt khác');
    window.setTimeout(() => setReceiptHint(null), 2800);
  };

  const handleShareReceipt = async () => {
    const text = buildReceiptBody();
    if (!text) return;
    const ok = await shareReceiptText(text, 'Hóa đơn Bống Cà Phê');
    setReceiptHint(ok ? 'Đã mở chia sẻ hoặc sao chép' : 'Hãy dùng Sao chép hóa đơn');
    window.setTimeout(() => setReceiptHint(null), 2800);
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={titleStyle}>Chọn phương thức thanh toán</h2>
        <div style={totalStyle}>Tổng cộng: {total.toLocaleString()}đ</div>

        {receipt && receipt.items.length > 0 && (
          <div style={secondaryRowStyle}>
            <button type="button" style={secondaryBtnStyle} onClick={handleCopyReceipt}>
              📋 Sao chép hóa đơn (Zalo/Messenger)
            </button>
            <button type="button" style={{ ...secondaryBtnStyle, backgroundColor: '#eff6ff', borderColor: '#93c5fd', color: '#1e40af' }} onClick={handleShareReceipt}>
              📤 Chia sẻ / Gửi
            </button>
            {receiptHint && (
              <p style={{ margin: 0, fontSize: '13px', color: '#059669', textAlign: 'center' }}>{receiptHint}</p>
            )}
          </div>
        )}

        <div style={methodsContainerStyle}>
          <button
            type="button"
            style={methodButtonStyle}
            onClick={() => onSelect('Cash')}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#e3f2fd';
              e.currentTarget.style.borderColor = '#3498db';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
              e.currentTarget.style.borderColor = '#e0e0e0';
            }}
          >
            💵 Cash (Tiền mặt)
          </button>
          <button
            type="button"
            style={methodButtonStyle}
            onClick={() => onSelect('BIDV')}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#e3f2fd';
              e.currentTarget.style.borderColor = '#3498db';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
              e.currentTarget.style.borderColor = '#e0e0e0';
            }}
          >
            🏦 BIDV
          </button>
          <button
            type="button"
            style={methodButtonStyle}
            onClick={() => onSelect('Tintin')}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#e3f2fd';
              e.currentTarget.style.borderColor = '#3498db';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
              e.currentTarget.style.borderColor = '#e0e0e0';
            }}
          >
            💳 Tintin
          </button>
        </div>
        <button
          type="button"
          style={cancelButtonStyle}
          onClick={onClose}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
        >
          Hủy
        </button>
      </div>
    </div>
  );
};

export default PaymentMethodModal;
