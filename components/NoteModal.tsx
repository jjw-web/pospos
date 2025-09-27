import React, { useState, useEffect } from 'react';
import { OrderItem } from '../types';
import { PREDEFINED_NOTES } from '../constants';

interface NoteModalProps {
  item: OrderItem;
  onClose: () => void;
  onSave: (note: string) => void;
}

const NoteModal: React.FC<NoteModalProps> = ({ item, onClose, onSave }) => {
  const [note, setNote] = useState(item.note || '');

  useEffect(() => {
    setNote(item.note || '');
  }, [item]);

  const handleSave = () => {
    onSave(note);
    onClose();
  };

  const addPredefinedNote = (predefinedNote: string) => {
    setNote(prev => prev ? `${prev}, ${predefinedNote}` : predefinedNote);
  };

  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  };

  const modalContentStyle: React.CSSProperties = {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '400px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  };

  const modalHeaderStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '15px',
  };

  const textAreaStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '80px',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '16px',
    marginBottom: '15px',
  };

  const tagsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '20px',
  };

  const tagStyle: React.CSSProperties = {
    background: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '16px',
    padding: '6px 12px',
    fontSize: '14px',
    cursor: 'pointer',
  };

  const buttonsContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
  };

  const saveButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#3498db',
    color: 'white',
  };

  const cancelButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#ecf0f1',
    color: '#2c3e50',
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={modalHeaderStyle}>Ghi chú cho: {item.menuItem.name}</h3>
        <div style={tagsContainerStyle}>
          {PREDEFINED_NOTES.map(predefinedNote => (
            <button key={predefinedNote} style={tagStyle} onClick={() => addPredefinedNote(predefinedNote)}>
              {predefinedNote}
            </button>
          ))}
        </div>
        <textarea
          style={textAreaStyle}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Hoặc nhập ghi chú riêng..."
        />
        <div style={buttonsContainerStyle}>
          <button style={cancelButtonStyle} onClick={onClose}>Hủy</button>
          <button style={saveButtonStyle} onClick={handleSave}>Lưu</button>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;
