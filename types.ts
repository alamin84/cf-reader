
export interface Problem {
  contestId: number;
  index: string;
  name: string;
  type: string;
  points?: number;
  rating?: number;
  tags: string[];
}

export interface ProblemWithStatus extends Problem {
  isBookmarked: boolean;
  isRead: boolean;
  isOffline: boolean;
  isDownloading: boolean;
}

export interface ProblemStatus {
  [key: string]: {
    bookmarked: boolean;
    read: boolean;
  };
}

export interface Content {
  Problem: string;
  Solution: string;
  Code: {
    content: string;
    language: 'cpp' | 'python' | 'text';
  };
}

export interface OfflineProblem {
  problem: Problem;
  content: Content | { error: string };
  downloadedAt: number;
}