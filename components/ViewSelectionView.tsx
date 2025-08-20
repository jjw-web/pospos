
import React from 'react';

interface ViewSelectionViewProps {
  onSelect: (view: 'inside' | 'outside') => void;
  onBack: () => void;
}

const ViewSelectionView: React.FC<ViewSelectionViewProps> = ({ onSelect, onBack }) => {

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827', // bg-gray-900
    padding: '16px',
    boxSizing: 'border-box'
  };

  const buttonsWrapperStyle: React.CSSProperties = {
    display: 'flex',
    width: '100%',
    maxWidth: '600px',
    gap: '12px',
    boxSizing: 'border-box'
  };

  const baseButtonStyle: React.CSSProperties = {
    flex: 1,
    padding: '20px 16px',
    fontSize: '18px',
    fontWeight: 700,
    borderRadius: '12px',
    cursor: 'pointer',
    textAlign: 'center',
    minHeight: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    border: 'none',
    transition: 'transform 0.2s ease'
  };

  const insideButtonStyle: React.CSSProperties = {
    ...baseButtonStyle,
    backgroundColor: '#22c55e', // bg-green-500
    color: 'white'
  };

  const outsideButtonStyle: React.CSSProperties = {
    ...baseButtonStyle,
    backgroundColor: '#3b82f6', // bg-blue-500
    color: 'white'
  };

  const backButtonStyle: React.CSSProperties = {
    ...baseButtonStyle,
    backgroundColor: '#6b7280', // bg-gray-500
    color: 'white'
  };

  return (
    <div style={containerStyle}>
      <div style={buttonsWrapperStyle}>
        <button 
          style={insideButtonStyle} 
          onClick={() => onSelect('inside')}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Trong nhà
        </button>
        <button 
          style={outsideButtonStyle} 
          onClick={() => onSelect('outside')}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Ngoài trời
        </button>
        <button 
          style={backButtonStyle} 
          onClick={onBack}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Quay lại
        </button>
      </div>
    </div>
  );
};

export default ViewSelectionView;
