import React, { useState } from 'react';
import { TableData } from '../types';

interface TableProps {
  table: TableData;
  onSelect: (tableId: number) => void;
}

const Table: React.FC<TableProps> = ({ table, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyle: React.CSSProperties = {
    width: '100%',
    aspectRatio: '1 / 1',
    borderRadius: '9999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out',
    border: 'none',
    cursor: 'pointer',
  };

  const statusStyle: React.CSSProperties = table.status === 'available' 
    ? { backgroundColor: isHovered ? '#79a179' : '#8FBC8F' } 
    : { backgroundColor: isHovered ? '#d97706' : '#f59e0b' };

  const textStyle: React.CSSProperties = {
    fontSize: 'clamp(1.25rem, 4vw, 1.6rem)', // Responsive font size, made smaller
  };

  const hoverStyle: React.CSSProperties = {
    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
  };

  return (
    <button
      onClick={() => onSelect(table.id)}
      style={{ ...baseStyle, ...statusStyle, ...hoverStyle }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`Bàn ${table.name} - ${table.status === 'available' ? 'Trống' : 'Có khách'}`}
    >
      <span style={textStyle}>{table.name}</span>
    </button>
  );
};

export default Table;