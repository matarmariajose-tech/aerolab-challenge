import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Game, GameCollection, SearchState } from "@/types/game";

interface GameState extends GameCollection {
  searchState: SearchState;
  searchQuery: string;
  searchResults: Game[];
  sortBy: 'dateAdded' | 'releaseDate' | 'name';

  searchGames: (query: string) => Promise<void>;
  clearSearch: () => void;
  setSearchQuery: (query: string) => void;
  addGame: (game: Game) => void;
  removeGame: (gameId: number) => void;
  isGameCollected: (gameId: number) => boolean;
  setSortBy: (sortBy: GameState['sortBy']) => void;
  getSortedGames: () => Game[];
}

const searchCache = new Map<string, { games: Game[]; timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000;

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      games: [],
      searchState: 'idle',
      searchQuery: '',
      searchResults: [],
      sortBy: 'dateAdded',

      searchGames: async (query: string) => {
        const trimmed = query.trim();
        if (!trimmed) {
          set({ searchQuery: '', searchResults: [], searchState: 'idle' });
          return;
        }

        const cached = searchCache.get(trimmed);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          set({
            searchQuery: trimmed,
            searchResults: cached.games,
            searchState: cached.games.length > 0 ? 'success' : 'empty'
          });
          return;
        }

        set({ searchQuery: trimmed, searchState: 'loading', searchResults: [] });

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const response = await fetch('/api/games', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'search', query: trimmed, limit: 30 }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || `HTTP ${response.status}`);
          }

          const games = await response.json();
          const validGames = Array.isArray(games) ? games : [];

          searchCache.set(trimmed, { games: validGames, timestamp: Date.now() });

          set({
            searchResults: validGames,
            searchState: validGames.length > 0 ? 'success' : 'empty'
          });
        } catch (error: any) {
          console.error('Search error:', error);
          set({ searchResults: [], searchState: error.name === 'AbortError' ? 'error' : 'error' });
        }
      },

      clearSearch: () => {
        set({ searchQuery: '', searchResults: [], searchState: 'idle' });
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      addGame: (game: Game) => {
        const { games } = get();
        if (!games.some(g => g.id === game.id)) {
          const gameWithDate = {
            ...game,
            dateAdded: Date.now()
          };
          set({ games: [gameWithDate, ...games] });
          searchCache.clear();
        }
      },

      removeGame: (gameId: number) => {
        set({ games: get().games.filter(g => g.id !== gameId) });
      },

      isGameCollected: (gameId: number) => {
        return get().games.some(g => g.id === gameId);
      },

      setSortBy: (sortBy) => set({ sortBy }),

      getSortedGames: () => {
        const { games, sortBy } = get();
        const sortedGames = [...games];

        switch (sortBy) {
          case 'dateAdded':
            return sortedGames.sort((a, b) =>
              new Date(b.dateAdded || 0).getTime() - new Date(a.dateAdded || 0).getTime()
            );
          case 'releaseDate':
            return sortedGames.sort((a, b) =>
              (b.first_release_date || 0) - (a.first_release_date || 0)
            );
          case 'name':
            return sortedGames.sort((a, b) =>
              a.name.localeCompare(b.name)
            );
          default:
            return sortedGames;
        }
      },
    }),
    {
      name: "game-collection",
      partialize: (state) => ({
        games: state.games,
        sortBy: state.sortBy
      }),
      version: 2
    }
  )
);