import React from 'react';

// FIX: Add a minimal component to resolve a module import error in an unused file.
// This component is not actively used by the main application flow.
const SearchBar: React.FC<{ onSearch: (query: string) => void }> = () => {
  return null;
};

export default SearchBar;
