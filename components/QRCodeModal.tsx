import React, { useState } from 'react';
import { QR_ACCOUNTS } from '../constants';
import type { PaymentMethod } from '../src/types';

// Thêm field method vào QR_ACCOUNTS để map đúng method khi bấm ✅
// Ví dụ: { name: 'QR BIDV', path: '/qr/bidv.png', method: 'BIDV' }
type QRAccount = (typeof QR_ACCOUNTS)[number] & { method?: PaymentMethod };

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose }) => {
  const [selectedQR, setSelectedQR] = useState<QRAccount | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setSelectedQR(null);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          transition: 'all 0.3s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {selectedQR && (
              <button
                onClick={() => setSelectedQR(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-main)',
                  fontSize: '20px',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                ←
              </button>
            )}
            <h2
              style={{
                margin: 0,
                color: 'var(--text-main)',
                fontSize: '20px',
                fontWeight: 700,
              }}
            >
              {selectedQR ? 'Chi tiết mã QR' : 'Chọn mã QR'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: '18px',
            }}
          >
            ✕
          </button>
        </div>

        {!selectedQR ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {QR_ACCOUNTS.map((qr, index) => (
              <button
                key={index}
                onClick={() => setSelectedQR(qr)}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  textAlign: 'left',
                  border: '1px solid var(--border)',
                  color: 'var(--text-main)',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--border)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <span>{qr.name}</span>
                <span style={{ opacity: 0.5 }}>→</span>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '20px',
                marginBottom: '20px',
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            >
              <img
                src={selectedQR.path}
                alt={selectedQR.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>
            <p
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--text-main)',
              }}
            >
              {selectedQR.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeModal;
