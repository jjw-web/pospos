import React from 'react';

interface QuickOrderViewProps {
  onBack: () => void;
}

const QuickOrderView: React.FC<QuickOrderViewProps> = ({ onBack }) => {
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100vh',
    backgroundColor: 'white',
    padding: '16px',
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

  return (
    <div style={containerStyle}>
      <button 
        onClick={onBack}
        style={backButtonStyle}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
      >
        Quay lại
      </button>
    </div>
  );
};

export default QuickOrderView;
