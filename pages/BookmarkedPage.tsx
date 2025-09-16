
import React, { useMemo } from 'react';
import { useProblems } from '../context/ProblemContext';
import { useStatusManager } from '../hooks/useStatusManager';
import ProblemListItem from '../components/ProblemListItem';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';

const BookmarkedPage: React.FC = () => {
  const { problems, loading, error } = useProblems();
  const { getBookmarkedKeys, getProblemKey } = useStatusManager();

  const bookmarkedProblems = useMemo(() => {
    const bookmarkedSet = new Set(getBookmarkedKeys());
    return problems.filter(p => bookmarkedSet.has(getProblemKey(p.contestId, p.index)));
  }, [problems, getBookmarkedKeys, getProblemKey]);
  
  if (loading) {
    return <LoadingSpinner text="Loading bookmarked problems..." />;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Bookmarked Problems</h1>
      {bookmarkedProblems.length > 0 ? (
        <div className="space-y-4">
          {bookmarkedProblems.map(problem => (
            <ProblemListItem key={`${problem.contestId}-${problem.index}`} problem={problem} />
          ))}
        </div>
      ) : (
        <div className="text-center bg-white dark:bg-zinc-900 p-8 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">You haven't bookmarked any problems yet.</p>
          <Link to="/" className="mt-4 inline-block text-sky-500 hover:underline">
            Find problems to solve
          </Link>
        </div>
      )}
    </div>
  );
};

export default BookmarkedPage;