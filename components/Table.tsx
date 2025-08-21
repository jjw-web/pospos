import React, { useState } from 'react';
import { TableData } from '../types';

interface TableProps {
  table: TableData;
  onSelect: (tableId: number) => void;
}

const Table: React.FC<TableProps> = ({ table, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Oval card container style
  const cardContainerStyle: React.CSSProperties = {
    width: '100%',
    aspectRatio: '2.5 / 1', // Oval shape ratio
    borderRadius: '20px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    transform: isHovered ? 'scale(1.02)' : 'scale(1)',
    boxShadow: isHovered 
      ? '0 8px 25px rgba(0, 0, 0, 0.3)' 
      : '0 4px 12px rgba(0, 0, 0, 0.2)',
  };

  // Purple banner at top
  const bannerStyle: React.CSSProperties = {
    height: '30%',
    backgroundColor: '#7c3aed', // Purple banner
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 16px',
    boxSizing: 'border-box',
  };

  // Teal-green main body
  const bodyStyle: React.CSSProperties = {
    height: '70%',
    backgroundColor: table.status === 'available' ? '#14b8a6' : '#f59e0b', // Teal for available, amber for occupied
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    boxSizing: 'border-box',
    position: 'relative',
  };

  // Banner text style
  const bannerTextStyle: React.CSSProperties = {
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold',
    textAlign: 'center',
  };

  // Main content style
  const mainTextStyle: React.CSSProperties = {
    color: 'white',
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: '0',
  };

  // Status indicator
  const statusStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '8px',
    right: '12px',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: table.status === 'available' ? '#22c55e' : '#ef4444',
    border: '2px solid white',
  };

  return (
    <div
      style={cardContainerStyle}
      onClick={() => onSelect(table.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`Bàn ${table.name} - ${table.status === 'available' ? 'Trống' : 'Có khách'}`}
    >
      {/* Purple Banner */}
      <div style={bannerStyle}>
        <span style={bannerTextStyle}>
          {table.status === 'available' ? 'BÀN TRỐNG' : 'BÀN CÓ KHÁCH'}
        </span>
      </div>
      
      {/* Teal/Amber Body */}
      <div style={bodyStyle}>
        <h3 style={mainTextStyle}>{table.name}</h3>
        <div style={statusStyle}></div>
      </div>
    </div>
  );
};

export default Table;