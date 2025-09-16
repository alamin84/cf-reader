import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const LAST_SEARCH_RANGE_KEY = 'codeforcesLastSearchRange';
const DEFAULT_SEARCH_RANGE_KEY = 'codeforcesDefaultSearchRange';

const getInitialRange = (): { min: string; max: string } => {
  try {
    const defaultItem = window.localStorage.getItem(DEFAULT_SEARCH_RANGE_KEY);
    if (defaultItem) return JSON.parse(defaultItem);
    
    const lastItem = window.localStorage.getItem(LAST_SEARCH_RANGE_KEY);
    if (lastItem) return JSON.parse(lastItem);

    return { min: '1200', max: '1600' };
  } catch (error) {
    console.error('Error reading search range from localStorage', error);
    return { min: '1200', max: '1600' };
  }
};

const getStoredDefault = (): { min: string; max: string } | null => {
    try {
        const item = window.localStorage.getItem(DEFAULT_SEARCH_RANGE_KEY);
        return item ? JSON.parse(item) : null;
    } catch {
        return null;
    }
}

const SearchBar: React.FC = () => {
  const navigate = useNavigate();
  const initialRange = useMemo(() => getInitialRange(), []);

  const [minRating, setMinRating] = useState(initialRange.min);
  const [maxRating, setMaxRating] = useState(initialRange.max);
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    const storedDefault = getStoredDefault();
    if (storedDefault) {
      setIsDefault(minRating === storedDefault.min && maxRating === storedDefault.max);
    } else {
      // If no default is set, checking the box will set one.
      setIsDefault(false);
    }
  }, [minRating, maxRating]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (minRating && maxRating && parseInt(minRating) <= parseInt(maxRating)) {
      try {
        const currentRange = { min: minRating, max: maxRating };
        window.localStorage.setItem(LAST_SEARCH_RANGE_KEY, JSON.stringify(currentRange));
        if(isDefault) {
            window.localStorage.setItem(DEFAULT_SEARCH_RANGE_KEY, JSON.stringify(currentRange));
        }
      } catch (error) {
        console.error('Error writing search range to localStorage', error);
      }
      navigate(`/problems?min=${minRating}&max=${maxRating}`);
    } else {
      alert("Please enter a valid rating range.");
    }
  };

  return (
    <form onSubmit={handleSearch} className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row items-end gap-4">
        <div className="flex-1 w-full">
          <label htmlFor="min-rating" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Min Rating</label>
          <input
            id="min-rating"
            type="number"
            step="100"
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            placeholder="e.g., 800"
            className="w-full bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
        <div className="flex-1 w-full">
          <label htmlFor="max-rating" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Max Rating</label>
          <input
            id="max-rating"
            type="number"
            step="100"
            value={maxRating}
            onChange={(e) => setMaxRating(e.target.value)}
            placeholder="e.g., 1200"
            className="w-full bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
        <div className="w-full sm:w-auto flex flex-row-reverse sm:flex-row items-center gap-4">
           <div className="flex items-center h-[42px]">
            <input
              id="set-default"
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-sky-600 bg-gray-100 dark:bg-zinc-800 focus:ring-sky-500 cursor-pointer"
            />
            <label htmlFor="set-default" className="ml-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer select-none">Set as default</label>
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-6 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-900 focus:ring-sky-500 h-[42px]"
          >
            Search
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;