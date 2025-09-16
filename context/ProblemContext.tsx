
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Problem } from '../types';
import { fetchProblems } from '../services/codeforcesService';

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
    const loadProblems = async () => {
      try {
        setLoading(true);
        const fetchedProblems = await fetchProblems();
        setProblems(fetchedProblems);
        setError(null);
      } catch (e) {
        setError('Failed to load problems.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadProblems();
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
