import React, { useState, useRef, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import type { OrderItem, PaymentMethod, QRAccount } from '../src/types';
import { QR_ACCOUNTS } from '../constants';
import { useQRManager } from '../src/hooks/useQRManager';
import { formatReceiptText, copyTextToClipboard } from '../src/lib/receipt';
import { buildVietQRPayload, getBankShortName } from '../src/lib/vietqr';

// QR mặc định (có method thu tiền) + QR tự thêm (chưa gán method → mặc định JJW)
type ModalQRAccount = QRAccount & { method?: PaymentMethod };
type DefaultQREntry = (typeof QR_ACCOUNTS)[number] & {
  method?: PaymentMethod;
  bankBin?: string;
  accountNumber?: string;
  accountName?: string;
};

interface PaymentMethodModalProps {
  total: number;
  onSelect: (method: PaymentMethod) => void;
  onClose: () => void;
  receipt?: {
    tableLabel: string;
    items: OrderItem[];
  };
}

type Screen = 'main' | 'qrList'; // bỏ 'fullscreen' vì không dùng

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  total,
  onSelect,
  onClose,
  receipt,
}) => {
  const [screen, setScreen] = useState<Screen>('main');
  const [pendingDynamic, setPendingDynamic] = useState<ModalQRAccount | null>(null);
  const [dynamicQR, setDynamicQR] = useState<{ dataUrl: string; account: ModalQRAccount } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const hintTimeoutRef = useRef<number>();

  const qrManager = useQRManager();

  // Danh sách QR thanh toán = (mặc định chưa bị ẩn) + (tự thêm).
  // QR tự thêm chưa gán method → mặc định JJW khi bấm ✅.
  const activeQRAccounts: ModalQRAccount[] = useMemo(
    () => [
      ...(QR_ACCOUNTS as DefaultQREntry[])
        .filter((d) => !qrManager.hiddenDefaults.includes(d.name))
        .map(
          (d, i): ModalQRAccount => ({
            id: `default-${i}-${d.name}`,
            name: d.name,
            path: d.path,
            isCustom: false,
            method: d.method,
            bankBin: d.bankBin,
            accountNumber: d.accountNumber,
            accountName: d.accountName,
          })
        ),
      ...qrManager.customQRs,
    ],
    [qrManager.hiddenDefaults, qrManager.customQRs]
  );

  // ─── Wake Lock: giữ màn hình sáng khi show QR fullscreen ──────────────────
  useEffect(() => {
    if (dynamicQR && 'wakeLock' in navigator) {
      navigator.wakeLock
        .request('screen')
        .then((lock) => {
          wakeLockRef.current = lock;
        })
        .catch(() => {}); // user từ chối thì thôi
    }
    return () => {
      wakeLockRef.current?.release().catch(() => {});
      wakeLockRef.current = null;
    };
  }, [dynamicQR]);

  // ─── Cleanup timeout hint khi unmount ────────────────────────────────────
  useEffect(() => {
    return () => clearTimeout(hintTimeoutRef.current);
  }, []);

  // ─── Styles ───────────────────────────────────────────────
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Nền đen bán trong suốt
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '400px',
    width: '90%',
    backdropFilter: 'blur(10px)', // Hiệu ứng làm mờ nền
    border: '1px solid rgba(255, 255, 255, 0.1)', // Viền tinh tế, sáng hơn
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4)', // Đổ bóng đậm hơn
    maxHeight: '85vh',
    overflowY: 'auto',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 600,
    marginBottom: '16px',
    color: '#fff',
    textAlign: 'center',
  };

  const totalStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '20px',
    color: '#fff',
    textAlign: 'center',
  };

  const btnBase: React.CSSProperties = {
    padding: '14px 16px',
    border: '1px solid rgba(255, 255, 255, 0.2)', // Viền nhạt hơn
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Nền đen bán trong suốt
    color: '#fff', // Màu chữ trắng
  };

  const blueBtn: React.CSSProperties = {
    ...btnBase,
    backgroundColor: 'rgba(30, 64, 175, 0.2)', // Nền xanh lam bán trong suốt
    borderColor: 'rgba(147, 197, 253, 0.2)', // Viền nhạt hơn
    color: '#fff',
  };

  const cancelBtn: React.CSSProperties = {
    padding: '12px 24px',
    backgroundColor: 'rgba(107, 114, 128, 0.2)', // Nền xám đậm bán trong suốt
    color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 500,
    cursor: 'pointer',
    width: '100%',
  };

  // ─── Helpers ──────────────────────────────────────────────
  const showHint = (msg: string) => {
    setHint(msg);
    clearTimeout(hintTimeoutRef.current);
    hintTimeoutRef.current = window.setTimeout(() => setHint(null), 3000);
  };

  const buildReceiptText = () => {
    if (!receipt) return '';
    return formatReceiptText({
      tableLabel: receipt.tableLabel,
      items: receipt.items,
      total,
    });
  };

  const handleCopyReceipt = async () => {
    const text = buildReceiptText();
    if (!text) return;
    const ok = await copyTextToClipboard(text);
    showHint(ok ? 'Đã sao chép — dán vào Zalo/Messenger' : 'Không sao chép được');
  };

  const handleCloseModal = () => {
    setPendingDynamic(null);
    setDynamicQR(null);
    setScreen('main');
    onClose();
  };

  const closeFullscreen = () => {
    setDynamicQR(null);
    setScreen('qrList');
  };

  // ─── QR động kèm tổng tiền: xác nhận → vẽ offline ──────────────────────────
  const handleConfirmDynamic = async () => {
    if (!pendingDynamic?.bankBin || !pendingDynamic?.accountNumber) return;
    try {
      setGenerating(true);
      const payload = buildVietQRPayload({
        bankBin: pendingDynamic.bankBin,
        accountNumber: pendingDynamic.accountNumber,
        amount: total,
        note: '',
      });
      const dataUrl = await QRCode.toDataURL(payload, {
        width: 640,
        margin: 2,
        errorCorrectionLevel: 'M',
      });
      setDynamicQR({ dataUrl, account: pendingDynamic });
      setPendingDynamic(null);
    } catch (err) {
      showHint(err instanceof Error ? err.message : 'Không tạo được QR.');
    } finally {
      setGenerating(false);
    }
  };

  const bankLabelOf = (account: ModalQRAccount): string =>
    (account.bankBin && getBankShortName(account.bankBin)) || account.name.replace('QR ', '');

  return (
    <>
      <div style={overlayStyle} onClick={handleCloseModal}>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <h2 style={titleStyle}>
            {screen === 'qrList' ? 'Chọn tài khoản' : '💳 Chọn phương thức thanh toán'}
          </h2>
          <div style={totalStyle}>Tổng cộng: {total.toLocaleString()}đ</div>

          {/* Màn hình chính */}
          {screen === 'main' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button style={btnBase} onClick={handleCopyReceipt}>
                📋 Sao chép hóa đơn
              </button>
              <div style={{ height: '1px', backgroundColor: '#e0e0', margin: '10px 0' }} />
              <button style={btnBase} onClick={() => onSelect('Cash')}>
                💵 Cash (Tiền mặt)
              </button>
              <button style={btnBase} onClick={() => onSelect('BIDV')}>
                🏦 BIDV
              </button>
              <button style={btnBase} onClick={() => onSelect('JJW')}>
                💳 JJW
              </button>
              <button style={blueBtn} onClick={() => setScreen('qrList')}>
                📷 QR Thanh toán
              </button>
              <button style={cancelBtn} onClick={handleCloseModal}>
                Hủy
              </button>
              {hint && (
                <p
                  style={{
                    fontSize: '13px',
                    color: '#059669',
                    textAlign: 'center',
                    margin: '8px 0 0',
                  }}
                >
                  {hint}
                </p>
              )}
            </div>
          )}

          {/* Màn hình danh sách QR */}
          {screen === 'qrList' && !pendingDynamic && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activeQRAccounts.map((account) => (
                <div key={account.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ flex: 1, color: '#fff', fontSize: '15px', fontWeight: 600 }}>
                    {account.name.replace('QR ', '')}
                  </span>
                  {account.bankBin && account.accountNumber && (
                    <button
                      style={{
                        ...btnBase,
                        width: 'auto',
                        padding: '14px 12px',
                        fontSize: '14px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}
                      onClick={() => setPendingDynamic(account)}
                      title="Tạo QR kèm tổng tiền"
                    >
                      QR +tiền
                    </button>
                  )}
                  <button
                    style={{
                      ...btnBase,
                      width: 'auto',
                      padding: '14px 16px',
                      fontSize: '20px',
                    }}
                    onClick={() => {
                      onSelect(account.method || 'JJW');
                    }}
                    title="Xác nhận thu tiền"
                  >
                    ✅
                  </button>
                </div>
              ))}
              <button style={{...cancelBtn, opacity: 0, pointerEvents: 'auto'}} onClick={() => setScreen('main')}>
                ← Quay lại
              </button>
            </div>
          )}

          {/* Màn xác nhận trước khi tạo QR động (chống chuyển nhầm) */}
          {screen === 'qrList' && pendingDynamic && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#fff', textAlign: 'center' }}>
                Xác nhận QR kèm tiền
              </p>
              <div
                style={{
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>Tài khoản</span>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#fff', textAlign: 'right' }}>
                    {bankLabelOf(pendingDynamic)} • {pendingDynamic.accountNumber}
                  </span>
                </div>
                {pendingDynamic.accountName && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>Chủ TK</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff', textAlign: 'right' }}>
                      {pendingDynamic.accountName}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>Số tiền</span>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: '#6ee7b7' }}>
                    {total.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
              {hint && (
                <p style={{ fontSize: '13px', color: '#fca5a5', textAlign: 'center', margin: '0' }}>
                  {hint}
                </p>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  style={{ ...cancelBtn, flex: 1, width: 'auto' }}
                  onClick={() => setPendingDynamic(null)}
                >
                  ← Sửa lại
                </button>
                <button
                  style={{ ...blueBtn, flex: 1, width: 'auto', fontWeight: 700 }}
                  onClick={handleConfirmDynamic}
                  disabled={generating}
                >
                  {generating ? 'Đang tạo...' : 'Đúng rồi, tạo QR'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen QR động kèm tổng tiền */}
      {dynamicQR && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: '#fff',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '24px',
          }}
          onClick={closeFullscreen} // bấm ra ngoài để thoát
        >
          <img
            src={dynamicQR.dataUrl}
            alt={`QR ${bankLabelOf(dynamicQR.account)}`}
            style={{ width: '100%', maxWidth: '320px', borderRadius: '12px' }}
            onClick={(e) => e.stopPropagation()}
          />
          <p style={{ fontSize: '32px', fontWeight: 700, color: '#1e40af', margin: 0 }}>
            {total.toLocaleString('vi-VN')}đ
          </p>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: 0 }}>
            {bankLabelOf(dynamicQR.account)} • {dynamicQR.account.accountNumber}
          </p>
          <button onClick={closeFullscreen} style={{...cancelBtn, opacity: 0, pointerEvents: 'auto'}}>
            ← Chọn tài khoản khác
          </button>
        </div>
      )}
    </>
  );
};

export default PaymentMethodModal;
