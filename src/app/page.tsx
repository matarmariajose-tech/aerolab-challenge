'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import Search from '../components/Search';
import GameCard from '../components/games/GameCard';
import { Game } from '../types/game';

export default function Home() {
  const {
    games,
    searchResults,
    searchState,
    searchQuery,
    clearSearch,
    sortBy,
    setSortBy,
    getSortedGames
  } = useGameStore();

  const [displayGames, setDisplayGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState('');

  const loadPopularGames = async () => {
    try {
      setIsLoading(true);
      setDebugInfo('Starting to load popular games...');

      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'popular', limit: 20 }),
      });

      setDebugInfo(`Response status: ${response.status}`);

      if (response.ok) {
        const popularGames = await response.json();

        if (Array.isArray(popularGames) && popularGames.length > 0) {
          setDisplayGames(popularGames);
        } else {
          setDisplayGames([]);
          setDebugInfo('No games in response array');
        }
      } else {
        const errorText = await response.text();
        setDebugInfo(`Error ${response.status}: ${errorText}`);
        setDisplayGames([]);
      }
    } catch (error) {
      console.error('Error loading popular games:', error);
      setDisplayGames([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPopularGames();
  }, []);

  useEffect(() => {
    console.log('Search state changed:', {
      searchQuery,
      searchState,
      searchResultsCount: searchResults.length,
      displayGamesCount: displayGames.length
    });

    if (searchQuery.trim() && searchState === 'success') {
      setDisplayGames(searchResults);
      setDebugInfo(`Showing ${searchResults.length} search results`);
    } else if (searchQuery.trim() && searchState === 'empty') {
      setDisplayGames([]);
      setDebugInfo('No search results found');
    }
  }, [searchQuery, searchState, searchResults]);

  const handleClearSearch = () => {
    console.log('Clearing search');
    clearSearch();
    setDisplayGames([]);
    loadPopularGames();
  };

  return (
    <div className="min-h-screen py-6">
      <div className="container mx-auto px-3">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-purple-500 to-violet-300 bg-clip-text text-transparent">
            Game Collection
          </h1>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <Search onSearch={(query) => useGameStore.getState().searchGames(query)} />

          {searchQuery && (
            <div className="mt-3 text-center">
              <button
                onClick={handleClearSearch}
                className="text-purple-200 hover:text-white text-sm px-4 py-2 rounded-lg bg-purple-800/50 hover:bg-purple-700/60 transition-all duration-300 border border-purple-600/50 hover:border-purple-400/50 hover:scale-105"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="text-center py-12 bg-purple-900/30 rounded-2xl border border-purple-700/50 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-300 mx-auto mb-3"></div>
            <p className="text-purple-200">Loading games...</p>
          </div>
        )}

        {!isLoading && displayGames.length === 0 && (
          <div className="text-center py-12 bg-purple-900/30 rounded-2xl backdrop-blur-sm">
            <div className="text-5xl mb-4">🎮</div>
            <h3 className="text-xl font-bold text-purple-200 mb-2">
              {searchQuery ? 'No games found' : 'No games available'}
            </h3>
            <p className="text-purple-300">
              {searchQuery
                ? 'Try different keywords'
                : 'Popular games will appear here soon'}
            </p>
          </div>
        )}

        {!isLoading && displayGames.length > 0 && (
          <div className="bg-purple-900/30 backdrop-blur-sm rounded-2xl p-4 shadow-xl mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-violet-100">
                  {searchQuery ? `Search Results` : 'Popular Games'}
                </h2>
                <p className="text-purple text-sm font-bold text-violet-100">
                  {searchQuery
                    ? `Found ${displayGames.length} games`
                    : 'Top rated games'
                  }
                </p>
              </div>
              <div className="bg-purple-800/50 px-4 py-2 rounded-full">
                <span className="text-purple-200 font-semibold text-sm">
                  {displayGames.length} {displayGames.length === 1 ? 'game' : 'games'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {displayGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  showAddButton={true}
                />
              ))}
            </div>
          </div>
        )}

        {!searchQuery && games.length > 0 && (
          <div className="bg-purple-900/30 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-purple-200">
                  Your Collection
                </h2>
                <p className="text-purple-300 text-sm">
                  Your personal game collection
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="relative bg-purple-900/80 text-purple-100 px-4 py-2 rounded-lg border border-purple-600/50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 hover:bg-purple-800/80"
                  >
                    <option value="dateAdded">📅 Date Added</option>
                    <option value="releaseDate">🎮 Release Date</option>
                    <option value="name">🔤 Name</option>
                  </select>
                </div>

                <div className="bg-gradient-to-r from-violet-600/60 to-purple-600/60 px-4 py-2 rounded-full border border-violet-500/50 backdrop-blur-sm">
                  <span className="text-violet-100 font-semibold text-sm">
                    {games.length} {games.length === 1 ? 'game' : 'games'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {getSortedGames().map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  showRemoveButton={true}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}