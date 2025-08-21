
import React, { useState, useMemo } from 'react';
import { TableData, MenuItem, MenuCategory } from '../types';
import { PlusIcon, MinusIcon, TrashIcon } from './icons';

interface OrderViewProps {
  table: TableData;
  menuCategories: MenuCategory[];
  onBack: () => void;
  onAddItem: (tableId: number, menuItem: MenuItem) => void;
  onUpdateQuantity: (tableId: number, menuItemId: number, change: number) => void;
  onPayment: (tableId: number) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const OrderView: React.FC<OrderViewProps> = ({
  table,
  menuCategories,
  onBack,
  onAddItem,
  onUpdateQuantity,
  onPayment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const total = table.order.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

  // Filter menu items based on search term
  const filteredMenuCategories = useMemo(() => {
    if (!searchTerm.trim()) return menuCategories;
    
    return menuCategories.map(category => ({
      ...category,
      items: category.items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(category => category.items.length > 0);
  }, [menuCategories, searchTerm]);

  // Inline Styles
  const headerStyle: React.CSSProperties = { 
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
    padding: '1rem 1.5rem', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' 
  };
  const titleStyle: React.CSSProperties = { fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' };
  const backButtonStyle: React.CSSProperties = { 
    fontSize: '1rem', fontWeight: 'bold', padding: '0.5rem 1rem', 
    backgroundColor: '#4b5563', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' 
  };
  const sectionTitleStyle: React.CSSProperties = { fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#1f2937' };

  // Search styles
  const searchContainerStyle: React.CSSProperties = {
    marginBottom: '1rem',
    position: 'relative',
  };

  const searchInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 2.5rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  };

  const searchIconStyle: React.CSSProperties = {
    position: 'absolute',
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6b7280',
    fontSize: '1.125rem',
  };

  const clearButtonStyle: React.CSSProperties = {
    position: 'absolute',
    right: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    fontSize: '1.125rem',
    padding: '0.25rem',
    borderRadius: '50%',
    display: searchTerm ? 'block' : 'none',
  };

  const noResultsStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '2rem',
    color: '#6b7280',
    fontSize: '1rem',
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'white' }}>
        <header style={headerStyle}>
          <h2 style={titleStyle}>Bàn {table.name}</h2>
          <button onClick={onBack} style={backButtonStyle}>Quay lại</button>
        </header>

        <div className="flex-grow flex flex-col lg:flex-row overflow-hidden min-h-0">
          {/* Order Details - Hybrid Approach */}
          <div className="w-full lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-200 h-1/2 lg:h-auto" style={{ padding: '1.5rem' }}>
            <h3 style={sectionTitleStyle}>Đơn hàng hiện tại</h3>
            <div className="flex-grow overflow-y-auto pr-2 -mr-2 min-h-0">
              {table.order.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>Chưa có món nào trong đơn.</p>
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.5rem' }}>Hãy chọn món từ thực đơn bên cạnh</p>
                </div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {table.order.map((item) => (
                    <li key={item.menuItem.id} style={{ backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                       <div className="flex items-center justify-between gap-2">
                         {/* Text part can be inline */}
                         <div className="flex-1 min-w-0">
                           <p style={{ fontWeight: 600, color: '#1f2937' }} className="truncate text-sm sm:text-base">{item.menuItem.name}</p>
                           <p style={{ color: '#4b5563' }} className="text-xs sm:text-sm">{formatCurrency(item.menuItem.price)}</p>
                         </div>
                         {/* Buttons part uses flex, better to keep classes */}
                         <div className="flex items-center gap-2 ml-2">
                           {/* Quantity Control */}
                           <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-full px-2 py-1 shadow-sm">
                             <button
                               onClick={() => onUpdateQuantity(table.id, item.menuItem.id, -1)}
                               className="p-1"
                               aria-label="Giảm số lượng"
                             >
                               <MinusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                             </button>
                             <span className="font-bold text-base sm:text-lg w-6 text-center text-gray-800">
                               {item.quantity}
                             </span>
                             <button
                               onClick={() => onUpdateQuantity(table.id, item.menuItem.id, 1)}
                               className="p-1"
                               aria-label="Tăng số lượng"
                             >
                               <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                             </button>
                           </div>

                           {/* Trash Button */}
                           <button
                             onClick={() => onUpdateQuantity(table.id, item.menuItem.id, -item.quantity)}
                             className="p-2 text-gray-500 hover:text-red-500"
                             aria-label="Xóa món"
                           >
                             <TrashIcon className="w-5 h-5" />
                           </button>
                         </div>
                       </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mt-auto pt-4 flex-shrink-0">
               <div style={{borderTop: '2px dashed #d1d5db', paddingTop: '1rem', paddingBottom: '1rem'}} className="flex justify-between items-center text-lg sm:text-xl font-bold text-gray-800">
                <span>Tổng cộng:</span>
                <span style={{ color: '#16a34a' }}>{formatCurrency(total)}</span>
               </div>
               <button onClick={() => onPayment(table.id)} disabled={total === 0} className="w-full btn-simple text-base sm:text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed">Thanh toán</button>
            </div>
          </div>

          {/* Menu - Hybrid Approach */}
          <div className="w-full lg:w-1/2 flex flex-col h-1/2 lg:h-auto" style={{ padding: '1.5rem' }}>
            <h3 style={sectionTitleStyle}>Thực đơn</h3>
            
            {/* Search Bar */}
            <div style={searchContainerStyle}>
              <div style={{ position: 'relative' }}>
                <span style={searchIconStyle}>🔍</span>
                <input
                  type="text"
                  placeholder="Tìm kiếm món ăn, đồ uống..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    ...searchInputStyle,
                    borderColor: searchTerm ? '#3b82f6' : '#e5e7eb'
                  }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    style={clearButtonStyle}
                    aria-label="Xóa tìm kiếm"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 sm:pr-4 min-h-0">
              {filteredMenuCategories.length === 0 ? (
                <div style={noResultsStyle}>
                  <p>Không tìm thấy món nào phù hợp với "{searchTerm}"</p>
                  <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Hãy thử từ khóa khác</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredMenuCategories.map((category) => (
                    <div key={category.name}>
                      <h4 style={{...sectionTitleStyle, fontSize: '1.125rem', position: 'sticky', top: 0, backgroundColor: 'white', padding: '0.5rem 0'}}>
                        {category.name} 
                        {searchTerm && (
                          <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 'normal' }}>
                            {' '}({category.items.length} món)
                          </span>
                        )}
                      </h4>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {category.items.map((menuItem) => (
                          <li key={menuItem.id}>
                            <button 
                              onClick={() => onAddItem(table.id, menuItem)} 
                              className="menu-item-simple w-full h-full text-left p-3 hover:scale-105 transition-transform"
                              style={{
                                backgroundColor: searchTerm && menuItem.name.toLowerCase().includes(searchTerm.toLowerCase()) 
                                  ? '#fef3c7' 
                                  : undefined
                              }}
                            >
                              <p className="font-semibold text-sm sm:text-base text-gray-800 mb-1">{menuItem.name}</p>
                              <p className="text-xs sm:text-sm text-gray-600 font-mono">{formatCurrency(menuItem.price)}</p>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderView;
