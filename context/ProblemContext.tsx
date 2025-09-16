
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Problem, OfflineProblem } from '../types';

const OFFLINE_PROBLEMS_KEY = 'codeforcesOfflineProblems';

interface ProblemContextType {
  problems: Problem[];
  loading: boolean;
  error: string | null;
}

const ProblemContext = createContext<ProblemContextType | undefined>(undefined);

export const ProblemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProblemsFromStorage = () => {
      try {
        setLoading(true);
        const item = window.localStorage.getItem(OFFLINE_PROBLEMS_KEY);
        const offlineProblems: { [key: string]: OfflineProblem } = item ? JSON.parse(item) : {};
        
        const downloadedProblems = Object.values(offlineProblems)
            .map(p => p.problem)
            .sort((a, b) => b.contestId - a.contestId); // Sort by newest first

        setProblems(downloadedProblems);
        setError(null);
      } catch (e) {
        setError('Failed to load problems from local storage.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadProblemsFromStorage();

    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === OFFLINE_PROBLEMS_KEY) {
            loadProblemsFromStorage();
        }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <ProblemContext.Provider value={{ problems, loading, error }}>
      {children}
    </ProblemContext.Provider>
  );
};

export const useProblems = (): ProblemContextType => {
  const context = useContext(ProblemContext);
  if (context === undefined) {
    throw new Error('useProblems must be used within a ProblemProvider');
  }
  return context;
};