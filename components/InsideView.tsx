import React from 'react';
import { TableData } from '../types';
import Table from './Table';

interface InsideViewProps {
  tables: TableData[];
  onTableSelect: (tableId: number) => void;
  onBack: () => void;
}

const InsideView: React.FC<InsideViewProps> = ({ tables, onTableSelect, onBack }) => {

  const containerStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#111827', // Dark background like poker app
    padding: '16px',
  };

  const wrapperStyle: React.CSSProperties = {
    maxWidth: '1280px',
    margin: '0 auto',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: 'white',
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

  // Grid layout: 2 columns, 4 rows
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    padding: '16px',
  };

  return (
    <div style={containerStyle}>
      <div style={wrapperStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>Trong nhà</h2>
          <button 
            onClick={onBack}
            style={backButtonStyle}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
          >
            Quay lại
          </button>
        </div>
        
        {/* 2x4 Grid Layout */}
        <div style={gridStyle}>
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

export default InsideView;