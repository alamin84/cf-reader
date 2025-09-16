
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProblemProvider } from './context/ProblemContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { OfflineProvider } from './context/OfflineContext';
import Header from './components/Header';
import ProblemListPage from './pages/ProblemListPage';
import ProblemDetailPage from './pages/ProblemDetailPage';
import BookmarkedPage from './pages/BookmarkedPage';
import ReadPage from './pages/ReadPage';
import DownloadPage from './pages/DownloadPage';

const AppContent: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''}`}>
      <div className="bg-slate-50 dark:bg-zinc-950 text-gray-800 dark:text-gray-200 min-h-screen font-sans">
        <Header />
        <main className="container mx-auto p-4 md:p-6">
          <Routes>
            <Route path="/" element={<ProblemListPage />} />
            <Route path="/download" element={<DownloadPage />} />
            <Route path="/problem/:contestId/:index" element={<ProblemDetailPage />} />
            <Route path="/bookmarked" element={<BookmarkedPage />} />
            <Route path="/read" element={<ReadPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ProblemProvider>
        <OfflineProvider>
          <HashRouter>
            <AppContent />
          </HashRouter>
        </OfflineProvider>
      </ProblemProvider>
    </ThemeProvider>
  );
};

export default App;