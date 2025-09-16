import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Problem, OfflineProblem } from '../types';
import { fetchProblemContent } from '../services/codeforcesService';

const OFFLINE_PROBLEMS_KEY = 'codeforcesOfflineProblems';

interface OfflineContextType {
  offlineProblems: { [key: string]: OfflineProblem };
  isOffline: (key: string) => boolean;
  isDownloading: (key: string) => boolean;
  downloadProblem: (problem: Problem) => Promise<void>;
  deleteProblem: (key: string) => void;
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
  const [downloading, setDownloading] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      window.localStorage.setItem(OFFLINE_PROBLEMS_KEY, JSON.stringify(offlineProblems));
    } catch (error) {
      console.error('Error writing offline problems to localStorage', error);
    }
  }, [offlineProblems]);

  const getProblemKey = (p: Problem) => `${p.contestId}-${p.index}`;

  const downloadProblem = async (problem: Problem) => {
    const key = getProblemKey(problem);
    if (downloading.has(key) || key in offlineProblems) return;

    setDownloading(prev => new Set(prev).add(key));

    try {
      const content = await fetchProblemContent(problem.contestId, problem.index);

      setOfflineProblems(prev => ({
        ...prev,
        [key]: { problem, content, downloadedAt: Date.now() },
      }));

    } catch (error: any) {
      console.error(`Failed to download problem ${key}:`, error);
      setOfflineProblems(prev => ({
        ...prev,
        [key]: { problem, content: { error: error.message || 'An unknown error occurred.' }, downloadedAt: Date.now() },
      }));
    } finally {
      setDownloading(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  };

  const deleteProblem = (key: string) => {
    setOfflineProblems(prev => {
      const newProblems = { ...prev };
      delete newProblems[key];
      return newProblems;
    });
  };

  const isOffline = (key: string) => key in offlineProblems;
  const isDownloading = (key: string) => downloading.has(key);

  const value = {
    offlineProblems,
    isOffline,
    isDownloading,
    downloadProblem,
    deleteProblem
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