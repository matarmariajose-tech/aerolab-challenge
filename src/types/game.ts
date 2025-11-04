
export interface Platform {
  id: number;
  name: string;
}

export interface Cover {
  id: number;
  image_id: string;
}

export interface Game {
  dateAdded: number;
  genres: boolean;
  screenshots: boolean;
  slug: string;
  id: number;
  name: string;
  cover?: Cover;
  first_release_date?: number;
  rating?: number;
  platforms?: Platform[];
  summary?: string;
}

export interface GameCollection {
  games: Game[];
  addGame: (game: Game) => void;
  removeGame: (gameId: number) => void;
  isGameCollected: (gameId: number) => boolean;
}

export type SearchState = 'idle' | 'loading' | 'success' | 'empty' | 'error';