import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 mt-8 py-6">
      <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} Mahama News TV. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;