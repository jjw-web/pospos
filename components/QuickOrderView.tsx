import React, { useState, useMemo } from 'react';
import { MENU_CATEGORIES } from '../constants';
import { parseOrderText, ParsedLine } from '../src/lib/order-parser';
import { MenuItem } from '../types';

interface QuickOrderViewProps {
  onBack: () => void;
}

const QuickOrderView: React.FC<QuickOrderViewProps> = ({ onBack }) => {
  const [text, setText] = useState('');
  const [parsedLines, setParsedLines] = useState<ParsedLine[]>([]);

  const allMenuItems = useMemo(() => MENU_CATEGORIES.flatMap(category => category.items), []);

  const handleParse = () => {
    const results = parseOrderText(text, allMenuItems);
    setParsedLines(results);
  };

  const handleCorrection = (index: number, selectedMenuItemId: string) => {
    const newParsedLines = [...parsedLines];
    const lineToUpdate = newParsedLines[index];
    const selectedItem = allMenuItems.find(item => item.id === parseInt(selectedMenuItemId, 10));

    if (lineToUpdate && selectedItem) {
      lineToUpdate.matchedItem = selectedItem;
      lineToUpdate.error = undefined; // Clear the error
      
      // Re-evaluate the note: remove the new item name from original line
      const noteRegex = new RegExp(selectedItem.name.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&'), 'i');
      const originalTextWithoutQuantity = lineToUpdate.originalLine.replace(/^(?:sl:?|x)?\s*(\d+)\s*|(.*)\s*(?:x|sl:?)\s*(\d+)$/i, '$2$3').trim();
      lineToUpdate.note = originalTextWithoutQuantity.replace(noteRegex, '').trim();

      setParsedLines(newParsedLines);
    }
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
  };

  const backBtnStyle: React.CSSProperties = {
    marginBottom: '20px',
  };

  const textAreaStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '150px',
    padding: '10px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '1px solid #ccc',
  };

  const buttonStyle: React.CSSProperties = {
    marginTop: '10px',
    padding: '10px 20px',
    fontSize: '16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#3498db',
    color: 'white',
    cursor: 'pointer',
  };

  const resultItemStyle: React.CSSProperties = {
    border: '1px solid #eee',
    borderRadius: '8px',
    padding: '15px',
    marginTop: '15px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  };

  const errorItemStyle: React.CSSProperties = {
    ...resultItemStyle,
    borderColor: '#e74c3c',
    backgroundColor: '#fbeae5',
  };

  return (
    <div style={containerStyle}>
      <button style={backBtnStyle} onClick={onBack}>← Quay Lại</button>
      <h1>Quick Order</h1>
      <p>Dán nội dung đơn hàng vào ô bên dưới. Mỗi món một dòng.</p>
      <textarea
        style={textAreaStyle}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ví dụ:\n2 sữa chua dẻo hoa quả\n1 cafe đen ít đường..."
      />
      <button style={buttonStyle} onClick={handleParse}>Xử lý đơn</button>

      <div style={{ marginTop: '30px' }}>
        <h2>Kết quả xử lý</h2>
        {parsedLines.map((line, index) => (
          <div key={index} style={line.error ? errorItemStyle : resultItemStyle}>
            <p><em>Dòng gốc: "{line.originalLine}"</em></p>
            {line.error ? (
              <div>
                <p style={{ color: '#c0392b', fontWeight: 'bold' }}>Không tìm thấy món</p>
                <select 
                  onChange={(e) => handleCorrection(index, e.target.value)}
                  defaultValue=""
                  style={{marginTop: '10px', width: '100%', padding: '8px'}}
                >
                  <option value="" disabled>-- Chọn món đúng --</option>
                  {allMenuItems.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <p><strong>Món:</strong> {line.matchedItem?.name}</p>
                <p><strong>Số lượng:</strong> {line.quantity}</p>
                {line.note && <p><strong>Ghi chú:</strong> {line.note}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickOrderView;