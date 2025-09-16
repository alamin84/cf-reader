import React from 'react';

interface DownloadIconProps {
  isDownloading: boolean;
  isOffline: boolean;
}

const DownloadIcon: React.FC<DownloadIconProps> = ({ isDownloading, isOffline }) => {
  if (isDownloading) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-gray-500 animate-spin">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
    );
  }
  
  if (isOffline) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 hover:text-red-500 dark:hover:text-red-500 transition-colors">
          <circle cx="12" cy="12" r="10" />
          <polyline points="8 12 12 16 16 12" stroke="white" />
          <line x1="12" y1="8" x2="12" y2="16" stroke="white" />
        </svg>
    )
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-500 transition-colors">
      <circle cx="12" cy="12" r="10" />
      <polyline points="8 12 12 16 16 12" />
      <line x1="12" y1="8" x2="12" y2="16" />
    </svg>
  );
};

export default DownloadIcon;
