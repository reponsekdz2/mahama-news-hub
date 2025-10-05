import React from 'react';

const Spinner: React.FC = () => (
  <div className="flex justify-center items-center py-12">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-accent-500 dark:border-gray-600 dark:border-t-accent-500"></div>
  </div>
);

export default Spinner;