import React from 'react';
import type { TableData } from '../src/types';

export type TableTransferMode = 'move' | 'merge';

interface TableTransferModalProps {
  mode: TableTransferMode;
  tables: TableData[];
  onPick: (tableId: number) => void;
  onClose: () => void;
}

const TableTransferModal: React.FC<TableTransferModalProps> = ({
  mode,
  tables,
  onPick,
  onClose,
}) => {
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '14px',
    padding: '20px',
    width: '100%',
    maxWidth: '400px',
    maxHeight: '70vh',
    overflow: 'auto',
    boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
  };

  const title = mode === 'move' ? 'Chuyển sang bàn trống' : 'Gộp đơn từ bàn (chọn bàn có khách)';

  const hint =
    mode === 'move'
      ? 'Chỉ hiện bàn đang trống, không có món.'
      : 'Chọn bàn có đơn để gộp vào bàn hiện tại.';

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ margin: '0 0 8px', fontSize: '18px', color: '#1e293b' }}>{title}</h2>
        <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#64748b' }}>{hint}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tables.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>Không có bàn phù hợp.</p>
          ) : (
            tables.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onPick(t.id)}
                style={{
                  padding: '14px 16px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: '#0f172a',
                }}
              >
                {t.name}
                <span style={{ fontWeight: 400, color: '#64748b', marginLeft: '8px' }}>
                  ({t.layout === 'Inside' ? 'Trong nhà' : 'Ngoài trời'})
                </span>
              </button>
            ))
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: '16px',
            width: '100%',
            padding: '12px',
            border: 'none',
            borderRadius: '8px',
            background: '#64748b',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Hủy
        </button>
      </div>
    </div>
  );
};

export default TableTransferModal;
