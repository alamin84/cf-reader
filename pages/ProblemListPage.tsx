
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProblems } from '../context/ProblemContext';
import ProblemListItem from '../components/ProblemListItem';
import LoadingSpinner from '../components/LoadingSpinner';
import { useStatusManager } from '../hooks/useStatusManager';

const ProblemListPage: React.FC = () => {
  const { problems, loading, error } = useProblems();
  const { hideReadFromSearch, getStatus } = useStatusManager();

  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      if (hideReadFromSearch) {
        const { read } = getStatus(p.contestId, p.index);
        if (read) return false;
      }
      return true;
    });
  }, [problems, hideReadFromSearch, getStatus]);

  if (loading) {
    return <LoadingSpinner text="Loading problems..." />;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Available Problems
      </h1>
      {filteredProblems.length > 0 ? (
        <div className="space-y-4">
          {filteredProblems.map(problem => (
            <ProblemListItem key={`${problem.contestId}-${problem.index}`} problem={problem} />
          ))}
        </div>
      ) : (
        <div className="text-center bg-white dark:bg-zinc-900 p-8 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">No problems have been downloaded yet.</p>
          <Link to="/download" className="mt-4 inline-block text-sky-500 hover:underline">
            Go to the downloader
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProblemListPage;
