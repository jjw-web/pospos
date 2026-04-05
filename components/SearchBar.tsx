import React from 'react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder?: string;
  darkMode?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  searchQuery, 
  setSearchQuery, 
  placeholder = "Search...",
  darkMode = false,
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
    <input
      type="text"
      placeholder={placeholder}
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      style={searchInputStyle}
    />
  );
};

export default SearchBar;