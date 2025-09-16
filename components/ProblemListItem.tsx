import React from 'react';
import { Link } from 'react-router-dom';
import { Problem } from '../types';
import { useStatusManager } from '../hooks/useStatusManager';
import { useOffline } from '../context/OfflineContext';
import BookmarkIcon from './BookmarkIcon';
import ReadIcon from './ReadIcon';
import DownloadIcon from './DownloadIcon';

const ProblemListItem: React.FC<{ problem: Problem }> = ({ problem }) => {
  const { toggleBookmark, toggleRead, getStatus } = useStatusManager();
  const { isOffline, isDownloading, downloadProblem, deleteProblem } = useOffline();
  
  const problemKey = `${problem.contestId}-${problem.index}`;
  const { bookmarked, read } = getStatus(problem.contestId, problem.index);
  const offline = isOffline(problemKey);
  const downloading = isDownloading(problemKey);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleBookmark(problem.contestId, problem.index);
  };

  const handleReadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleRead(problem.contestId, problem.index);
  };
  
  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (offline) {
      if (window.confirm('Are you sure you want to delete this problem from offline storage?')) {
        deleteProblem(problemKey);
      }
    } else {
      downloadProblem(problem);
    }
  };


  return (
    <Link to={`/problem/${problem.contestId}/${problem.index}`} state={{ problem }} className="block bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800/50 transition-colors p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div className="flex-1 mr-4">
          <h3 className="font-semibold text-lg text-sky-600 dark:text-sky-400 hover:underline">{problem.name}</h3>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
            <span>Rating: {problem.rating || 'N/A'}</span>
            <span className="mx-2">|</span>
            <span>ID: {problem.contestId}{problem.index}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {problem.tags.map(tag => (
              <span key={tag} className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 text-xs font-medium px-2 py-1 rounded-full">{tag}</span>
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button onClick={handleDownloadClick} title={offline ? 'Delete from offline' : 'Download for offline'} disabled={downloading}>
              <DownloadIcon isDownloading={downloading} isOffline={offline} />
          </button>
          <button onClick={handleBookmarkClick} title={bookmarked ? 'Remove bookmark' : 'Bookmark problem'}>
            <BookmarkIcon isBookmarked={bookmarked} />
          </button>
          <button onClick={handleReadClick} title={read ? 'Mark as unread' : 'Mark as read'}>
            <ReadIcon isRead={read} />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProblemListItem;