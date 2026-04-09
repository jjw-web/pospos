// components/QuickOrderGuide.tsx
import React from 'react';
import { QUICK_ORDER_GUIDE } from '../src/lib/abbreviation-rules';

interface QuickOrderGuideProps {
  onClose: () => void;
}

const QuickOrderGuide: React.FC<QuickOrderGuideProps> = ({ onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#333', fontSize: '24px' }}>📖 Hướng Dẫn Quick Order</h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ✕
          </button>
        </div>
        
        <div style={{ 
          whiteSpace: 'pre-line', 
          fontFamily: 'monospace', 
          fontSize: '14px', 
          lineHeight: '1.5',
          color: '#333'
        }}>
          {QUICK_ORDER_GUIDE}
        </div>
        
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Đã hiểu!
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickOrderGuide;
