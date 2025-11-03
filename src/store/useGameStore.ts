
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Game, GameCollection } from "@/types/game";

export const useGameStore = create<GameCollection>()(
  persist(
    (set, get) => ({
      games: [],
      addGame: (game: Game) => {
        const { games } = get();
        if (!games.find((g) => g.id === game.id)) {
          set({ games: [...games, game] });
        }
      },
      removeGame: (gameId: number) => {
        const { games } = get();
        set({ games: games.filter((game) => game.id !== gameId) });
      },
      isGameCollected: (gameId: number) => {
        const { games } = get();
        return games.some((game) => game.id === gameId);
      },
    }),
    {
      name: "game-collection",
    }
  )
);

