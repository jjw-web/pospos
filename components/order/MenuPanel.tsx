import React, { useCallback, useMemo } from 'react';
import type { MenuCategory, MenuItem } from '../../src/types';
import { includesNormalized } from '../../src/lib/string-utils';
import SearchBar from '../SearchBar';

interface MenuPanelProps {
  menuCategories: MenuCategory[];
  selectedCategory: string;
  searchQuery: string;
  onCategoryChange: (name: string) => void;
  onSearchChange: (q: string) => void;
  onAddItem: (item: MenuItem) => void;
}

const MenuPanel: React.FC<MenuPanelProps> = ({
  menuCategories,
  selectedCategory,
  searchQuery,
  onCategoryChange,
  onSearchChange,
  onAddItem,
}) => {
  const handleClear = useCallback(() => {
    onSearchChange('');
  }, [onSearchChange]);

  const filteredItems = useMemo(() => {
    if (searchQuery) {
      return menuCategories
        .flatMap((cat) => cat.items)
        .filter((item) => includesNormalized(item.name, searchQuery));
    }
    const category = menuCategories.find((cat) => cat.name === selectedCategory);
    return category ? category.items : [];
  }, [menuCategories, selectedCategory, searchQuery]);

  return (
    <>
      <div style={{ margin: '15px 0' }}>
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={onSearchChange}
          placeholder="Tìm kiếm món ăn..."
          onClear={handleClear}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        {menuCategories.map((category) => (
          <div
            key={category.name}
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '10px',
              padding: '15px 10px',
              textAlign: 'center',
              cursor: 'pointer',
              border: `1px solid ${
                selectedCategory === category.name && !searchQuery ? '#3498db' : 'var(--border)'
              }`,
              boxShadow:
                selectedCategory === category.name && !searchQuery
                  ? '0 4px 8px rgba(52,152,219,0.2)'
                  : '0 2px 5px rgba(0,0,0,0.2)',
              transform:
                selectedCategory === category.name && !searchQuery ? 'translateY(-3px)' : 'none',
              transition: 'all 0.2s',
            }}
            onClick={() => {
              onCategoryChange(category.name);
              onSearchChange('');
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>
              {category.name}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '20px' }}>
        {filteredItems.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '15px',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '8px',
              marginBottom: '10px',
              cursor: 'pointer',
              border: '1px solid var(--border)',
            }}
            onClick={() => onAddItem(item)}
          >
            <div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>{item.name}</div>
              <div
                style={{
                  fontSize: '15px',
                  color: '#3498db',
                  fontWeight: 'bold',
                }}
              >
                {item.price.toLocaleString()}đ
              </div>
            </div>
            <span style={{ fontSize: '24px', color: '#3498db' }}>+</span>
          </div>
        ))}
      </div>
    </>
  );
};

export default React.memo(MenuPanel);
