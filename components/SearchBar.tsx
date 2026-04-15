import React from 'react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder?: string;
  darkMode?: boolean;
  onClear: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery, 
  setSearchQuery, 
  placeholder = "Search...",
  darkMode = false,
  onClear,
}) => {
  const searchInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 15px',
    border: darkMode ? '1px solid #475569' : '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    backgroundColor: darkMode ? '#0f172a' : '#fff',
    color: darkMode ? '#f1f5f9' : '#1e293b',
    boxSizing: 'border-box',
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%'
    }}>
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={searchInputStyle}
      />
      {searchQuery && (
        <button
          type="button"
          onClick={onClear}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: darkMode ? '#94a3b8' : '#7f8c8d',
            cursor: 'pointer',
            fontSize: '18px',
            lineHeight: '1',
            padding: '5px'
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default SearchBar;