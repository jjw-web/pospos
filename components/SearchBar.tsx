import React, { useRef } from 'react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder?: string;
  onClear: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  placeholder = 'Search...',
  onClear,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const searchInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 15px',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '16px',
    backgroundColor: 'var(--bg-page)',
    color: 'var(--text-main)',
    boxSizing: 'border-box',
  };

  const handleClear = () => {
    onClear();
    inputRef.current?.focus();
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
      }}
    >
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={searchInputStyle}
      />
      {searchQuery && (
        <button
          type="button"
          onClick={handleClear}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '18px',
            lineHeight: '1',
            padding: '5px',
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default React.memo(SearchBar);
