
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Problem, OfflineProblem } from '../types';
import { fetchProblemContent, fetchProblems } from '../services/codeforcesService';

const OFFLINE_PROBLEMS_KEY = 'codeforcesOfflineProblems';

interface DownloadProgress {
    current: number;
    total: number;
    message: string;
}

interface OfflineContextType {
  offlineProblems: { [key: string]: OfflineProblem };
  isOffline: (key: string) => boolean;
  isDownloading: boolean;
  downloadProgress: DownloadProgress;
  downloadProblemSet: (minRating: number, maxRating: number, count: number) => Promise<void>;
  clearAllProblems: () => void;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

const getInitialOfflineProblems = (): { [key: string]: OfflineProblem } => {
  try {
    const item = window.localStorage.getItem(OFFLINE_PROBLEMS_KEY);
    return item ? JSON.parse(item) : {};
  } catch (error) {
    console.error('Error reading offline problems from localStorage', error);
    return {};
  }
};

export const OfflineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [offlineProblems, setOfflineProblems] = useState<{ [key: string]: OfflineProblem }>(getInitialOfflineProblems);
  const [isDownloadingSet, setIsDownloadingSet] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({ current: 0, total: 0, message: '' });

  useEffect(() => {
    try {
      window.localStorage.setItem(OFFLINE_PROBLEMS_KEY, JSON.stringify(offlineProblems));
      window.dispatchEvent(new StorageEvent('storage', { key: OFFLINE_PROBLEMS_KEY }));
    } catch (error) {
      console.error('Error writing offline problems to localStorage', error);
    }
  }, [offlineProblems]);

  const getProblemKey = (p: Problem) => `${p.contestId}-${p.index}`;

  const downloadProblemSet = async (minRating: number, maxRating: number, count: number) => {
    if (isDownloadingSet) return;

    setIsDownloadingSet(true);
    setDownloadProgress({ current: 0, total: count, message: 'Fetching problem list...' });

    try {
        const allProblems = await fetchProblems();
        const filteredProblems = allProblems
            .filter(p => p.rating && p.rating >= minRating && p.rating <= maxRating)
            .slice(0, count);

        setDownloadProgress({ current: 0, total: filteredProblems.length, message: 'Starting downloads...' });

        const newOfflineProblems: { [key: string]: OfflineProblem } = {};
        for (let i = 0; i < filteredProblems.length; i++) {
            const problem = filteredProblems[i];
            const key = getProblemKey(problem);
            setDownloadProgress({ current: i + 1, total: filteredProblems.length, message: `Downloading: ${problem.name}`});
            
            const content = await fetchProblemContent(problem.contestId, problem.index);
            newOfflineProblems[key] = { problem, content, downloadedAt: Date.now() };
        }
        
        setOfflineProblems(newOfflineProblems); // This triggers the override
        setDownloadProgress({ current: filteredProblems.length, total: filteredProblems.length, message: 'Download complete!' });

    } catch (error: any) {
        console.error('Failed to download problem set:', error);
        setDownloadProgress(prev => ({ ...prev, message: `Error: ${error.message || 'Unknown error'}` }));
    } finally {
        setIsDownloadingSet(false);
         setTimeout(() => {
             setDownloadProgress({ current: 0, total: 0, message: '' });
        }, 5000);
    }
  };

  const clearAllProblems = () => {
    setOfflineProblems({});
  };
  
  const isOffline = (key: string) => key in offlineProblems;

  const value = {
    offlineProblems,
    isOffline,
    isDownloading: isDownloadingSet,
    downloadProgress,
    downloadProblemSet,
    clearAllProblems,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = (): OfflineContextType => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};