import React, { useState, useRef } from 'react';
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

type Screen = 'main' | 'qrList' | 'fullscreen';

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({ total, onSelect, onClose, receipt }) => {
  const [screen, setScreen] = useState<Screen>('main');
  const [selectedQR, setSelectedQR] = useState<typeof QR_ACCOUNTS[0] | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const wakeLockRef = useRef<any>(null);

  // ─── Styles ───────────────────────────────────────────────
  const overlayStyle: React.CSSProperties = {
    position: 'fixed', inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000,
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    maxHeight: '85vh',
    overflowY: 'auto',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '20px', fontWeight: 600,
    marginBottom: '16px', color: '#2c3e50', textAlign: 'center',
  };

  const totalStyle: React.CSSProperties = {
    fontSize: '18px', fontWeight: 600,
    marginBottom: '20px', color: '#3498db', textAlign: 'center',
  };

  const btnBase: React.CSSProperties = {
    padding: '14px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '15px', fontWeight: 500,
    cursor: 'pointer', width: '100%',
    backgroundColor: '#f8f9fa', color: '#2c3e50',
  };

  const blueBtn: React.CSSProperties = {
    ...btnBase,
    backgroundColor: '#eff6ff', borderColor: '#93c5fd', color: '#1e40af',
  };

  const cancelBtn: React.CSSProperties = {
    padding: '12px 24px', backgroundColor: '#6b7280',
    color: 'white', border: 'none', borderRadius: '8px',
    fontSize: '15px', fontWeight: 500, cursor: 'pointer', width: '100%',
  };

  // ─── Helpers ──────────────────────────────────────────────
  const showHint = (msg: string) => {
    setHint(msg);
    window.setTimeout(() => setHint(null), 3000);
  };

  const buildReceiptText = () => {
    if (!receipt) return '';
    return formatReceiptText({ tableLabel: receipt.tableLabel, items: receipt.items, total });
  };

  const handleCopyReceipt = async () => {
    const text = buildReceiptText();
    if (!text) return;
    const ok = await copyTextToClipboard(text);
    showHint(ok ? '✅ Đã sao chép — dán vào Zalo/Messenger' : '❌ Không sao chép được');
  };

  const handleShareReceipt = async () => {
    const text = buildReceiptText();
    if (!text) return;
    const ok = await shareReceiptText(text, 'Hóa đơn Bống Cà Phê');
    showHint(ok ? '✅ Đã mở chia sẻ' : 'Hãy dùng Sao chép hóa đơn');
  };

  const handleShareWithQR = async (account: typeof QR_ACCOUNTS[0]) => {
    const text = buildReceiptText();
    if (!text) return;

    await copyTextToClipboard(text);

    try {
      const response = await fetch(encodeURI(account.path));
      const blob = await response.blob();
      const file = new File([blob], 'qr_payment.png', { type: 'image/png' });

      // @ts-ignore
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: 'Hóa đơn Bống Cà Phê', text, files: [file] });
        showHint('✅ Đã chia sẻ hóa đơn kèm QR');
        return;
      }
    } catch {}

    showHint('📋 Đã copy hóa đơn — lưu ảnh QR bên dưới để gửi kèm');
  };

  return (
    <>
      <div style={overlayStyle} onClick={onClose}>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <h2 style={titleStyle}>
            {screen === 'qrList' ? '🏦 Chọn tài khoản' : '💳 Chọn phương thức thanh toán'}
          </h2>
          <div style={totalStyle}>Tổng cộng: {total.toLocaleString()}đ</div>

          {/* Màn hình chính */}
          {screen === 'main' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button style={btnBase} onClick={handleCopyReceipt}>📋 Sao chép hóa đơn</button>
              <div style={{ height: '1px', backgroundColor: '#e0e0e0', margin: '10px 0' }} />
              <button style={btnBase} onClick={() => onSelect('Cash')}>💵 Cash (Tiền mặt)</button>              <button style={btnBase} onClick={() => onSelect('BIDV')}>🏦 BIDV</button>
              <button style={btnBase} onClick={() => onSelect('Tintin')}>💳 JJW</button>
              <button style={blueBtn} onClick={() => setScreen('qrList')}>📷 QR Thanh toán</button>
              <button style={cancelBtn} onClick={onClose}>Hủy</button>
              {hint && <p style={{ fontSize: '13px', color: '#059669', textAlign: 'center' }}>{hint}</p>}
            </div>
          )}

          {/* Màn hình danh sách QR */}
          {screen === 'qrList' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {QR_ACCOUNTS.map((account) => (
                <div key={account.name} style={{ display: 'flex', gap: '8px' }}>
                  <button
                    style={{ ...blueBtn, flex: 1, textAlign: 'left' }}
                    onClick={() => handleShareWithQR(account)}
                  >
                    📤 {account.name.replace('QR ', '')}
                  </button>
                  <button
                    style={{ ...btnBase, width: 'auto', padding: '14px 16px', fontSize: '20px' }}
                    onClick={() => { setSelectedQR(account); setScreen('fullscreen'); }}
                    title="Khách quét tại chỗ"
                  >
                    🖥️
                  </button>
                  <button
                    style={{ ...btnBase, width: 'auto', padding: '14px 16px', fontSize: '20px', backgroundColor: '#dcfce7', borderColor: '#86efac' }}
                    onClick={() => onSelect('Tintin')}
                    title="Xác nhận thu tiền"
                  >
                    ✅
                  </button>
                </div>
              ))}
              <button style={cancelBtn} onClick={() => setScreen('main')}>← Quay lại</button>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen QR */}
      {selectedQR && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: '#fff', zIndex: 9999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '16px', padding: '24px'
        }}>
          <img src={selectedQR.path} alt={selectedQR.name} style={{ width: '100%', maxWidth: '320px', borderRadius: '12px' }} />
          <p style={{ fontSize: '32px', fontWeight: 700, color: '#1e40af' }}>{total.toLocaleString()}đ</p>
          <button
            onClick={() => { setSelectedQR(null); setScreen('qrList'); }}
            style={cancelBtn}>
            ← Chọn tài khoản khác
          </button>
        </div>
      )}
    </>
  );
};

export default PaymentMethodModal;
