import React from 'react';

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ message, onConfirm, onCancel }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '340px',
          width: '100%',
          boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p
          style={{
            fontSize: '15px',
            color: 'var(--text-main)',
            margin: '0 0 20px 0',
            lineHeight: 1.5,
            textAlign: 'center',
          }}
        >
          {message}
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '10px',
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
            onClick={onCancel}
          >
            Hủy
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#e74c3c',
              color: 'white',
              cursor: 'pointer',
            }}
            onClick={onConfirm}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
