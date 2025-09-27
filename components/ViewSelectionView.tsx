import React from 'react';

interface ViewSelectionViewProps {
  onSelect: (view: 'inside' | 'outside' | 'quickOrder') => void;
  onBack: () => void;
  onHistory: () => void;
}

const ViewSelectionView: React.FC<ViewSelectionViewProps> = ({ onSelect, onBack, onHistory }) => {

  const containerStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#111827', // bg-gray-900 - nền đen
    padding: '16px',
    boxSizing: 'border-box'
  };

  const wrapperStyle: React.CSSProperties = {
    maxWidth: '1280px',
    margin: '0 auto',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
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
    color: '#f8fafc', // text-slate-50 - chữ trắng cho nền đen
    marginBottom: '20px',
    textAlign: 'center'
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
    height: '120px',
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

  const quickOrderButtonStyle: React.CSSProperties = {
    ...baseButtonStyle,
    backgroundColor: '#8b5cf6', // violet-500
    color: 'white',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
  };


  const historyButtonStyle: React.CSSProperties = {
    ...baseButtonStyle,
    backgroundColor: '#f59e0b', // amber-500
    color: 'white',
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  };

  return (
    <div style={containerStyle}>
      <div style={wrapperStyle}>
        <div style={headerStyle}>
          <button 
            onClick={onBack}
            style={backButtonStyle}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
          >
            Quay lại
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
          </button>
          
          <button 
            style={quickOrderButtonStyle} 
            onClick={() => onSelect('quickOrder')}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}
          >
            <div>Quick Order</div>
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
        </div>
      </div>
    </div>
  );
};

export default ViewSelectionView;