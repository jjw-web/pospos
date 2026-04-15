import React, { useState, useMemo } from 'react';
import { parseOrderText } from '../src/lib/order-parser';
import { MenuItem, ParsedLine } from '../src/types';
import { Bill, OrderItem as BillOrderItem, MenuCategory, TableData } from '../types';
import SearchBar from './SearchBar';
import QuickOrderGuide from './QuickOrderGuide';

interface QuickOrderViewProps {
  onBack: () => void;
  onCompleteOrder: (order: Omit<Bill, 'id' | 'date'>) => void;
  menuCategories: MenuCategory[];
  tables: Map<number, TableData>;
  selectedTableId?: number | null;
  onTransferOrderToTable?: (tableId: number, items: OrderItem[]) => void;
}

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  note: string;
}

interface Order {
  id: number;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
}

const QuickOrderView: React.FC<QuickOrderViewProps> = ({ onBack, onCompleteOrder, menuCategories, tables, selectedTableId, onTransferOrderToTable }) => {
  const [text, setText] = useState('');
  const [parsedLines, setParsedLines] = useState<ParsedLine[]>([]);
  const [orderCreated, setOrderCreated] = useState(false);
  const [currentTableId, setCurrentTableId] = useState<number | null>(selectedTableId || null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
  const [editingNoteValue, setEditingNoteValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  const allMenuItems = useMemo(() => menuCategories.flatMap(category => category.items), [menuCategories]);

  // Helper function để kiểm tra table có order đang hoạt động
  const hasActiveOrder = (tableId: number) => {
    return localStorage.getItem(`quickOrder_table_${tableId}`) !== null;
  };

  // Hàm loại bỏ dấu tiếng Việt
  const removeVietnameseTones = (str: string): string => {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền, sắc, ngã, hỏi, nặng
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ô, Ă, Ơ, Ư
    return str;
  };

  const filteredMenu = useMemo(() => {
    if (!searchQuery) {
      return menuCategories;
    }
    const normalizedQuery = removeVietnameseTones(searchQuery);
    return menuCategories.map(category => {
      const filteredItems = category.items.filter(item => {
        const normalizedItemName = removeVietnameseTones(item.name);
        return normalizedItemName.includes(normalizedQuery);
      });
      return { ...category, items: filteredItems };
    }).filter(category => category.items.length > 0);
  }, [searchQuery, menuCategories]);

  // Khôi phục đơn hàng từ localStorage khi component mount
  React.useEffect(() => {
    const savedOrder = localStorage.getItem('currentQuickOrder');
    if (savedOrder) {
      try {
        const order = JSON.parse(savedOrder);
        setCurrentOrder(order);
        setOrderCreated(true);
      } catch (error) {
        console.error('Error parsing saved order:', error);
      }
    }
  }, []);

  // Lưu và khôi phục order theo table
  React.useEffect(() => {
    if (currentTableId) {
      // Lưu order hiện tại cho table này
      if (currentOrder) {
        localStorage.setItem(`quickOrder_table_${currentTableId}`, JSON.stringify(currentOrder));
      }
    }
  }, [currentOrder, currentTableId]);

  // Khi switch table, khôi phục order của table đó
  React.useEffect(() => {
    if (currentTableId) {
      const savedTableOrder = localStorage.getItem(`quickOrder_table_${currentTableId}`);
      if (savedTableOrder) {
        try {
          const order = JSON.parse(savedTableOrder);
          setCurrentOrder(order);
          setOrderCreated(true);
        } catch (error) {
          console.error('Error parsing saved table order:', error);
          setCurrentOrder(null);
          setOrderCreated(false);
        }
      } else {
        setCurrentOrder(null);
        setOrderCreated(false);
      }
    } else {
      setCurrentOrder(null);
      setOrderCreated(false);
    }
  }, [currentTableId]);

  // Tính tổng tiền
  const totalAmount = useMemo(() => {
    return parsedLines.reduce((total, line) => {
      if (line.matchedItem && !line.error) {
        return total + (line.matchedItem.price * line.quantity);
      }
      return total;
    }, 0);
  }, [parsedLines]);

  const totalQuantity = useMemo(() => {
    if (!currentOrder) return 0;
    return currentOrder.items.reduce((total, item) => total + item.quantity, 0);
  }, [currentOrder]);

  const handleParse = () => {
    const results = parseOrderText(text, allMenuItems);
    setParsedLines(results);
    setOrderCreated(false);
  };

  const handleCreateOrder = () => {
    const validLines = parsedLines.filter(line => line.matchedItem && !line.error);
    if (validLines.length === 0) {
      alert('Không có món nào hợp lệ để tạo đơn hàng!');
      return;
    }

    // Tạo đơn hàng
    const order: Order = {
      id: Date.now(),
      items: validLines.map(line => {
        // Combine note và toppings
        let combinedNote = line.note || '';
        if (line.toppings && line.toppings.length > 0) {
          const toppingsText = line.toppings.join(', ');
          combinedNote = combinedNote ? `${combinedNote}, ${toppingsText}` : toppingsText;
        }
        
        return {
          id: line.matchedItem!.id,
          name: line.matchedItem!.name,
          price: line.matchedItem!.price,
          quantity: line.quantity,
          note: combinedNote
        };
      }),
      totalAmount,
      createdAt: new Date().toISOString()
    };

    setCurrentOrder(order);
    setOrderCreated(true);
    
    // Lưu vào localStorage để tránh mất khi F5
    localStorage.setItem('currentQuickOrder', JSON.stringify(order));
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

  const handleUpdateQuantity = (itemIndex: number, newQuantity: number) => {
    if (!currentOrder || newQuantity < 1) return;
    
    const updatedOrder = { ...currentOrder };
    updatedOrder.items[itemIndex].quantity = newQuantity;
    updatedOrder.totalAmount = updatedOrder.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    setCurrentOrder(updatedOrder);
    
    // Cập nhật localStorage
    localStorage.setItem('currentQuickOrder', JSON.stringify(updatedOrder));
  };

  const handleRemoveItem = (itemIndex: number) => {
    if (!currentOrder) return;
    
    const updatedOrder = { ...currentOrder };
    updatedOrder.items.splice(itemIndex, 1);
    updatedOrder.totalAmount = updatedOrder.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    setCurrentOrder(updatedOrder);
    
    // Cập nhật localStorage
    localStorage.setItem('currentQuickOrder', JSON.stringify(updatedOrder));
  };

  const handleNewOrder = () => {
    setText('');
    setParsedLines([]);
    setOrderCreated(false);
    setCurrentOrder(null);
    setShowAddMenu(false);
    setEditingNoteIndex(null);
    
    // Xóa order của table hiện tại
    if (currentTableId) {
      localStorage.removeItem(`quickOrder_table_${currentTableId}`);
    } else {
      localStorage.removeItem('currentQuickOrder');
    }
  };

  const handleAddMenuItem = (menuItem: MenuItem) => {
    if (!currentOrder) return;

    const updatedOrder = { ...currentOrder };
    const existingItemIndex = updatedOrder.items.findIndex(item => item.id === menuItem.id);
    
    if (existingItemIndex !== -1) {
      // Nếu món đã có, tăng số lượng
      updatedOrder.items[existingItemIndex].quantity += 1;
    } else {
      // Nếu món chưa có, thêm mới
      updatedOrder.items.push({
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        note: ''
      });
    }
    
    updatedOrder.totalAmount = updatedOrder.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    setCurrentOrder(updatedOrder);
    
    // Lưu vào localStorage
    localStorage.setItem('currentQuickOrder', JSON.stringify(updatedOrder));
    setShowAddMenu(false);
  };

  const handleEditNote = (index: number, currentNote: string) => {
    setEditingNoteIndex(index);
    setEditingNoteValue(currentNote);
  };

  const handleSaveNote = () => {
    if (!currentOrder || editingNoteIndex === null) return;

    const updatedOrder = { ...currentOrder };
    updatedOrder.items[editingNoteIndex].note = editingNoteValue;
    setCurrentOrder(updatedOrder);
    
    // Lưu vào localStorage
    localStorage.setItem('currentQuickOrder', JSON.stringify(updatedOrder));
    setEditingNoteIndex(null);
    setEditingNoteValue('');
  };

  const handleCancelEditNote = () => {
    setEditingNoteIndex(null);
    setEditingNoteValue('');
  };

  const handleCompleteOrder = () => {
    if (!currentOrder) return;

    const billItems: BillOrderItem[] = currentOrder.items.map(item => ({
      menuItem: {
        id: item.id,
        name: item.name,
        price: item.price,
      },
      quantity: item.quantity,
      note: item.note,
    }));

    // Lấy tên bàn hoặc fallback về Quick Order nếu không chọn bàn
    const tableName = currentTableId ? tables.get(currentTableId)?.name || `Bàn ${currentTableId}` : 'Quick Order';

    const orderForHistory: Omit<Bill, 'id' | 'date'> = {
      table: tableName,
      items: billItems,
      total: currentOrder.totalAmount,
    };

    onCompleteOrder(orderForHistory);

    // Xóa đơn hàng hiện tại của table
    if (currentTableId) {
      localStorage.removeItem(`quickOrder_table_${currentTableId}`);
    } else {
      localStorage.removeItem('currentQuickOrder');
    }
    setCurrentOrder(null);
    setOrderCreated(false);
    setText('');
    setParsedLines([]);
    
    alert(`Đơn hàng đã hoàn thành và lưu vào lịch sử!\nTổng tiền: ${currentOrder.totalAmount.toLocaleString('vi-VN')} VNĐ`);
  };

  const handleTransferOrderToTable = () => {
    if (!currentOrder || !currentTableId || !onTransferOrderToTable) return;

    // Chuyển đổi OrderItem sang format tương thích với table
    const tableOrderItems = currentOrder.items.map(item => ({
      menuItem: {
        id: item.id,
        name: item.name,
        price: item.price,
      },
      quantity: item.quantity,
      note: item.note,
    }));

    onTransferOrderToTable(currentTableId, currentOrder.items);
    
    // Xóa đơn hàng hiện tại
    if (currentTableId) {
      localStorage.removeItem(`quickOrder_table_${currentTableId}`);
    }
    setCurrentOrder(null);
    setOrderCreated(false);
    setText('');
    setParsedLines([]);
    
    alert(`Đơn hàng đã được chuyển sang bàn ${tables.get(currentTableId)?.name}!`);
  };

  // Nhóm các món theo danh mục
  const groupedOrderItems = useMemo(() => {
    if (!currentOrder) return {};
    
    const groups: { [category: string]: OrderItem[] } = {};
    
    currentOrder.items.forEach(item => {
      // Tìm danh mục của món này
      const category = menuCategories.find(cat => 
        cat.items.some(menuItem => menuItem.id === item.id)
      )?.name || 'Khác';
      
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    });
    
    return groups;
  }, [currentOrder, menuCategories]);

  const containerStyle: React.CSSProperties = {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
  };

  const backBtnStyle: React.CSSProperties = {
    fontSize: '1.125rem',
    fontWeight: 'bold',
    padding: '8px 16px',
    backgroundColor: '#6b7280',
    color: 'white',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
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
            <button 
        style={backBtnStyle} 
        onClick={onBack}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
      >
        Quay lại
      </button>
      <h1>Quick Order</h1>
      
      {/* Table Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
          Chọn bàn:
        </label>
        <select
          value={currentTableId || ''}
          onChange={(e) => setCurrentTableId(e.target.value ? parseInt(e.target.value, 10) : null)}
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            backgroundColor: 'white'
          }}
        >
          <option value="">-- Chọn bàn --</option>
          {Array.from(tables.values())
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(table => (
              <option key={table.id} value={table.id}>
                {table.name} ({table.layout === 'Inside' ? 'Trong nhà' : 'Ngoài trời'})
                {hasActiveOrder(table.id) && ' 📝'}
              </option>
            ))}
        </select>
        {currentTableId && (
          <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
            Đang làm việc với: <strong>{tables.get(currentTableId)?.name}</strong>
          </div>
        )}
      </div>
      
      <p>Dán nội dung đơn hàng vào ô bên dưới. Mỗi món một dòng.</p>
      <textarea
        style={textAreaStyle}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Dán đơn hàng vào đây..."
      />
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button style={buttonStyle} onClick={handleParse}>Xử lý đơn</button>
        <button 
          style={{
            ...buttonStyle,
            backgroundColor: '#17a2b8',
            fontSize: '14px'
          }} 
          onClick={() => setShowGuide(true)}
        >
          📖 Hướng dẫn
        </button>
      </div>

      {/* Hiển thị lỗi nếu có */}
      {parsedLines.some(line => line.error) && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ color: '#dc3545' }}>Cần sửa lỗi:</h3>
          {parsedLines.filter(line => line.error).map((line, index) => (
            <div key={index} style={{
              marginBottom: '10px',
              padding: '10px',
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '4px'
            }}>
              <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>"{line.originalLine}"</p>
              <select 
                onChange={(e) => handleCorrection(parsedLines.indexOf(line), e.target.value)}
                defaultValue=""
                style={{ width: '100%', padding: '5px' }}
              >
                <option value="" disabled>-- Chọn món đúng --</option>
                {allMenuItems.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Hiển thị kết quả phân tích */}
      {parsedLines.length > 0 && !parsedLines.some(line => line.error) && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ color: '#28a745', marginBottom: '15px' }}>Kết quả phân tích:</h3>
          {parsedLines.map((line, index) => {
            // Calculate total including toppings
            const mainItemTotal = (line.matchedItem?.price || 0) * line.quantity;
            const toppingsTotal = line.toppings?.reduce((sum, t) => sum + (t.price * t.quantity), 0) || 0;
            const lineTotal = mainItemTotal + toppingsTotal;
            
            return (
            <div key={index} style={{
              marginBottom: '15px',
              padding: '12px',
              backgroundColor: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: '6px'
            }}>
              {/* Main item */}
              <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#155724' }}>
                {line.quantity} x {line.matchedItem?.name} - {mainItemTotal.toLocaleString('vi-VN')} VNĐ
              </div>
              
              {/* Toppings as separate items */}
              {line.toppings && line.toppings.length > 0 && (
                <div style={{ marginTop: '8px', marginLeft: '20px' }}>
                  {line.toppings.map((topping, tIndex) => (
                    <div key={tIndex} style={{ 
                      fontSize: '14px', 
                      color: '#1e7e34',
                      marginTop: '3px'
                    }}>
                      + {topping.quantity} x {topping.name} - {(topping.price * topping.quantity).toLocaleString('vi-VN')} VNĐ
                    </div>
                  ))}
                </div>
              )}
              
              {/* Line total */}
              {line.toppings && line.toppings.length > 0 && (
                <div style={{ 
                  marginTop: '8px', 
                  paddingTop: '5px',
                  borderTop: '1px dashed #28a745',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  color: '#155724'
                }}>
                  Tổng dòng: {lineTotal.toLocaleString('vi-VN')} VNĐ
                </div>
              )}
              
              {line.note && (
                <div style={{ 
                  marginTop: '5px', 
                  fontSize: '14px', 
                  color: '#666'
                }}>
                  Ghi chú: {line.note}
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}

      {/* Nút tạo đơn hàng */}
      {parsedLines.length > 0 && parsedLines.every(line => !line.error) && !currentOrder && (
        <div style={{
          marginTop: '20px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '2px solid #3498db',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#3498db' }}>Sẵn sàng tạo đơn hàng</h3>
          <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px 0' }}>
            Tổng tiền: {totalAmount.toLocaleString('vi-VN')} VNĐ
          </p>
          <button 
            onClick={handleCreateOrder}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#3498db',
              color: 'white',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
          >
            Tạo đơn hàng
          </button>
        </div>
      )}

      {/* Hiển thị đơn hàng hiện tại */}
      {currentOrder && (
        <div style={{ marginTop: '30px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{ margin: 0, color: '#3498db' }}>Đơn hàng hiện tại</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setShowAddMenu(!showAddMenu)}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {showAddMenu ? 'Đóng menu' : 'Thêm món'}
              </button>
              <button 
                onClick={handleCompleteOrder}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Hoàn thành
              </button>
              {currentTableId && onTransferOrderToTable && (
                <button 
                  onClick={handleTransferOrderToTable}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Chuyển sang bàn
                </button>
              )}
              <button 
                onClick={handleNewOrder}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Tạo đơn mới
              </button>
            </div>
          </div>

          {/* Menu thêm món */}
          {showAddMenu && (
            <div style={{
              marginBottom: '20px',
              backgroundColor: '#e9ecef',
              borderRadius: '8px',
              padding: '20px',
              border: '1px solid #dee2e6'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#495057' }}>Chọn món để thêm:</h3>
              <SearchBar 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery} 
                placeholder="Tìm món..." 
                onClear={() => setSearchQuery('')}
              />
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '10px',
                marginTop: '15px'
              }}>
                {filteredMenu.map(category => (
                  <div key={category.name}>
                    <h4 style={{ 
                      margin: '0 0 8px 0', 
                      fontSize: '14px', 
                      fontWeight: 'bold',
                      color: '#3498db'
                    }}>
                      {category.name}
                    </h4>
                    {category.items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleAddMenuItem(item)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          margin: '2px 0',
                          fontSize: '12px',
                          backgroundColor: 'white',
                          border: '1px solid #dee2e6',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                      >
                        {item.name} - {item.price.toLocaleString('vi-VN')} VNĐ
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            padding: '20px',
            border: '2px solid #3498db'
          }}>
            {Object.entries(groupedOrderItems).map(([category, items]) => (
              <div key={category}>
                <h4 style={{
                  margin: '0 0 15px 0',
                  padding: '8px 12px',
                  backgroundColor: '#3498db',
                  color: 'white',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}>
                  {category}
                </h4>
                
                {items.map((item, itemIndex) => {
                  // Tạo một key duy nhất cho mỗi item
                  const itemKey = `${item.id}-${item.name}-${itemIndex}`;
                  const globalIndex = currentOrder.items.findIndex(orderItem => 
                    orderItem.id === item.id && orderItem.name === item.name
                  );
                  
                  return (
                    <div key={itemKey} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 0',
                      borderBottom: itemIndex < items.length - 1 ? '1px solid #dee2e6' : 'none',
                      marginLeft: '10px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{item.name}</div>
                        {editingNoteIndex === globalIndex ? (
                          <div style={{ marginTop: '5px' }}>
                            <input
                              type="text"
                              value={editingNoteValue}
                              onChange={(e) => setEditingNoteValue(e.target.value)}
                              placeholder="Nhập ghi chú..."
                              style={{
                                width: '100%',
                                padding: '4px 8px',
                                fontSize: '12px',
                                border: '1px solid #3498db',
                                borderRadius: '4px',
                                outline: 'none'
                              }}
                            />
                            <div style={{ marginTop: '5px', display: 'flex', gap: '5px' }}>
                              <button
                                onClick={handleSaveNote}
                                style={{
                                  padding: '2px 8px',
                                  fontSize: '10px',
                                  backgroundColor: '#3498db',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '3px',
                                  cursor: 'pointer'
                                }}
                              >
                                Lưu
                              </button>
                              <button
                                onClick={handleCancelEditNote}
                                style={{
                                  padding: '2px 8px',
                                  fontSize: '10px',
                                  backgroundColor: '#6c757d',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '3px',
                                  cursor: 'pointer'
                                }}
                              >
                                Hủy
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: '14px', color: '#6c757d', fontStyle: 'italic', marginTop: '5px' }}>
                            {item.note ? (
                              <span>
                                Ghi chú: {item.note}
                                <button
                                  onClick={() => handleEditNote(globalIndex, item.note)}
                                  style={{
                                    marginLeft: '8px',
                                    padding: '2px 6px',
                                    fontSize: '10px',
                                    backgroundColor: '#17a2b8',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Sửa
                                </button>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleEditNote(globalIndex, '')}
                                style={{
                                  padding: '2px 6px',
                                  fontSize: '10px',
                                  backgroundColor: '#17a2b8',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '3px',
                                  cursor: 'pointer'
                                }}
                              >
                                Thêm ghi chú
                              </button>
                            )}
                          </div>
                        )}
                        <div style={{ fontSize: '14px', color: '#6c757d' }}>
                          {item.price.toLocaleString('vi-VN')} VNĐ
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <button
                            onClick={() => {
                              const globalIndex = currentOrder.items.findIndex(orderItem => 
                                orderItem.id === item.id && orderItem.name === item.name
                              );
                              if (globalIndex !== -1) {
                                handleUpdateQuantity(globalIndex, item.quantity - 1);
                              }
                            }}
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '50%',
                              border: '1px solid #dc3545',
                              backgroundColor: 'white',
                              color: '#dc3545',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: 'bold'
                            }}
                          >
                            -
                          </button>
                          <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: 'bold' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => {
                              const globalIndex = currentOrder.items.findIndex(orderItem => 
                                orderItem.id === item.id && orderItem.name === item.name
                              );
                              if (globalIndex !== -1) {
                                handleUpdateQuantity(globalIndex, item.quantity + 1);
                              }
                            }}
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '50%',
                              border: '1px solid #3498db',
                              backgroundColor: 'white',
                              color: '#3498db',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: 'bold'
                            }}
                          >
                            +
                          </button>
                        </div>
                        
                        <div style={{ minWidth: '100px', textAlign: 'right', fontWeight: 'bold' }}>
                          {(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ
                        </div>
                        
                        <button
                          onClick={() => {
                            const globalIndex = currentOrder.items.findIndex(orderItem => 
                              orderItem.id === item.id && orderItem.name === item.name
                            );
                            if (globalIndex !== -1) {
                              handleRemoveItem(globalIndex);
                            }
                          }}
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            border: '1px solid #dc3545',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                {Object.keys(groupedOrderItems).indexOf(category) < Object.keys(groupedOrderItems).length - 1 && (
                  <div style={{ height: '15px' }}></div>
                )}
              </div>
            ))}
            
            <div style={{
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '2px solid #3498db',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3498db', marginBottom: '5px' }}>
                  Tổng tiền: {currentOrder.totalAmount.toLocaleString('vi-VN')} VNĐ
                </div>
                <div style={{ fontSize: '16px', color: '#555', fontWeight: 'bold' }}>
                  Tổng số lượng: {totalQuantity}
                </div>
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d', textAlign: 'right' }}>
                {new Date(currentOrder.createdAt).toLocaleString('vi-VN')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hiển thị hướng dẫn */}
      {showGuide && <QuickOrderGuide onClose={() => setShowGuide(false)} />}
    </div>
  );
};

export default QuickOrderView;