import React from 'react';
import SearchBar from '../components/SearchBar';
import { Link } from 'react-router-dom';
import { useStatusManager } from '../hooks/useStatusManager';
import { useTheme } from '../context/ThemeContext';
import { useOffline } from '../context/OfflineContext';

const HomePage: React.FC = () => {
  const { getBookmarkedKeys } = useStatusManager();
  const { theme, toggleTheme } = useTheme();
  const { offlineProblems } = useOffline();
  
  const hasBookmarks = getBookmarkedKeys().length > 0;
  const hasOffline = Object.keys(offlineProblems).length > 0;

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center text-center py-12">
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-8 max-w-2xl">
        Search for Codeforces problems by rating range
      </h1>
      <div className="w-full mb-8">
        <SearchBar />
      </div>
      <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4">
        <button
          onClick={toggleTheme}
          className="p-4 bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors duration-200 shadow-sm border border-gray-200 dark:border-gray-700"
          title="Toggle Theme"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
          )}
        </button>

        <Link 
            to="/bookmarked" 
            className="p-4 bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors duration-200 shadow-sm border border-gray-200 dark:border-gray-700"
            title="View Bookmarked Problems"
            aria-label="View Bookmarked Problems"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className={hasBookmarks ? "text-yellow-400" : "text-gray-400 dark:text-gray-500"}>
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
        </Link>
        <Link 
            to="/read" 
            className="p-4 bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors duration-200 shadow-sm border border-gray-200 dark:border-gray-700"
            title="View Read Problems"
            aria-label="View Read Problems"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" className="text-green-500">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" fill="currentColor"/>
                <polyline points="22 4 12 14.01 9 11.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
        </Link>
        <Link 
            to="/offline" 
            className="p-4 bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors duration-200 shadow-sm border border-gray-200 dark:border-gray-700"
            title="View Offline Problems"
            aria-label="View Offline Problems"
        >
             <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={hasOffline ? "text-blue-500" : "text-gray-400 dark:text-gray-500"}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;