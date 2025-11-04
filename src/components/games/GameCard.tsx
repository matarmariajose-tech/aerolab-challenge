'use client';

import { Game } from '@/types/game';
import { useGameStore } from '@/store/useGameStore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
    ? `https://images.igdb.com/igdb/image/upload/t_cover_small/${game.cover.image_id}.jpg`
    : '/placeholder-game.jpg';

  const releaseYear = game.first_release_date
    ? new Date(game.first_release_date * 1000).getFullYear()
    : 'TBA';

  const isCollected = isGameCollected(game.id);

  if (compact) {
    return (
      <div
        className="relative bg-purple-800/20 rounded-lg p-2 border border-purple-600/30 hover:border-purple-400/50 transition-all duration-300 group cursor-pointer hover:scale-105 hover:bg-purple-800/30"
        onClick={handleCardClick}
      >
        <div className="relative aspect-[3/4] mb-2">
          <Image
            src={coverUrl}
            alt={game.name}
            fill
            className="rounded-md object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
          />

          {game.rating && (
            <div className="absolute bottom-1 left-1 bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded font-bold shadow-sm">
              {Math.round(game.rating)}%
            </div>
          )}

          {isCollected && (
            <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full shadow-sm">
              ✓
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-purple-100 text-xs font-semibold line-clamp-2 leading-tight min-h-[2rem] group-hover:text-white transition-colors">
            {game.name}
          </h3>

          <div className="flex justify-between items-center text-xs text-purple-300">
            <span>{releaseYear}</span>
            {game.platforms && game.platforms.length > 0 && (
              <span className="text-right truncate max-w-[60px]">
                {game.platforms[0].name}
                {game.platforms.length > 1 && ` +${game.platforms.length - 1}`}
              </span>
            )}
          </div>
        </div>

        <div className="absolute inset-0 bg-black/70 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex flex-col gap-1">
            {showAddButton && !isCollected && (
              <button
                onClick={handleAddToCollection}
                className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded transition-colors font-semibold shadow-lg"
              >
                Collect
              </button>
            )}
            {showRemoveButton && isCollected && (
              <button
                onClick={handleRemoveFromCollection}
                className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded transition-colors font-semibold shadow-lg"
              >
                Remove
              </button>
            )}
            <button className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1.5 rounded transition-colors font-semibold shadow-lg">
              View
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative bg-white/10 backdrop-blur-sm rounded-xl border border-purple-600/30 hover:border-purple-400/50 transition-all duration-300 group cursor-pointer hover:scale-105 hover:bg-white/20"
      onClick={handleCardClick}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl">
        <Image
          src={coverUrl.replace('cover_small', 'cover_big')}
          alt={game.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
        />

        {game.rating && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded-full text-sm font-bold shadow-lg">
            {Math.round(game.rating)}%
          </div>
        )}

        {isCollected && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            Collected
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex flex-col gap-2">
            {showAddButton && !isCollected && (
              <button
                onClick={handleAddToCollection}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold shadow-lg transform hover:scale-105"
              >
                Collect game
              </button>
            )}
            {showRemoveButton && isCollected && (
              <button
                onClick={handleRemoveFromCollection}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold shadow-lg transform hover:scale-105"
              >
                Remove
              </button>
            )}
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold shadow-lg transform hover:scale-105">
              View Details
            </button>
          </div>
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-bold text-white text-sm line-clamp-2 mb-1 group-hover:text-purple-200 transition-colors">
          {game.name}
        </h3>

        <div className="flex items-center justify-between text-xs text-purple-300">
          <span>{releaseYear}</span>

          {game.platforms && game.platforms.length > 0 && (
            <span className="truncate max-w-[120px] text-right">
              {game.platforms[0].name}
              {game.platforms.length > 1 && ` +${game.platforms.length - 1}`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}