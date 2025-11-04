'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import Search from '@/components/Search';
import GameCard from '@/components/games/GameCard';
import { Game } from '@/types/game';

export default function Home() {
  const { games, searchResults, searchState, searchQuery, clearSearch } = useGameStore();
  const [displayGames, setDisplayGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState('');

  // Función reusable para cargar populares (POST)
  const loadPopularGames = async () => {
    try {
      setIsLoading(true);
      setDebugInfo('Starting to load popular games...');

      console.log('[DEBUG] Fetching popular games...');
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'popular', limit: 20 }),
      });

      console.log('[DEBUG] Response status:', response.status);
      setDebugInfo(`Response status: ${response.status}`);

      if (response.ok) {
        const popularGames = await response.json();
        console.log('Popular games received:', popularGames);
        console.log('Games array?:', Array.isArray(popularGames));
        console.log('Number of games:', popularGames?.length || 0);

        setDebugInfo(`Received ${popularGames?.length || 0} games`);

        if (Array.isArray(popularGames) && popularGames.length > 0) {
          setDisplayGames(popularGames);
        } else {
          setDisplayGames([]);
          setDebugInfo('No games in response array');
        }
      } else {
        const errorText = await response.text();
        console.error('Response not OK:', response.status, errorText);
        setDebugInfo(`Error ${response.status}: ${errorText}`);
        setDisplayGames([]);
      }
    } catch (error) {
      console.error('Error loading popular games:', error);
      setDebugInfo(`Fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setDisplayGames([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar al inicio
  useEffect(() => {
    loadPopularGames();
  }, []);

  // Mostrar resultados de búsqueda
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
    loadPopularGames(); // Recarga populares
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Debug Info - REMOVER DESPUÉS */}
        <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 p-3 rounded text-sm max-w-xs z-50">
          <div className="font-semibold">Debug Info:</div>
          <div>Search Query: "{searchQuery}"</div>
          <div>Search State: {searchState}</div>
          <div>Display Games: {displayGames.length}</div>
          <div>Collection: {games.length}</div>
          <div className="mt-1 text-xs">{debugInfo}</div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Game Collection
          </h1>
          <p className="text-gray-600 mb-8">
            Search and collect your favorite video games
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <Search onSearch={(query) => useGameStore.getState().searchGames(query)} />

          {searchQuery && (
            <div className="mt-4 text-center">
              <button
                onClick={handleClearSearch}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear search and show popular games
              </button>
            </div>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading games...</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && displayGames.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">Gamepad</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No games found' : 'No games available'}
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? 'Try searching with different keywords'
                : 'Popular games will appear here'}
            </p>
          </div>
        )}

        {/* Games Grid */}
        {!isLoading && displayGames.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {searchQuery ? `Search Results (${displayGames.length})` : 'Popular Games'}
              </h2>
              {searchQuery && (
                <span className="text-sm text-gray-500">
                  Found {displayGames.length} games
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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

        {/* Collection */}
        {!searchQuery && games.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Your Collection ({games.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {games.map((game) => (
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