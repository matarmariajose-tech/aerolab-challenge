'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { useGameStore } from '@/store/useGameStore';
import Link from "next/link";

interface SearchProps {
  onSearch: (query: string) => void;
}

export default function Search({ onSearch }: SearchProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { searchResults, searchState, searchQuery } = useGameStore();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    if (query.trim() || searchResults.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    // Delay hiding to allow clicks on suggestions
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestions(false);
    }, 200);
  };

  const handleSuggestionClick = (gameName: string) => {
    setQuery(gameName);
    setShowSuggestions(false);
    onSearch(gameName);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      onSearch(query);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        onSearch(query);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  // Show popular suggestions when input is focused and empty
  const showPopularSuggestions = isFocused && !query.trim() && searchResults.length === 0;

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      <input
        ref={inputRef}
        type="text"
        placeholder="Search for games like The Legend of Zelda, Mario..."
        value={query}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyPress={handleKeyPress}
        className="w-full px-6 py-4 text-lg border-2 border-purple-300 rounded-full focus:outline-none focus:border-purple-500 bg-white/90 backdrop-blur-sm shadow-lg transition-all duration-300"
      />

      {/* Search Suggestions Dropdown */}
      {(showSuggestions || showPopularSuggestions) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm border border-purple-200 rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto">
          {/* Loading State */}
          {searchState === 'loading' && query.trim() && (
            <div className="p-4 text-center text-purple-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
              <p className="mt-2 text-sm">Searching...</p>
            </div>
          )}

          {/* Popular Suggestions */}
          {showPopularSuggestions && (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-purple-900 mb-3">Popular Searches</h3>
              <div className="space-y-2">
                {['The Legend of Zelda', 'Mario', 'Call of Duty', 'Grand Theft Auto', 'Fortnite'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left p-2 rounded-lg hover:bg-purple-50 transition-colors text-purple-700"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {query.trim() && searchResults.length > 0 && (
            <div className="p-2">
              {searchResults.slice(0, 8).map((game) => (
                <Link
                  key={game.id}
                  href={`/game/${game.slug}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors group"
                >
                  {game.cover?.image_id && (
                    <img
                      src={`https://images.igdb.com/igdb/image/upload/t_cover_small/${game.cover.image_id}.jpg`}
                      alt={game.name}
                      className="w-10 h-12 object-cover rounded-md"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-purple-900 font-medium truncate group-hover:text-purple-700">
                      {game.name}
                    </h4>
                    {game.rating && (
                      <p className="text-sm text-purple-600">
                        Rating: {game.rating.toFixed(1)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* No Results */}
          {query.trim() && searchState === 'empty' && (
            <div className="p-4 text-center text-purple-600">
              <p>No games found for "{query}"</p>
              <p className="text-sm mt-1">Try different keywords</p>
            </div>
          )}

          {/* Search Tips */}
          {query.trim() && searchResults.length > 0 && (
            <div className="border-t border-purple-100 p-3">
              <p className="text-xs text-purple-500 text-center">
                Press Enter to see all {searchResults.length} results
              </p>
            </div>
          )}
        </div>
      )}

      {/* Search Icon */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
        <svg
          className="w-5 h-5 text-purple-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>
  );
}