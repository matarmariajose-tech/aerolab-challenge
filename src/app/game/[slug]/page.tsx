import Header from "@/components/Header";
import { getGameBySlug, getGameDetails } from "@/lib/igdb";
import { Game } from "@/types/game";
import { notFound } from "next/navigation";
import Image from "next/image";

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function GameDetailPage({ params }: PageProps) {
    const { slug } = await params;

    console.log("🔍 Loading game with slug:", slug); // ✅ Debug

    let game: Game | null = null;

    try {
        if (slug.startsWith("game-")) {
            const gameId = slug.replace("game-", "");
            console.log("🔄 Fetching by ID:", gameId); // ✅ Debug
            game = await getGameDetails(gameId);
        } else {
            console.log("🔄 Fetching by slug:", slug); // ✅ Debug
            game = await getGameBySlug(slug);
        }

        console.log("📊 Full game data:", game); // Debug: mira todos los fields

        if (!game) {
            console.log("❌ Game not found, showing 404"); // ✅ Debug
            notFound();
        }

        console.log("✅ Game loaded successfully!"); // Tu log actual
    } catch (err) {
        console.error("💥 Error loading game:", err); // ✅ Debug
        notFound();
    }

    // Helper para fecha
    const formatDate = (timestamp?: number): string => {
        if (!timestamp) return 'Fecha no disponible';
        return new Date(timestamp * 1000).toLocaleDateString('es-ES');
    };

    // Helper para imagen IGDB (fallback si no hay cover)
    const getImageUrl = (imageId?: string, type: 'cover' | 'screenshot' = 'cover'): string => {
        if (!imageId) return `/placeholder-${type}.jpg`; // Agrega un placeholder local en public/
        const size = type === 'cover' ? 't_cover_big' : 't_screenshot_med';
        return `https://images.igdb.com/igdb/image/upload/${size}/${imageId}.jpg`;
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            <Header />
            <div className="max-w-4xl mx-auto">
                {/* Header con nombre y rating */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold mb-2">{game.name}</h1>
                    {game.rating && (
                        <div className="text-yellow-400 text-xl">⭐ {game.rating.toFixed(1)}/100</div>
                    )}
                    <p className="text-gray-400 mt-2">Slug: {game.slug} | ID: {game.id}</p> {/* Debug temporal, quítalo después */}
                </div>

                {/* Cover y detalles básicos */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <Image
                            src={getImageUrl(game.cover?.image_id)}
                            alt={`${game.name} cover`}
                            width={400}
                            height={500}
                            className="rounded-lg shadow-lg w-full max-w-xs mx-auto"
                        />
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Detalles</h2>
                        <p className="text-gray-300 mb-4">
                            <strong>Lanzamiento:</strong> {formatDate(game.first_release_date)}
                        </p>
                        {game.platforms && game.platforms.length > 0 && (
                            <p className="text-gray-300 mb-4">
                                <strong>Plataformas:</strong> {game.platforms.map(p => p.name).join(', ')}
                            </p>
                        )}
                        {game.genres && game.genres.length > 0 && (
                            <p className="text-gray-300 mb-4">
                                <strong>Géneros:</strong> {game.genres.map(g => g.name).join(', ')}
                            </p>
                        )}
                    </div>
                </div>

                {/* Summary */}
                {game.summary && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Descripción</h2>
                        <p className="text-gray-300 leading-relaxed">{game.summary}</p>
                    </div>
                )}

                {/* Screenshots (si hay) */}
                {game.screenshots && game.screenshots.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Capturas</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {game.screenshots.slice(0, 3).map((shot, idx) => ( // Solo primeras 3
                                <Image
                                    key={idx}
                                    src={getImageUrl(shot.image_id, 'screenshot')}
                                    alt={`${game.name} screenshot ${idx + 1}`}
                                    width={300}
                                    height={200}
                                    className="rounded-lg shadow-lg w-full"
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Si no hay summary ni screenshots, muestra un mensaje */}
                {(!game.summary && !game.screenshots?.length) && (
                    <div className="text-center text-gray-500 py-8">
                        Este bundle tiene datos limitados en la base de datos. ¡Prueba con otro juego!
                    </div>
                )}

                {/* Footer */}
                <div className="text-center mt-8">
                    <a href="/" className="text-blue-400 hover:underline">
                        ← Volver a la búsqueda
                    </a>
                </div>
            </div>
        </div>
    );
}