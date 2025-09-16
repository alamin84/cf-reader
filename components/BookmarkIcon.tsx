import React from 'react';

const BookmarkIcon: React.FC<{ isBookmarked: boolean }> = ({ isBookmarked }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-colors ${isBookmarked ? 'text-yellow-400' : 'text-gray-400 dark:text-gray-500 hover:text-yellow-400 dark:hover:text-yellow-400'}`}>
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
  </svg>
);

export default BookmarkIcon;