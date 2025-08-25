
import React from 'react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery }) => {
  const searchBarContainerStyle: React.CSSProperties = {
    marginBottom: '20px',
  };

  const searchInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '16px',
    boxSizing: 'border-box',
  };

  return (
    <div style={searchBarContainerStyle}>
      <input
        type="text"
        placeholder="Tìm kiếm món ăn..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={searchInputStyle}
      />
    </div>
  );
};

export default SearchBar;
