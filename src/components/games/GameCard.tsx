"use client";

import { useRouter } from "next/navigation";
import { Game } from "@/types/game";
import { useGameStore } from "@/store/useGameStore";

interface GameCardProps {
  game: Game;
}

// Función para generar slug desde nombre (fallback)
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function GameCard({ game }: GameCardProps) {
  const router = useRouter();
  const { addGame, removeGame, isGameCollected } = useGameStore();
  const isCollected = isGameCollected(game.id);

  const coverUrl = game.cover
    ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
    : "/placeholder-game.jpg";

  const handleCardClick = () => {
    // Usar slug si está disponible, sino generar uno desde el nombre
    const slug = game.slug || generateSlug(game.name);
    router.push(`/game/${slug}`);
  };

  const handleToggleCollection = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isCollected) {
      removeGame(game.id);
    } else {
      // Asegurarnos de que el juego tenga slug antes de agregarlo
      const gameWithSlug = {
        ...game,
        slug: game.slug || generateSlug(game.name)
      };
      addGame(gameWithSlug);
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={handleCardClick}
    >
      <img
        src={coverUrl}
        alt={game.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 leading-tight">
          {game.name}
        </h3>

        <div className="space-y-1 mb-3">
          {game.rating && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="text-yellow-500 mr-1">⭐</span>
              <span>{Math.round(game.rating)}/100</span>
            </div>
          )}
          {game.first_release_date && (
            <p className="text-sm text-gray-500">
              📅 {new Date(game.first_release_date * 1000).getFullYear()}
            </p>
          )}
          {game.platforms && game.platforms.length > 0 && (
            <p className="text-sm text-gray-500">
              🎮 {game.platforms.slice(0, 2).map(p => p.name).join(", ")}
              {game.platforms.length > 2 && "..."}
            </p>
          )}
        </div>

        <button
          onClick={handleToggleCollection}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${isCollected
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
        >
          {isCollected ? "Remove" : "Add to Collection"}
        </button>
      </div>
    </div>
  );
}