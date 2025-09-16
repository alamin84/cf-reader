
import { useState, useEffect, useCallback } from 'react';
import { ProblemStatus } from '../types';

const PROBLEM_STATUS_KEY = 'codeforcesProblemStatus';
const HIDE_READ_FROM_SEARCH_KEY = 'codeforcesHideReadFromSearch';

const getInitialStatus = (): ProblemStatus => {
  try {
    const item = window.localStorage.getItem(PROBLEM_STATUS_KEY);
    return item ? JSON.parse(item) : {};
  } catch (error) {
    console.error('Error reading from localStorage', error);
    return {};
  }
};

const getInitialHideRead = (): boolean => {
  try {
    const item = window.localStorage.getItem(HIDE_READ_FROM_SEARCH_KEY);
    return item ? JSON.parse(item) : false;
  } catch (error) {
    console.error('Error reading from localStorage', error);
    return false;
  }
};

export const useStatusManager = () => {
  const [statuses, setStatuses] = useState<ProblemStatus>(getInitialStatus);
  const [hideReadFromSearch, setHideReadFromSearch] = useState<boolean>(getInitialHideRead);

  useEffect(() => {
    try {
      window.localStorage.setItem(PROBLEM_STATUS_KEY, JSON.stringify(statuses));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  }, [statuses]);

  useEffect(() => {
    try {
      window.localStorage.setItem(HIDE_READ_FROM_SEARCH_KEY, JSON.stringify(hideReadFromSearch));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  }, [hideReadFromSearch]);

  const getProblemKey = useCallback((contestId: number, index: string) => `${contestId}-${index}`, []);

  const getStatus = useCallback((contestId: number, index: string) => {
    const key = getProblemKey(contestId, index);
    return statuses[key] || { bookmarked: false, read: false };
  }, [statuses, getProblemKey]);
  
  const toggleBookmark = useCallback((contestId: number, index: string) => {
    const key = getProblemKey(contestId, index);
    setStatuses(prev => {
      const currentStatus = prev[key] || { bookmarked: false, read: false };
      return {
        ...prev,
        [key]: { ...currentStatus, bookmarked: !currentStatus.bookmarked },
      };
    });
  }, [getProblemKey]);

  const toggleRead = useCallback((contestId: number, index: string) => {
    const key = getProblemKey(contestId, index);
    setStatuses(prev => {
      const currentStatus = prev[key] || { bookmarked: false, read: false };
      return {
        ...prev,
        [key]: { ...currentStatus, read: !currentStatus.read },
      };
    });
  }, [getProblemKey]);
  
  const getBookmarkedKeys = useCallback(() => {
    return Object.keys(statuses).filter(key => statuses[key].bookmarked);
  }, [statuses]);
  
  const getReadKeys = useCallback(() => {
    return Object.keys(statuses).filter(key => statuses[key].read);
  }, [statuses]);

  const toggleHideReadFromSearch = useCallback(() => {
    setHideReadFromSearch(prev => !prev);
  }, []);

  return { 
    statuses, 
    toggleBookmark, 
    toggleRead, 
    getStatus, 
    getBookmarkedKeys, 
    getReadKeys, 
    getProblemKey,
    hideReadFromSearch,
    toggleHideReadFromSearch 
  };
};
