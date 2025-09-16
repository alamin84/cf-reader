
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStatusManager } from '../hooks/useStatusManager';
import { useTheme } from '../context/ThemeContext';
import { useOffline } from '../context/OfflineContext';

const Downloader: React.FC = () => {
    const { downloadProblemSet, downloadProgress, isDownloading: isDownloadingProblems } = useOffline();
    const [minRating, setMinRating] = useState('1400');
    const [maxRating, setMaxRating] = useState('1800');
    const [count, setCount] = useState('200');

    const handleDownload = (e: React.FormEvent) => {
        e.preventDefault();
        const min = parseInt(minRating);
        const max = parseInt(maxRating);
        const num = parseInt(count);

        if (!Number.isNaN(min) && !Number.isNaN(max) && !Number.isNaN(num) && min <= max && num > 0) {
            downloadProblemSet(min, max, num);
        } else {
            alert("Please enter a valid rating range and number of problems.");
        }
    };
    
    const isDownloading = isDownloadingProblems || (downloadProgress.total > 0 && downloadProgress.current < downloadProgress.total);
    const progressPercentage = downloadProgress.total > 0 ? (downloadProgress.current / downloadProgress.total) * 100 : 0;

    return (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <form onSubmit={handleDownload}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div>
                        <label htmlFor="min-rating" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Min Rating</label>
                        <input id="min-rating" type="number" step="100" value={minRating} onChange={e => setMinRating(e.target.value)} placeholder="e.g., 1400" className="w-full bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500" disabled={isDownloading} />
                    </div>
                    <div>
                        <label htmlFor="max-rating" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Max Rating</label>
                        <input id="max-rating" type="number" step="100" value={maxRating} onChange={e => setMaxRating(e.target.value)} placeholder="e.g., 1800" className="w-full bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500" disabled={isDownloading} />
                    </div>
                    <div>
                        <label htmlFor="problem-count" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"># of Problems</label>
                        <input id="problem-count" type="number" step="50" value={count} onChange={e => setCount(e.target.value)} placeholder="e.g., 200" className="w-full bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500" disabled={isDownloading} />
                    </div>
                </div>
                <button type="submit" className="mt-4 w-full bg-sky-600 hover:bg-sky-700 disabled:bg-sky-800 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500" disabled={isDownloading}>
                    {isDownloading ? `Downloading... (${downloadProgress.current}/${downloadProgress.total})` : 'Download Latest Problems'}
                </button>
            </form>
            {downloadProgress.total > 0 && (
                <div className="mt-4">
                    <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2.5">
                        <div className="bg-sky-500 h-2.5 rounded-full transition-all duration-300 ease-linear" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2 truncate">{downloadProgress.message}</p>
                </div>
            )}
        </div>
    );
};


const HomePage: React.FC = () => {
  const { getBookmarkedKeys } = useStatusManager();
  const { theme, toggleTheme } = useTheme();
  const { offlineProblems } = useOffline();
  
  const hasBookmarks = getBookmarkedKeys().length > 0;
  const hasOffline = Object.keys(offlineProblems).length > 0;

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center text-center py-12">
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-8 max-w-2xl">
        Download Codeforces Problems
      </h1>
      <div className="w-full mb-8">
        <Downloader />
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
            to="/problems" 
            className="p-4 bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors duration-200 shadow-sm border border-gray-200 dark:border-gray-700"
            title="View Downloaded Problems"
            aria-label="View Downloaded Problems"
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