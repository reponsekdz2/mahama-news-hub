import React from 'react';

const Spinner: React.FC = () => (
  <div className="flex justify-center items-center py-12">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-accent-500"></div>
  </div>
);

export default Spinner;
