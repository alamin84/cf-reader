
import React from 'react';

const LoadingSpinner: React.FC<{ text?: string }> = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-12 h-12 border-4 border-t-4 border-gray-200 dark:border-gray-700 border-t-sky-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-500 dark:text-gray-400">{text}</p>
    </div>
  );
};

export default LoadingSpinner;