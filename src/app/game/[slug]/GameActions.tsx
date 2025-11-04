"use client";

import { useGameStore } from "@/store/useGameStore";
import { Game } from "@/types/game";
import { useRouter } from "next/navigation";

interface GameActionsProps {
    game: Game;
}

export default function GameActions({ game }: GameActionsProps) {
    const router = useRouter();
    const { addGame, removeGame, isGameCollected } = useGameStore();

    const handleToggleCollection = () => {
        if (isGameCollected(game.id)) {
            removeGame(game.id);
        } else {
            addGame(game);
        }
    };

    const isCollected = isGameCollected(game.id);

    return (
        <nav className="mb-6">
            <button
                onClick={() => router.push("/")}
                className="text-blue-500 hover:text-blue-600 font-medium mb-4"
            >
                ← Back to Collection
            </button>

            <div className="flex items-center gap-4 mb-6">
                <div>
                    <span className={`text-lg font-semibold ${isCollected ? "text-green-600" : "text-gray-600"}`}>
                        {isCollected ? "In Collection" : "Not Collected"}
                    </span>
                </div>

                <button
                    onClick={handleToggleCollection}
                    className={`py-2 px-6 rounded-lg font-semibold transition-colors ${isCollected
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                >
                    {isCollected ? "Remove from Collection" : "Add to Collection"}
                </button>
            </div>
        </nav>
    );
}