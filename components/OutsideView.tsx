import React from 'react';
import { TableData } from '../types';
import Table from './Table';

interface OutsideViewProps {
  tables: TableData[];
  onTableSelect: (tableId: number) => void;
  onBack: () => void;
}

const OutsideView: React.FC<OutsideViewProps> = ({ tables, onTableSelect, onBack }) => {

  const containerStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#f3f4f6', // bg-gray-100
    padding: '16px',
  };

  const wrapperStyle: React.CSSProperties = {
    maxWidth: '1280px', // max-w-7xl
    margin: '0 auto',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '1.875rem', // text-3xl
    fontWeight: 'bold',
    color: '#1f2937', // text-gray-800
  };

  const backButtonStyle: React.CSSProperties = {
    fontSize: '1.125rem', // text-lg
    fontWeight: 'bold',
    padding: '8px 16px',
    backgroundColor: '#4b5563', // bg-gray-600
    color: 'white',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  };

  return (
    <div style={containerStyle}>
      <div style={wrapperStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>Ngoài trời</h2>
          <button 
            onClick={onBack}
            style={backButtonStyle}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1f2937'} // hover:bg-gray-800
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
          >
            Quay lại
          </button>
        </div>
        
        {/* Responsive grid layout classes are kept for functionality */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {tables.map((table) => (
            <div key={table.id}>
              <Table table={table} onSelect={onTableSelect} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OutsideView;