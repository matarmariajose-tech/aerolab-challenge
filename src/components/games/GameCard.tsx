'use client';

import { Game } from '@/types/game';
import { useGameStore } from '@/store/useGameStore';
import { useRouter } from 'next/navigation';

interface GameCardProps {
  game: Game;
  showAddButton?: boolean;
  showRemoveButton?: boolean;
  compact?: boolean;
}

export default function GameCard({
  game,
  showAddButton = false,
  showRemoveButton = false,
  compact = false,
}: GameCardProps) {
  const router = useRouter();
  const { addGame, removeGame, isGameCollected } = useGameStore();

  const handleCardClick = () => {
    router.push(`/game/${game.slug}`);
  };

  const handleAddToCollection = (e: React.MouseEvent) => {
    e.stopPropagation();
    addGame(game);
  };

  const handleRemoveFromCollection = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeGame(game.id);
  };

  const coverUrl = game.cover?.image_id
    ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
    : '/placeholder-game.jpg';

  const releaseYear = game.first_release_date
    ? new Date(game.first_release_date * 1000).getFullYear()
    : 'TBA';

  const isCollected = isGameCollected(game.id);

  return (
    <div
      className="game-card group cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-2xl">
        <img
          src={coverUrl}
          alt={game.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-game.jpg';
          }}
        />

        {game.rating && (
          <div className="rating-badge">
            {Math.round(game.rating)}%
          </div>
        )}

        {isCollected && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
            Collected
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            {showAddButton && !isCollected && (
              <button
                onClick={handleAddToCollection}
                className="btn-collect text-sm px-5 py-2"
              >
                Collect game
              </button>
            )}

            {showRemoveButton && isCollected && (
              <button
                onClick={handleRemoveFromCollection}
                className="btn-collect text-sm px-5 py-2 bg-red-500 hover:bg-red-600"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 line-clamp-2 mb-1">
          {game.name}
        </h3>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{releaseYear}</span>

          {game.platforms && game.platforms.length > 0 && (
            <span className="truncate max-w-[140px] text-right">
              {game.platforms[0].name}
              {game.platforms.length > 1 && ` +${game.platforms.length - 1}`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}