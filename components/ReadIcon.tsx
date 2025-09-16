import React from 'react';

const ReadIcon: React.FC<{ isRead: boolean }> = ({ isRead }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-colors ${isRead ? 'text-green-500' : 'text-gray-400 dark:text-gray-500 hover:text-green-500 dark:hover:text-green-500'}`}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" fill={isRead ? 'currentColor' : 'none'} stroke="currentColor" />
    <polyline points="22 4 12 14.01 9 11.01" fill="none" stroke={isRead ? 'white' : 'currentColor'} />
  </svg>
);

export default ReadIcon;