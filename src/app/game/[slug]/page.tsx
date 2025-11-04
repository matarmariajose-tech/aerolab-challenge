import { gameService } from "@/services/game-service";
import { Game } from "@/types/game";
import { notFound } from "next/navigation";
import Image from "next/image";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function GameDetailPage({ params }: PageProps) {
    const { slug } = await params;

    console.log("Cargando juego con slug:", slug);

    // USA gameService (con caché, estrategias, IGDB)
    const { game, strategy } = await gameService.getGameBySlug(slug);

    if (!game) {
        console.log("Juego no encontrado → 404");
        notFound();
    }

    console.log(`Juego encontrado con ${strategy}:`, game.name);

    const formatDate = (timestamp?: number): string => {
        if (!timestamp) return 'Fecha no disponible';
        return new Date(timestamp * 1000).toLocaleDateString('es-ES');
    };

    const getImageUrl = (imageId?: string, type: 'cover' | 'screenshot' = 'cover'): string => {
        if (!imageId) return `/placeholder-${type}.jpg`;
        const size = type === 'cover' ? 't_cover_big' : 't_screenshot_med';
        return `https://images.igdb.com/igdb/image/upload/${size}/${imageId}.jpg`;
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold mb-2">{game.name}</h1>
                    {game.rating && (
                        <div className="text-yellow-400 text-xl">Rating: {game.rating.toFixed(1)}/100</div>
                    )}
                    <p className="text-gray-400 mt-2">
                        Slug: {game.slug} | ID: {game.id} | <span className="text-green-400">Estrategia: {strategy}</span>
                    </p>
                </div>

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

                {game.summary && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Descripción</h2>
                        <p className="text-gray-300 leading-relaxed">{game.summary}</p>
                    </div>
                )}

                {game.screenshots && game.screenshots.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Capturas</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {game.screenshots.slice(0, 3).map((shot, idx) => (
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

                {(!game.summary && !game.screenshots?.length) && (
                    <div className="text-center text-gray-500 py-8">
                        Este juego tiene datos limitados. ¡Prueba con otro!
                    </div>
                )}

                <div className="text-center mt-8">
                    <a href="/" className="text-blue-400 hover:underline">
                        Volver a la búsqueda
                    </a>
                </div>
            </div>
        </div>
    );
}