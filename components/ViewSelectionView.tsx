import React, { useState } from 'react';
import type { TableAreaStats } from '../types';
import { useTheme } from '../src/context/ThemeContext';
import QRCodeModal from './QRCodeModal';

interface ViewSelectionViewProps {
  onSelect: (view: 'inside' | 'outside' | 'menu') => void;
  onBack: () => void;
  onHistory: () => void;
  insideStats: TableAreaStats;
  outsideStats: TableAreaStats;
}

const ViewSelectionView: React.FC<ViewSelectionViewProps> = ({
  onSelect,
  onBack,
  onHistory,
  insideStats,
  outsideStats,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const areaHintStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 500,
    marginTop: '10px',
    opacity: 0.92,
    lineHeight: 1.35,
    maxWidth: '95%',
  };

  const formatAreaHint = (stats: TableAreaStats) => {
    if (stats.total === 0) return 'Chưa có bàn';
    if (stats.occupied === 0) return `Cả ${stats.total} bàn đang trống`;
    if (stats.occupied === stats.total) return `Cả ${stats.total} bàn đang có khách`;
    return `${stats.occupied}/${stats.total} bàn đang có khách`;
  };

  const containerStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: theme === 'dark' ? '#111827' : '#f1f5f9',
    padding: '16px',
    boxSizing: 'border-box',
    transition: 'background-color 0.2s ease',
  };

  const wrapperStyle: React.CSSProperties = {
    maxWidth: '1280px',
    margin: '0 auto',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '24px',
  };

  const backButtonStyle: React.CSSProperties = {
    fontSize: '1.125rem',
    fontWeight: 'bold',
    padding: '8px 16px',
    backgroundColor: '#6b7280',
    color: 'white',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: 'bold',
    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
    marginBottom: '20px',
    textAlign: 'center',
  };

  const buttonsWrapperStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    width: '100%',
    maxWidth: '800px',
    gap: '20px',
    boxSizing: 'border-box',
    margin: '0 auto'
  };

  const baseButtonStyle: React.CSSProperties = {
    minHeight: '120px',
    height: 'auto',
    padding: '16px 12px',
    fontSize: '20px',
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    border: 'none',
    borderRadius: '16px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    position: 'relative',
    overflow: 'hidden'
  };

  const insideButtonStyle: React.CSSProperties = {
    ...baseButtonStyle,
    backgroundColor: '#10b981', // emerald-500
    color: 'white',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  };

  const outsideButtonStyle: React.CSSProperties = {
    ...baseButtonStyle,
    backgroundColor: '#3b82f6', // blue-500
    color: 'white',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
  };

  const historyButtonStyle: React.CSSProperties = {
    ...baseButtonStyle,
    backgroundColor: '#f59e0b', // amber-500
    color: 'white',
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  };

  const dailySummaryButtonStyle: React.CSSProperties = {
    ...baseButtonStyle,
    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    color: 'white',
  };

  const qrButtonStyle: React.CSSProperties = {
    ...baseButtonStyle,
    background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
    color: 'white',
  };

  const menuButtonStyle: React.CSSProperties = {
    ...baseButtonStyle,
    backgroundColor: '#ec4899', // pink-500
    color: 'white',
    background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    gridColumn: '1 / -1' // Span full width
  };

  const themeBtnStyle: React.CSSProperties = {
    fontSize: '0.95rem',
    fontWeight: 600,
    padding: '8px 14px',
    backgroundColor: theme === 'dark' ? '#374151' : '#e2e8f0',
    color: theme === 'dark' ? '#f9fafb' : '#1e293b',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
  };

  return (
    <div style={containerStyle}>
      <div style={wrapperStyle}>
        <div style={headerStyle}>
          <button
            type="button"
            onClick={onBack}
            style={backButtonStyle}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
          >
            Quay lại
          </button>
          <button type="button" style={themeBtnStyle} onClick={toggleTheme}>
            {theme === 'dark' ? '☀️ Sáng' : '🌙 Tối'}
          </button>
        </div>
        
        <div style={buttonsWrapperStyle}>
          <button 
            style={insideButtonStyle} 
            onClick={() => onSelect('inside')}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}
          >
            <div>Trong Nhà</div>
            <div style={areaHintStyle}>{formatAreaHint(insideStats)}</div>
          </button>
          
          <button 
            style={outsideButtonStyle} 
            onClick={() => onSelect('outside')}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}
          >
            <div>Ngoài Trời</div>
            <div style={areaHintStyle}>{formatAreaHint(outsideStats)}</div>
          </button>
          
          <button 
            style={historyButtonStyle} 
            onClick={onHistory}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}
          >
            <div>Lịch Sử</div>
          </button>



          <button
            type="button"
            style={qrButtonStyle}
            onClick={() => setIsQRModalOpen(true)}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}
          >
            <div>Mã QR</div>
            <div style={{ ...areaHintStyle, opacity: 0.95 }}>Thanh toán nhanh</div>
          </button>

          <button 
            style={menuButtonStyle} 
            onClick={() => onSelect('menu')}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}
          >
            <div>Quản Lý Menu</div>
          </button>
        </div>
      </div>
      <QRCodeModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} />
    </div>
  );
};

export default ViewSelectionView;