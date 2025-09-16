
import React, { useState } from 'react';
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
                    {isDownloading ? `Downloading... (${downloadProgress.current}/${downloadProgress.total})` : 'Download Problems'}
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


const DownloadPage: React.FC = () => {
  const { clearAllProblems, offlineProblems } = useOffline();

  const handleClear = () => {
    if (window.confirm('Are you sure you want to delete all downloaded problems? This action cannot be undone.')) {
        clearAllProblems();
    }
  }
  const hasOfflineProblems = Object.keys(offlineProblems).length > 0;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Download New Problem Set</h1>
      
      <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 rounded-md mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              <strong>Warning:</strong> Starting a new download will completely replace your current set of offline problems.
            </p>
          </div>
        </div>
      </div>

      <Downloader />

      {hasOfflineProblems && (
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Manage Problems</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Delete all currently downloaded problems.</p>
              <button
                  onClick={handleClear}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                  Clear All Problems
              </button>
          </div>
      )}
    </div>
  );
};

export default DownloadPage;
