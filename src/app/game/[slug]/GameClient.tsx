"use client";

import { useGameStore } from "@/store/useGameStore";
import { Game } from "@/types/game";
import { useRouter } from "next/navigation";

interface GameClientProps {
    game: Game;
    slug: string;
}

export default function GameClient({ game, slug }: GameClientProps) {
    const router = useRouter();
    const { addGame, removeGame, isGameCollected } = useGameStore();

    const handleToggleCollection = () => {
        if (isGameCollected(game.id)) {
            removeGame(game.id);
        } else {
            addGame(game);
        }
    };

    const getReleaseYear = (timestamp?: number) => {
        return timestamp ? new Date(timestamp * 1000).getFullYear() : "Unknown";
    };

    const getYearsAgo = (timestamp?: number) => {
        if (!timestamp) return "Unknown";
        const years = new Date().getFullYear() - new Date(timestamp * 1000).getFullYear();
        return `${years} year${years !== 1 ? "s" : ""} ago`;
    };

    const isCollected = isGameCollected(game.id);

    const coverUrl = game.cover
        ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
        : "/placeholder-game.jpg";

    return (
        <div className="min-h-screen bg-gray-50">

            <main className="container mx-auto px-4 py-8">
                <nav className="mb-6">
                    <button
                        onClick={() => router.push("/")}
                        className="text-blue-500 hover:text-blue-600 font-medium"
                    >
                        ← Back to Collection
                    </button>
                </nav>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="md:flex">
                        <div className="md:w-1/3 p-6">
                            <img
                                src={coverUrl}
                                alt={game.name}
                                className="w-full rounded-lg shadow-md"
                            />
                        </div>

                        <div className="md:w-2/3 p-6">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{game.name}</h1>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500">Rating</h3>
                                    <p className="text-lg font-bold text-gray-900">
                                        {game.rating ? `⭐ ${Math.round(game.rating)}/100` : "Not rated"}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500">Release Date</h3>
                                    <p className="text-lg text-gray-900">
                                        {getReleaseYear(game.first_release_date)}
                                        <span className="text-sm text-gray-500 ml-2">
                                            ({getYearsAgo(game.first_release_date)})
                                        </span>
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500">Platforms</h3>
                                    <p className="text-lg text-gray-900">
                                        {game.platforms?.map(p => p.name).join(", ") || "Unknown"}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500">Status</h3>
                                    <p className={`text-lg font-semibold ${isCollected ? "text-green-600" : "text-gray-600"}`}>
                                        {isCollected ? "In Collection" : "Not Collected"}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleToggleCollection}
                                className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors mb-6 ${isCollected
                                    ? "bg-red-500 hover:bg-red-600 text-white"
                                    : "bg-blue-500 hover:bg-blue-600 text-white"
                                    }`}
                            >
                                {isCollected ? "Remove from Collection" : "Add to Collection"}
                            </button>

                            {game.summary && (
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">About</h3>
                                    <p className="text-gray-700 leading-relaxed">{game.summary}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}