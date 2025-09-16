
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { useProblems } from '../context/ProblemContext';
import { Problem, Content } from '../types';
import Tabs from '../components/Tabs';
import LoadingSpinner from '../components/LoadingSpinner';
import CodeBlock from '../components/CodeBlock';
import { useStatusManager } from '../hooks/useStatusManager';
import { useOffline } from '../context/OfflineContext';
import BookmarkIcon from '../components/BookmarkIcon';
import ReadIcon from '../components/ReadIcon';
import { fetchProblemContent } from '../services/codeforcesService';

// Add marked and MathJax to the global window type
declare global {
    interface Window {
        marked: any;
        MathJax: any;
    }
}

const ProblemDetailPage: React.FC = () => {
  const { contestId, index } = useParams<{ contestId: string; index: string }>();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { problems, loading: problemsLoading } = useProblems();
  const { toggleBookmark, toggleRead, getStatus } = useStatusManager();
  const { offlineProblems } = useOffline();
  
  // By deep-copying the problem object, we ensure the component works with its own isolated
  // data, preventing any accidental mutations from affecting the global persisted state.
  const [problem, setProblem] = useState<Problem | null>(
    state?.problem ? JSON.parse(JSON.stringify(state.problem)) : null
  );
  const [activeTab, setActiveTab] = useState('Problem');
  const [content, setContent] = useState<Content | {error: string} | null>(null);
  const [loadingContent, setLoadingContent] = useState(true);

  const contentRef = useRef<HTMLDivElement>(null);

  const { bookmarked, read } = useMemo(() => {
    return problem ? getStatus(problem.contestId, problem.index) : { bookmarked: false, read: false };
  }, [problem, getStatus]);
  
  const handleBookmarkClick = () => {
    if (problem) toggleBookmark(problem.contestId, problem.index);
  };

  const handleReadClick = () => {
    if (problem) toggleRead(problem.contestId, problem.index);
  };

  useEffect(() => {
    if (!problem && !problemsLoading && contestId && index) {
      const foundProblem = problems.find(p => p.contestId.toString() === contestId && p.index === index);
      // Ensure the problem object is a deep copy to prevent state pollution.
      setProblem(foundProblem ? JSON.parse(JSON.stringify(foundProblem)) : null);
    }
  }, [problems, problemsLoading, contestId, index, problem]);
  
  useEffect(() => {
    if (!problem) return;

    const key = `${problem.contestId}-${problem.index}`;
    const loadContent = async () => {
        setLoadingContent(true);
        const offlineProblem = offlineProblems[key];

        if (offlineProblem) {
            // By deep copying the content, we prevent any potential downstream mutations
            // from affecting the shared `offlineProblems` object in the context.
            // This helps prevent bugs like circular dependencies when state is unexpectedly serialized.
            setContent(JSON.parse(JSON.stringify(offlineProblem.content)));
        } else {
            // This case should not happen in the new workflow, as we only view downloaded problems.
            // As a fallback, we can try to fetch it live.
            const fetchedContent = await fetchProblemContent(problem.contestId, problem.index);
            setContent(fetchedContent);
        }
        setLoadingContent(false);
    };

    loadContent();
  }, [problem, offlineProblems]);
  

  useEffect(() => {
    if (content && !('error' in content) && (activeTab === 'Problem' || activeTab === 'Solution') && contentRef.current && window.MathJax) {
        setTimeout(() => {
            if (window.MathJax.typeset) {
                window.MathJax.typeset([contentRef.current]);
            }
        }, 100);
    }
  }, [activeTab, content]);
  
  const renderedContent = useMemo(() => {
    if (loadingContent) {
        return <LoadingSpinner text={`Loading Content...`} />;
    }
    if (!content) {
        return <div className="cf-problem-content" dangerouslySetInnerHTML={{ __html: 'Failed to load content.' }} />;
    }
    if ('error' in content) {
        return <div className="cf-problem-content" dangerouslySetInnerHTML={{ __html: content.error }} />;
    }

    switch (activeTab) {
      case 'Problem':
        return <div className="cf-problem-content" dangerouslySetInnerHTML={{ __html: content.Problem }} />;
      case 'Solution':
        return <div className="cf-problem-content" dangerouslySetInnerHTML={{ __html: content.Solution }} />;
      case 'Code':
        return <CodeBlock code={content.Code.content} language={content.Code.language} />;
      default:
        return null;
    }
  }, [content, activeTab, loadingContent]);

  if (problemsLoading && !problem) return <LoadingSpinner text="Loading problem list..."/>
  if (!problem) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        Problem not found.
        <Link to="/" className="block mt-4 text-sky-500 hover:underline">Go back to problems list</Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
       <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{problem.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Rating: {problem.rating} | ID: {problem.contestId}{problem.index}</p>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0 ml-4">
          <button onClick={handleBookmarkClick} title={bookmarked ? 'Remove bookmark' : 'Bookmark problem'} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
            <BookmarkIcon isBookmarked={bookmarked} />
          </button>
          <button onClick={handleReadClick} title={read ? 'Mark as unread' : 'Mark as read'} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
            <ReadIcon isRead={read} />
          </button>
          <button 
            onClick={() => navigate(-1)}
            title="Go back"
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-gray-700 dark:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
        </div>
      </div>
      <Tabs tabs={['Problem', 'Solution', 'Code']} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div ref={contentRef} className="mt-6 min-h-[200px]">
        {renderedContent}
      </div>
    </div>
  );
};

export default ProblemDetailPage;
