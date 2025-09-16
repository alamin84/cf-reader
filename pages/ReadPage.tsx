import React, { useMemo } from 'react';
import { useProblems } from '../context/ProblemContext';
import { useStatusManager } from '../hooks/useStatusManager';
import ProblemListItem from '../components/ProblemListItem';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';

const ReadPage: React.FC = () => {
  const { problems, loading, error } = useProblems();
  const { getReadKeys, getProblemKey, hideReadFromSearch, toggleHideReadFromSearch } = useStatusManager();

  const readProblems = useMemo(() => {
    const readSet = new Set(getReadKeys());
    return problems.filter(p => readSet.has(getProblemKey(p.contestId, p.index)));
  }, [problems, getReadKeys, getProblemKey]);
  
  if (loading) {
    return <LoadingSpinner text="Loading read problems..." />;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Problems Marked as Read</h1>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="hide-read-problems"
            checked={hideReadFromSearch}
            onChange={toggleHideReadFromSearch}
            className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-sky-600 bg-gray-100 dark:bg-zinc-800 focus:ring-sky-500 focus:ring-offset-white dark:focus:ring-offset-zinc-900 cursor-pointer"
          />
          <label htmlFor="hide-read-problems" className="text-gray-700 dark:text-gray-300 cursor-pointer select-none">
            Hide read problems from search
          </label>
        </div>
      </div>
      {readProblems.length > 0 ? (
        <div className="space-y-4">
          {readProblems.map(problem => (
            <ProblemListItem key={`${problem.contestId}-${problem.index}`} problem={problem} />
          ))}
        </div>
      ) : (
        <div className="text-center bg-white dark:bg-zinc-900 p-8 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">You haven't marked any problems as read yet.</p>
          <Link to="/" className="mt-4 inline-block text-sky-500 hover:underline">
            Find problems to solve
          </Link>
        </div>
      )}
    </div>
  );
};

export default ReadPage;