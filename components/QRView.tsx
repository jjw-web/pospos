import React from 'react';
import QRPanel from './QRPanel';

interface QRViewProps {
  onBack: () => void;
}

/**
 * Màn hình QR riêng (thay cho popup QRCodeModal cũ).
 * Khung full màn hình kiểu HistoryView: header cố định + nút quay lại,
 * nội dung 2 tab Pics/Cash cuộn bên dưới — QR hiện to, dễ quét từ xa.
 */
const QRView: React.FC<QRViewProps> = ({ onBack }) => {
  return (
    <div
      style={{
        maxWidth: '480px',
        margin: '0 auto',
        padding: '0 15px',
        paddingTop: 'calc(84px + env(safe-area-inset-top, 0px))',
        paddingBottom: '100px',
        height: '100dvh',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        backgroundColor: 'var(--bg-page)',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          maxWidth: '480px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          padding: '15px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--bg-surface)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          zIndex: 101,
          paddingTop: 'calc(10px + env(safe-area-inset-top, 0px))',
        }}
      >
        <button
          type="button"
          style={{
            fontSize: '24px',
            marginRight: '15px',
            color: 'var(--text-main)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            opacity: 0,
            pointerEvents: 'auto',
          }}
          onClick={onBack}
        >
          ←
        </button>
        <h1
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--text-main)',
          }}
        >
          QR Code
        </h1>
      </div>

      <QRPanel />
    </div>
  );
};

export default QRView;
