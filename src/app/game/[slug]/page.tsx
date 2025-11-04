import { gameService } from "@/services/game-service";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export const dynamic = 'force-dynamic';


interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return [];
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const { game } = await gameService.getGameBySlug(slug);

    if (!game) {
        return {
            title: "Game Not Found - GameHub",
            description: "The requested game could not be found."
        };
    }

    const getImageUrl = (imageId?: string): string => {
        if (!imageId) return '/og-default.jpg';
        return `https://images.igdb.com/igdb/image/upload/t_cover_big/${imageId}.jpg`;
    };

    return {
        title: `${game.name} - GameHub`,
        description: game.summary?.substring(0, 160) || `Discover ${game.name} on GameHub - Rating: ${game.rating?.toFixed(1) || 'N/A'}/100`,
        openGraph: {
            title: game.name,
            description: game.summary?.substring(0, 160) || `Discover ${game.name} on GameHub`,
            images: [
                {
                    url: getImageUrl(game.cover?.image_id),
                    width: 600,
                    height: 800,
                    alt: `${game.name} cover art`
                }
            ],
            type: 'website',
            siteName: 'GameHub',
        },
        twitter: {
            card: 'summary_large_image',
            title: game.name,
            description: game.summary?.substring(0, 160) || `Discover ${game.name} on GameHub`,
            images: [getImageUrl(game.cover?.image_id)],
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}

export default async function GameDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const { game, strategy } = await gameService.getGameBySlug(slug);

    if (!game) {
        console.log("Juego no encontrado → 404");
        notFound();
    }

    let similarGames: any[] = [];
    try {
        similarGames = await gameService.getSimilarGames(game.id);
    } catch (error) {
        console.log('Similar games feature in development');
    }

    const formatDate = (timestamp?: number): string => {
        if (!timestamp) return 'Fecha no disponible';
        return new Date(timestamp * 1000).toLocaleDateString('es-ES');
    };

    const getYearsSinceRelease = (timestamp?: number): string => {
        if (!timestamp) return '';
        const releaseDate = new Date(timestamp * 1000);
        const now = new Date();
        const years = now.getFullYear() - releaseDate.getFullYear();

        const hasBirthdayPassed = now.getMonth() > releaseDate.getMonth() ||
            (now.getMonth() === releaseDate.getMonth() && now.getDate() >= releaseDate.getDate());

        const actualYears = hasBirthdayPassed ? years : years - 1;

        if (actualYears <= 0) return '(Este año)';
        if (actualYears === 1) return '(Hace 1 año)';
        return `(Hace ${actualYears} años)`;
    };

    const getImageUrl = (imageId?: string, type: 'cover' | 'screenshot' = 'cover'): string => {
        if (!imageId) return `/placeholder-${type}.jpg`;
        const size = type === 'cover' ? 't_cover_big' : 't_screenshot_med';
        return `https://images.igdb.com/igdb/image/upload/${size}/${imageId}.jpg`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-400 to-purple-900 text-white p-3">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 text-center bg-purple-900/30 backdrop-blur-sm rounded-2xl p-4 border border-purple-700/50 shadow-2xl">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-r from-purple-200 to-violet-300 bg-clip-text text-transparent">
                        {game.name}
                    </h1>

                    {game.rating && (
                        <div className="inline-flex items-center gap-2 bg-purple-800/60 px-4 py-2 rounded-full border border-purple-600/50 mb-3">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                            <span className="text-yellow-300 text-base font-semibold">
                                Rating: {game.rating.toFixed(1)}/100
                            </span>
                        </div>
                    )}

                    <div className="flex flex-wrap justify-center items-center gap-2 text-purple-200 text-xs md:text-sm">
                        <span className="bg-purple-800/40 px-2 py-1 rounded">Slug: {game.slug}</span>
                        <span className="bg-purple-800/40 px-2 py-1 rounded">ID: {game.id}</span>
                        <span className="bg-green-600/40 px-2 py-1 rounded border border-green-400/50">
                            Estrategia: {strategy}
                        </span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6 mb-6">
                    <div className="lg:col-span-1">
                        <div className="relative group">
                            <Image
                                src={getImageUrl(game.cover?.image_id)}
                                alt={`${game.name} cover art`}
                                width={300}
                                height={400}
                                className="rounded-xl shadow-lg w-full max-w-xs mx-auto transform group-hover:scale-105 transition-transform duration-300 border-2 border-purple-700/30"
                                priority
                            />
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-purple-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-purple-900/40 backdrop-blur-sm rounded-xl p-4 border border-purple-700/50 shadow-xl">
                            <h2 className="text-xl md:text-2xl font-bold mb-4 text-purple-200 border-b border-purple-600/50 pb-2">
                                Detalles del Juego
                            </h2>

                            <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                    <strong className="text-purple-300 text-sm min-w-28">Lanzamiento:</strong>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-white bg-purple-800/30 px-2 py-1 rounded text-sm">
                                            {formatDate(game.first_release_date)}
                                        </span>
                                        {game.first_release_date && (
                                            <span className="text-purple-200 text-sm italic">
                                                {getYearsSinceRelease(game.first_release_date)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {game.platforms && game.platforms.length > 0 && (
                                    <div className="flex flex-col sm:flex-row sm:items-start gap-1">
                                        <strong className="text-purple-300 text-sm min-w-28">Plataformas:</strong>
                                        <div className="flex flex-wrap gap-1">
                                            {game.platforms.map((p, idx) => (
                                                <span
                                                    key={idx}
                                                    className="bg-purple-700/50 text-purple-100 px-2 py-1 rounded border border-purple-600/30 text-xs"
                                                >
                                                    {p.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {Array.isArray(game.genres) && game.genres.length > 0 && (
                                    <div className="flex flex-col sm:flex-row sm:items-start gap-1">
                                        <strong className="text-purple-300 text-sm min-w-28">Géneros:</strong>
                                        <div className="flex flex-wrap gap-1">
                                            {game.genres.map((g, idx) => (
                                                <span
                                                    key={idx}
                                                    className="bg-violet-600/50 text-violet-100 px-2 py-1 rounded border border-violet-500/30 text-xs"
                                                >
                                                    {g.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {game.summary && (
                            <div className="bg-purple-900/40 backdrop-blur-sm rounded-xl p-4 border border-purple-700/50 shadow-xl">
                                <h2 className="text-xl md:text-2xl font-bold mb-3 text-purple-200 border-b border-purple-600/50 pb-2">
                                    Descripción
                                </h2>
                                <p className="text-purple-100 leading-relaxed text-sm md:text-base">
                                    {game.summary}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {Array.isArray(game.screenshots) && game.screenshots.length > 0 && (
                    <div className="bg-purple-900/40 backdrop-blur-sm rounded-xl p-4 border border-purple-700/50 shadow-xl mb-6">
                        <h2 className="text-xl md:text-2xl font-bold mb-4 text-purple-200 border-b border-purple-600/50 pb-2">
                            Capturas de Pantalla
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {game.screenshots.slice(0, 6).map((shot, idx) => (
                                <div key={idx} className="relative group">
                                    <Image
                                        src={getImageUrl(shot.image_id, 'screenshot')}
                                        alt={`${game.name} screenshot ${idx + 1}`}
                                        width={300}
                                        height={200}
                                        className="rounded-lg shadow-lg w-full h-32 sm:h-40 object-cover transform group-hover:scale-105 transition-transform duration-300 border border-purple-600/30"
                                    />
                                    <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-purple-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-1">
                                        <span className="text-purple-200 text-xs">Captura {idx + 1}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {similarGames.length > 0 && (
                    <div className="bg-purple-900/40 backdrop-blur-sm rounded-xl p-4 border border-purple-700/50 shadow-xl mb-6">
                        <h2 className="text-xl md:text-2xl font-bold mb-4 text-purple-200 border-b border-purple-600/50 pb-2">
                            Juegos Similares
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {similarGames.slice(0, 6).map((similarGame) => (
                                <Link
                                    key={similarGame.id}
                                    href={`/game/${similarGame.slug}`}
                                    className="group"
                                >
                                    <div className="relative bg-purple-800/30 rounded-lg p-2 border border-purple-600/30 hover:border-purple-400/50 transition-all duration-300 group-hover:scale-105">
                                        <Image
                                            src={getImageUrl(similarGame.cover?.image_id)}
                                            alt={similarGame.name}
                                            width={150}
                                            height={200}
                                            className="w-full h-32 object-cover rounded-md mb-2"
                                        />
                                        <h3 className="text-purple-100 text-xs font-semibold line-clamp-2 group-hover:text-white transition-colors">
                                            {similarGame.name}
                                        </h3>
                                        {similarGame.rating && (
                                            <div className="flex items-center gap-1 mt-1">
                                                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                                                <span className="text-yellow-300 text-xs">
                                                    {similarGame.rating.toFixed(0)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {(!game.summary && !(Array.isArray(game.screenshots) && game.screenshots.length > 0)) && (
                    <div className="text-center text-purple-300 py-8 bg-purple-900/30 rounded-xl border border-purple-700/50">
                        <div className="text-3xl mb-3">🎮</div>
                        <p className="text-lg">Este juego tiene datos limitados.</p>
                        <p className="text-base">¡Prueba con otro!</p>
                    </div>
                )}

                <div className="text-center mt-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg border border-purple-500/30 text-sm"
                    >
                        <span>←</span>
                        Volver a la búsqueda
                    </Link>
                </div>
            </div>
        </div>
    );
}