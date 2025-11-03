"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import Search from "@/components/Search";
import GameCard from "@/components/games/GameCard";
import { useGameStore } from "@/store/useGameStore";
import { searchGames } from "@/lib/igdb";
import { Game } from "@/types/game";

export default function Home() {
  const { games: collectedGames } = useGameStore();
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Memoizar la función de búsqueda
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    try {
      const results = await searchGames(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const gamesToShow = searchQuery.length >= 2 ? searchResults : collectedGames;
  const showingSearchResults = searchQuery.length >= 2;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Search onSearch={handleSearch} />

        {showingSearchResults && (
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-gray-700">
              Search Results for "{searchQuery}"
            </h2>
            {searchResults.length === 0 && !isSearching && (
              <p className="text-gray-500 mt-2">No games found</p>
            )}
          </div>
        )}

        {!showingSearchResults && collectedGames.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">
              No games collected yet
            </h2>
            <p className="text-gray-500">
              Search for games above to start your collection!
            </p>
          </div>
        )}

        {!showingSearchResults && collectedGames.length > 0 && (
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-black-700">
              Your Game Collection ({collectedGames.length})
            </h2>
          </div>
        )}

        {isSearching && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-balck-500 mt-2">Searching games...</p>
          </div>
        )}

        {gamesToShow.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {gamesToShow.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}