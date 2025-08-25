
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
    const category = menuCategories.find((cat) => cat.name === selectedCategory);
    if (!category) return [];
    if (!searchQuery) return category.items;
    return category.items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [selectedCategory, searchQuery, menuCategories]);

  const containerStyle: React.CSSProperties = {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  };

  const tableInfoStyle: React.CSSProperties = {
    textAlign: 'center',
  };

  const tableNameStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
  };

  const tableStatusStyle: React.CSSProperties = {
    fontSize: '16px',
    color: '#666',
  };

  const backButtonStyle: React.CSSProperties = {
    padding: '12px 24px',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
  };

  const contentStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  };

  const menuSectionStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  };

  const categoryTabsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  };

  const categoryTabStyle: React.CSSProperties = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '14px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
  };

  const categoryTabActiveStyle: React.CSSProperties = {
    ...categoryTabStyle,
    backgroundColor: '#8FBC8F',
    color: 'white',
  };

  const menuGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  };

  const menuItemStyle: React.CSSProperties = {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const menuItemHoverStyle: React.CSSProperties = {
    ...menuItemStyle,
    borderColor: '#8FBC8F',
    backgroundColor: '#f0f9ff',
  };

  const menuItemNameStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#333',
  };

  const menuItemPriceStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#8FBC8F',
  };

  const orderSectionStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  };

  const orderTitleStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  };

  const orderListStyle: React.CSSProperties = {
    marginBottom: '20px',
  };

  const orderItemStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #e5e7eb',
  };

  const orderItemInfoStyle: React.CSSProperties = {
    flex: 1,
  };

  const orderItemNameStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
  };

  const orderItemPriceStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#666',
  };

  const quantityControlStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const quantityButtonStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    backgroundColor: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
  };

  const quantityStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '600',
    minWidth: '40px',
    textAlign: 'center',
  };

  const totalSectionStyle: React.CSSProperties = {
    borderTop: '2px solid #e5e7eb',
    paddingTop: '20px',
    marginTop: '20px',
  };

  const totalStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#8FBC8F',
    textAlign: 'center',
    marginBottom: '20px',
  };

  const paymentButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    backgroundColor: '#8FBC8F',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
  };

  const emptyOrderStyle: React.CSSProperties = {
    textAlign: 'center',
    color: '#666',
    fontSize: '16px',
    padding: '40px 0',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={tableInfoStyle}>
          <div style={tableNameStyle}>{table.name}</div>
          <div style={tableStatusStyle}>
            {table.layout === 'Inside' ? 'Trong nhà' : 'Ngoài trời'} - {table.status === 'available' ? 'Trống' : 'Có khách'}
          </div>
        </div>
        <button style={backButtonStyle} onClick={onBack}>
          ← Quay lại
        </button>
      </div>

      <div style={contentStyle}>
        {/* Menu Section */}
        <div style={menuSectionStyle}>
          <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
            Thực đơn
          </h3>
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          <div style={categoryTabsStyle}>
            {menuCategories.map((category) => (
              <button
                key={category.name}
                style={selectedCategory === category.name ? categoryTabActiveStyle : categoryTabStyle}
                onClick={() => setSelectedCategory(category.name)}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div style={menuGridStyle}>
            {filteredMenuItems.map((item) => (
                <div
                  key={item.id}
                  style={menuItemStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#8FBC8F';
                    e.currentTarget.style.backgroundColor = '#f0f9ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                  onClick={() => handleAddItem(item)}
                >
                  <div style={menuItemNameStyle}>{item.name}</div>
                  <div style={menuItemPriceStyle}>{item.price.toLocaleString()}đ</div>
                </div>
              ))}
          </div>
        </div>

        {/* Order Section */}
        <div style={orderSectionStyle}>
          <h3 style={orderTitleStyle}>Đơn hàng hiện tại</h3>
          
          <div style={orderListStyle}>
            {table.order.length === 0 ? (
              <div style={emptyOrderStyle}>
                Chưa có món nào trong đơn hàng
              </div>
            ) : (
              table.order.map((item) => (
                <div key={item.menuItem.id} style={orderItemStyle}>
                  <div style={orderItemInfoStyle}>
                    <div style={orderItemNameStyle}>{item.menuItem.name}</div>
                    <div style={orderItemPriceStyle}>
                      {item.menuItem.price.toLocaleString()}đ x {item.quantity}
                    </div>
                  </div>
                  <div style={quantityControlStyle}>
                    <button
                      style={quantityButtonStyle}
                      onClick={() => handleUpdateQuantity(item.menuItem.id, -1)}
                    >
                      -
                    </button>
                    <span style={quantityStyle}>{item.quantity}</span>
                    <button
                      style={quantityButtonStyle}
                      onClick={() => handleUpdateQuantity(item.menuItem.id, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={totalSectionStyle}>
            <div style={totalStyle}>
              Tổng cộng: {total.toLocaleString()}đ
            </div>
            <button
              style={paymentButtonStyle}
              onClick={handlePayment}
              disabled={table.order.length === 0}
            >
              Thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderView;
