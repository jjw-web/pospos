import React, { useState } from 'react';
import type { OrderItem } from '../types';
import { QR_ACCOUNTS } from '../constants';
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
  const [showQRList, setShowQRList] = useState(false);

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
    maxHeight: '80vh',
    overflowY: 'auto',
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

  const handleShareWithQR = async (qrAccount: typeof QR_ACCOUNTS[0]) => {
    const text = buildReceiptBody();
    if (!text) return;
    
    // Copy text to clipboard
    await copyTextToClipboard(text);
    
    // Web Share API if supported
    if (navigator.share) {
      try {
        const response = await fetch(qrAccount.path);
        const blob = await response.blob();
        const file = new File([blob], 'qr_code.png', { type: 'image/png' });
        
        await navigator.share({
          text: text,
          files: [file],
          title: 'Hóa đơn Bống Cà Phê'
        });
        setReceiptHint('Đã chia sẻ hóa đơn kèm QR');
      } catch (err) {
        setReceiptHint('Đã copy text, hãy dán QR thủ công');
      }
    } else {
      setReceiptHint('Đã copy hóa đơn, vui lòng lưu ảnh QR bên dưới');
    }
    setShowQRList(false);
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={titleStyle}>{showQRList ? 'Chọn tài khoản QR' : 'Chọn phương thức thanh toán'}</h2>
        <div style={totalStyle}>Tổng cộng: {total.toLocaleString()}đ</div>

        {receipt && receipt.items.length > 0 && !showQRList && (
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
          {showQRList ? (
            <>
              {QR_ACCOUNTS.map((account) => (
                <button
                  key={account.name}
                  type="button"
                  style={methodButtonStyle}
                  onClick={() => handleShareWithQR(account)}
                >
                  📷 {account.name}
                </button>
              ))}
              <button type="button" style={{ ...cancelButtonStyle, marginTop: '8px' }} onClick={() => setShowQRList(false)}>Quay lại</button>
            </>
          ) : (
            <>
              <button
                type="button"
                style={methodButtonStyle}
                onClick={() => onSelect('Cash')}
              >
                💵 Cash (Tiền mặt)
              </button>
              <button
                type="button"
                style={methodButtonStyle}
                onClick={() => onSelect('BIDV')}
              >
                🏦 BIDV
              </button>
              <button
                type="button"
                style={methodButtonStyle}
                onClick={() => onSelect('Tintin')}
              >
                💳 JJW
              </button>
              <button
                type="button"
                style={{ ...methodButtonStyle, backgroundColor: '#eff6ff', borderColor: '#93c5fd', color: '#1e40af' }}
                onClick={() => setShowQRList(true)}
              >
                💳 Gửi hóa đơn kèm QR
              </button>
            </>
          )}
        </div>

        {!showQRList && (
          <button
            type="button"
            style={cancelButtonStyle}
            onClick={onClose}
          >
            Hủy
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodModal;
