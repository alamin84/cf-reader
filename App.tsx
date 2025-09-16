
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ProblemProvider } from './context/ProblemContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { OfflineProvider } from './context/OfflineContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ProblemListPage from './pages/ProblemListPage';
import ProblemDetailPage from './pages/ProblemDetailPage';
import BookmarkedPage from './pages/BookmarkedPage';
import ReadPage from './pages/ReadPage';
import OfflinePage from './pages/OfflinePage';

const AppInitializer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // On the initial mount of the app, if the path is not the home page,
    // redirect to the home page. This ensures that any refresh or direct
    // link navigation in a new session starts at the beginning.
    if (location.pathname !== '/') {
      navigate('/', { replace: true });
    }
    // The empty dependency array is crucial. It makes this effect run only once when the app mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  return null;
};


const AppContent: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''}`}>
      <div className="bg-slate-50 dark:bg-zinc-950 text-gray-800 dark:text-gray-200 min-h-screen font-sans">
        <Header />
        <main className="container mx-auto p-4 md:p-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/problems" element={<ProblemListPage />} />
            <Route path="/problem/:contestId/:index" element={<ProblemDetailPage />} />
            <Route path="/bookmarked" element={<BookmarkedPage />} />
            <Route path="/read" element={<ReadPage />} />
            <Route path="/offline" element={<OfflinePage />} />
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
            <AppInitializer />
            <AppContent />
          </HashRouter>
        </OfflineProvider>
      </ProblemProvider>
    </ThemeProvider>
  );
};

export default App;