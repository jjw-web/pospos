import React, { useState, useMemo } from 'react';
import { TableData, MenuCategory, MenuItem } from '../types';
import SearchBar from './SearchBar';

interface OrderViewProps {
  table: TableData;
  menuCategories: MenuCategory[];
  onBack: () => void;
  onAddItem: (tableId: number, menuItem: MenuItem) => void;
  onUpdateQuantity: (tableId: number, menuItemId: number, change: number) => void;
  onPayment: (tableId: number) => void;
}

const OrderView: React.FC<OrderViewProps> = ({
  table,
  menuCategories,
  onBack,
  onAddItem,
  onUpdateQuantity,
  onPayment,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(menuCategories[0]?.name || '');
  const [searchQuery, setSearchQuery] = useState('');

  if (!table || !table.order) {
    return <div>Đang tải...</div>;
  }

  const total = table.order.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

  const handleAddItem = (menuItem: MenuItem) => {
    onAddItem(table.id, menuItem);
  };

  const handleUpdateQuantity = (menuItemId: number, change: number) => {
    onUpdateQuantity(table.id, menuItemId, change);
  };

  const handlePayment = () => {
    onPayment(table.id);
  };

  const filteredMenuItems = useMemo(() => {
    if (searchQuery) {
      const allItems = menuCategories.flatMap(cat => cat.items);
      return allItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    const category = menuCategories.find((cat) => cat.name === selectedCategory);
    return category ? category.items : [];
  }, [selectedCategory, searchQuery, menuCategories]);

  // Styles based on the provided HTML
  const containerStyle: React.CSSProperties = {
    maxWidth: '480px',
    margin: '0 auto',
    padding: '0 15px',
    paddingBottom: '100px', // Space for checkout bar
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '15px 0',
    borderBottom: '1px solid #eaeaea',
    backgroundColor: '#fff',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  };

  const backBtnStyle: React.CSSProperties = {
    fontSize: '24px',
    marginRight: '15px',
    textDecoration: 'none',
    color: '#2c3e50',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  };

  const headerTitleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    color: '#2c3e50',
  };

  const searchContainerStyle: React.CSSProperties = {
    margin: '15px 0',
  };

  const categoriesGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '20px',
  };

  const categoryItemStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '15px 10px',
    textAlign: 'center',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
    border: '1px solid #eee',
  };
  
  const categoryItemActiveStyle: React.CSSProperties = {
      ...categoryItemStyle,
      borderColor: '#3498db',
      boxShadow: '0 4px 8px rgba(52, 152, 219, 0.2)',
      transform: 'translateY(-3px)',
  }

  const categoryNameStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 500,
    color: '#2c3e50',
  };

  const menuListStyle: React.CSSProperties = {
    marginBottom: '20px',
  };

  const menuItemStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    marginBottom: '10px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    cursor: 'pointer',
  };

  const menuItemNameStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
  };

  const menuItemPriceStyle: React.CSSProperties = {
    fontSize: '15px',
    color: '#3498db',
    fontWeight: 'bold',
  };

  const orderPanelStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
  };

  const orderTitleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '15px',
    color: '#2c3e50',
  };

  const emptyOrderStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '30px 0',
    color: '#95a5a6',
  };

  const orderItemStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0',
  };

  const orderItemNameStyle: React.CSSProperties = {
    fontSize: '16px',
  };

  const quantityControlStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const quantityButtonStyle: React.CSSProperties = {
    width: '28px',
    height: '28px',
    border: '1px solid #ddd',
    borderRadius: '50%',
    backgroundColor: '#f8f9fa',
    cursor: 'pointer',
    fontSize: '18px',
    lineHeight: '24px',
  };

  const checkoutBarStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    maxWidth: '480px',
    margin: '0 auto',
    backgroundColor: '#fff',
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
    zIndex: 100,
  };

  const totalAmountStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    color: '#2c3e50',
  };

  const checkoutBtnStyle: React.CSSProperties = {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 25px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <button style={backBtnStyle} onClick={onBack}>←</button>
        <h1 style={headerTitleStyle}>
          {table.name} - {table.status === 'available' ? 'Trống' : 'Có khách'}
        </h1>
      </div>

      <div style={searchContainerStyle}>
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="Tìm kiếm món ăn..."/>
      </div>

      <div style={categoriesGridStyle}>
        {menuCategories.map((category) => (
          <div
            key={category.name}
            style={selectedCategory === category.name && !searchQuery ? categoryItemActiveStyle : categoryItemStyle}
            onClick={() => {
              setSelectedCategory(category.name);
              setSearchQuery('');
            }}
          >
            <div style={categoryNameStyle}>{category.name}</div>
          </div>
        ))}
      </div>

      <div style={menuListStyle}>
        {filteredMenuItems.map((item) => (
          <div key={item.id} style={menuItemStyle} onClick={() => handleAddItem(item)}>
            <div>
              <div style={menuItemNameStyle}>{item.name}</div>
              <div style={menuItemPriceStyle}>{item.price.toLocaleString()}đ</div>
            </div>
            <span style={{fontSize: '24px', color: '#3498db'}}>+</span>
          </div>
        ))}
      </div>

      <div style={orderPanelStyle}>
        <h2 style={orderTitleStyle}>Đơn hàng hiện tại</h2>
        {table.order.length === 0 ? (
          <div style={emptyOrderStyle}>Chưa có món nào trong đơn hàng</div>
        ) : (
          table.order.map((item) => (
            <div key={item.menuItem.id} style={orderItemStyle}>
              <div>
                <div style={orderItemNameStyle}>{item.menuItem.name}</div>
                <div style={{color: '#888'}}>{item.menuItem.price.toLocaleString()}đ</div>
              </div>
              <div style={quantityControlStyle}>
                <button style={quantityButtonStyle} onClick={() => handleUpdateQuantity(item.menuItem.id, -1)}>-</button>
                <span>{item.quantity}</span>
                <button style={quantityButtonStyle} onClick={() => handleUpdateQuantity(item.menuItem.id, 1)}>+</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{textAlign: 'center', padding: '15px 0', color: '#7f8c8d', fontSize: '12px'}}>
        pospos.vercel.app
      </div>

      <div style={checkoutBarStyle}>
        <div style={totalAmountStyle}>Tổng cộng: {total.toLocaleString()}đ</div>
        <button 
          style={checkoutBtnStyle} 
          onClick={handlePayment}
          disabled={table.order.length === 0}
        >
          Thanh toán
        </button>
      </div>
    </div>
  );
};

export default OrderView;