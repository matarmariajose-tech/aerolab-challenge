import { Game } from '@/types/game';
import {
    GameSearchStrategy,
    ExactSlugStrategy,
    NameSearchStrategy,
    IDSearchStrategy,
    LocalCacheStrategy
} from '@/lib/game-search-strategies';

export class GameService {
    getGamesByGenre(genreIds: any, id: number, arg2: number): any[] | PromiseLike<any[]> {
        throw new Error("Method not implemented.");
    }
    private strategies: GameSearchStrategy[];
    private cache = new Map<string, { game: Game | null, timestamp: number }>();
    private readonly CACHE_TTL = 5 * 60 * 1000;

    constructor() {
        this.strategies = [
            new ExactSlugStrategy(),
            new IDSearchStrategy(),
            new NameSearchStrategy(),
            new LocalCacheStrategy()
        ];
    }

    private isCacheValid(timestamp: number): boolean {
        return Date.now() - timestamp < this.CACHE_TTL;
    }

    async getGameBySlug(slug: string): Promise<{ game: Game | null, strategy: string }> {
        const cached = this.cache.get(slug);
        if (cached && this.isCacheValid(cached.timestamp)) {
            console.log(`Cache hit for: ${slug}`);
            return { game: cached.game, strategy: 'cache' };
        }

        for (const strategy of this.strategies) {
            console.log(`Trying strategy: ${strategy.getName()}`);
            try {
                const game = await strategy.search(slug);
                if (game) {
                    this.cache.set(slug, { game, timestamp: Date.now() });
                    return { game, strategy: strategy.getName() };
                }
            } catch (error) {
                console.error(`Strategy ${strategy.getName()} failed:`, error);
            }
        }

        this.cache.set(slug, { game: null, timestamp: Date.now() });
        return { game: null, strategy: 'none' };
    }

    async getSimilarGames(gameId: number, limit: number = 6): Promise<Game[]> {
        try {

            const response = await fetch('/api/games', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'similar',
                    gameId,
                    limit
                }),
            });

            if (response.ok) {
                const similarGames = await response.json();
                console.log(`✅ Found ${similarGames?.length || 0} similar games`);
                return Array.isArray(similarGames) ? similarGames : [];
            }

            return [];

        } catch (error) {
            console.error('Error fetching similar games:', error);
            return [];
        }
    }

    clearCache(): void {
        this.cache.clear();
    }
}

export const gameService = new GameService();