
import React, { useMemo } from 'react';
import { useOffline } from '../context/OfflineContext';
import ProblemListItem from '../components/ProblemListItem';
import { Link } from 'react-router-dom';
import { Problem } from '../types';

const OfflinePage: React.FC = () => {
  const { offlineProblems } = useOffline();

  const downloadedProblems = useMemo(() => {
    return Object.values(offlineProblems)
      .sort((a, b) => b.downloadedAt - a.downloadedAt)
      .map(item => item.problem);
  }, [offlineProblems]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Offline Problems</h1>
      {downloadedProblems.length > 0 ? (
        <div className="space-y-4">
          {downloadedProblems.map((problem: Problem) => (
            <ProblemListItem key={`${problem.contestId}-${problem.index}`} problem={problem} />
          ))}
        </div>
      ) : (
        <div className="text-center bg-white dark:bg-zinc-900 p-8 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">You haven't downloaded any problems yet.</p>
          <Link to="/" className="mt-4 inline-block text-sky-500 hover:underline">
            Find problems to download
          </Link>
        </div>
      )}
    </div>
  );
};

export default OfflinePage;