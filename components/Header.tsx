
import React from 'react';
import { NavLink } from 'react-router-dom';

const Header: React.FC = () => {
  const activeLinkClass = "bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-300";
  const inactiveLinkClass = "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-gray-100";
  const linkBaseClass = "px-3 py-2 rounded-md text-sm font-medium transition-colors";

  return (
    <header className="bg-white dark:bg-zinc-950/50 backdrop-blur-sm shadow-sm dark:shadow-md sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <NavLink to="/" className="text-gray-800 dark:text-gray-100 text-xl font-bold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-500"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
              <span>CF Viewer</span>
            </NavLink>
          </div>
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavLink to="/" className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
                Search
              </NavLink>
              <NavLink to="/bookmarked" className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
                Bookmarked
              </NavLink>
              <NavLink to="/read" className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
                Marked as Read
              </NavLink>
              <NavLink to="/offline" className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}>
                Offline
              </NavLink>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;