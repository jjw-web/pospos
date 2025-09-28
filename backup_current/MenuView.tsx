import React, { useState, useEffect } from 'react';
import { MenuItem, MenuCategory } from '../types';
import { MENU_CATEGORIES } from '../constants';

interface MenuViewProps {
  onBack: () => void;
}

const MenuView: React.FC<MenuViewProps> = ({ onBack }) => {
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>(MENU_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>(MENU_CATEGORIES[0].name);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: '',
    price: 0,
  });
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  const containerStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#111827',
    padding: '16px',
    boxSizing: 'border-box'
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
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white'
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

  const formStyle: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  };

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #374151',
    backgroundColor: '#1f2937',
    color: 'white',
    flex: '1',
  };

  const addButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
    color: 'white',
  };

  const cellStyle: React.CSSProperties = {
    padding: '12px',
    borderBottom: '1px solid #374151',
    textAlign: 'left',
  };

  const deleteButtonStyle: React.CSSProperties = {
    padding: '6px 12px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  };

  const handleAddItem = () => {
    if (newItem.name && newItem.price) {
      const maxId = menuCategories.reduce((max, category) => {
        const categoryMaxId = Math.max(...category.items.map(item => item.id), 0);
        return Math.max(max, categoryMaxId);
      }, 0);

      const item: MenuItem = {
        id: maxId + 1,
        name: newItem.name,
        price: Number(newItem.price)
      };

      const updatedCategories = menuCategories.map(category => 
        category.name === selectedCategory
          ? { ...category, items: [...category.items, item] }
          : category
      );

      setMenuCategories(updatedCategories);
      setNewItem({ name: '', price: 0 });
      
      // Cập nhật MENU_CATEGORIES
      MENU_CATEGORIES.length = 0;
      MENU_CATEGORIES.push(...updatedCategories);
    }
  };

  const handleDeleteItem = (categoryName: string, itemId: number) => {
    const updatedCategories = menuCategories.map(category => 
      category.name === categoryName
        ? { ...category, items: category.items.filter(item => item.id !== itemId) }
        : category
    );

    setMenuCategories(updatedCategories);
    
    // Cập nhật MENU_CATEGORIES
    MENU_CATEGORIES.length = 0;
    MENU_CATEGORIES.push(...updatedCategories);
  };

  const handleAddCategory = () => {
    if (newCategory && !menuCategories.some(cat => cat.name === newCategory)) {
      const newCategoryObj: MenuCategory = {
        name: newCategory,
        items: []
      };
      const updatedCategories = [...menuCategories, newCategoryObj];
      setMenuCategories(updatedCategories);
      setSelectedCategory(newCategory);
      setNewCategory('');
      setShowCategoryForm(false);

      // Cập nhật MENU_CATEGORIES
      MENU_CATEGORIES.length = 0;
      MENU_CATEGORIES.push(...updatedCategories);
    }
  };

  const handleEditCategory = (oldName: string) => {
    if (newCategory && !menuCategories.some(cat => cat.name === newCategory)) {
      const updatedCategories = menuCategories.map(category => 
        category.name === oldName
          ? { ...category, name: newCategory }
          : category
      );
      setMenuCategories(updatedCategories);
      setSelectedCategory(newCategory);
      setNewCategory('');
      setEditingCategory(null);

      // Cập nhật MENU_CATEGORIES
      MENU_CATEGORIES.length = 0;
      MENU_CATEGORIES.push(...updatedCategories);
    }
  };

  const handleDeleteCategory = (categoryName: string) => {
    if (menuCategories.length > 1) {
      const updatedCategories = menuCategories.filter(cat => cat.name !== categoryName);
      setMenuCategories(updatedCategories);
      setSelectedCategory(updatedCategories[0].name);

      // Cập nhật MENU_CATEGORIES
      MENU_CATEGORIES.length = 0;
      MENU_CATEGORIES.push(...updatedCategories);
    }
  };

  const categoryFormStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  };

  const categoryStyle: React.CSSProperties = {
    padding: '8px 16px',
    backgroundColor: '#374151',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginRight: '8px',
    marginBottom: '8px'
  };

  const activeCategoryStyle: React.CSSProperties = {
    ...categoryStyle,
    backgroundColor: '#10b981'
  };

  const categoriesWrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '20px'
  };

  return (
    <div style={containerStyle}>
      <div style={wrapperStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Quản Lý Menu</h1>
          <button
            onClick={onBack}
            style={backButtonStyle}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
          >
            Quay lại
          </button>
        </div>

        <div style={categoriesWrapperStyle}>
          {showCategoryForm ? (
            <div style={categoryFormStyle}>
              <input
                style={inputStyle}
                type="text"
                placeholder="Tên nhóm mới"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <button
                style={addButtonStyle}
                onClick={handleAddCategory}
              >
                Thêm nhóm
              </button>
              <button
                style={backButtonStyle}
                onClick={() => {
                  setShowCategoryForm(false);
                  setNewCategory('');
                }}
              >
                Hủy
              </button>
            </div>
          ) : (
            <button
              style={addButtonStyle}
              onClick={() => setShowCategoryForm(true)}
            >
              + Thêm nhóm mới
            </button>
          )}
          
          {menuCategories.map(category => (
            <div key={category.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {editingCategory === category.name ? (
                <div style={categoryFormStyle}>
                  <input
                    style={inputStyle}
                    type="text"
                    placeholder="Tên nhóm mới"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <button
                    style={addButtonStyle}
                    onClick={() => handleEditCategory(category.name)}
                  >
                    Lưu
                  </button>
                  <button
                    style={backButtonStyle}
                    onClick={() => {
                      setEditingCategory(null);
                      setNewCategory('');
                    }}
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <>
                  <button
                    style={category.name === selectedCategory ? activeCategoryStyle : categoryStyle}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    {category.name}
                  </button>
                  <button
                    style={{ ...deleteButtonStyle, padding: '4px 8px' }}
                    onClick={() => setEditingCategory(category.name)}
                  >
                    Sửa
                  </button>
                  <button
                    style={{ ...deleteButtonStyle, padding: '4px 8px' }}
                    onClick={() => handleDeleteCategory(category.name)}
                    disabled={menuCategories.length <= 1}
                  >
                    Xóa
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <div style={formStyle}>
          <input
            style={inputStyle}
            type="text"
            placeholder="Tên món"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          />
          <input
            style={inputStyle}
            type="number"
            placeholder="Giá"
            value={newItem.price || ''}
            onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
          />
          <button
            style={addButtonStyle}
            onClick={handleAddItem}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
          >
            Thêm vào {selectedCategory}
          </button>
        </div>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={cellStyle}>Tên món</th>
              <th style={cellStyle}>Giá</th>
              <th style={cellStyle}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {menuCategories
              .find(category => category.name === selectedCategory)
              ?.items.map((item) => (
                <tr key={item.id}>
                  <td style={cellStyle}>{item.name}</td>
                  <td style={cellStyle}>{item.price.toLocaleString()}đ</td>
                  <td style={cellStyle}>
                    <button
                      style={deleteButtonStyle}
                      onClick={() => handleDeleteItem(selectedCategory, item.id)}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MenuView;
