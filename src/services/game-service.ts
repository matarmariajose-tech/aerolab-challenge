import { Game } from '@/types/game';
import {
    GameSearchStrategy,
    ExactSlugStrategy,
    NameSearchStrategy,
    IDSearchStrategy,
    LocalCacheStrategy
} from '@/lib/game-search-strategies';

export class GameService {
    private strategies: GameSearchStrategy[];
    private cache = new Map<string, { game: Game | null, timestamp: number }>();
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

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
        // Verificar cache primero
        const cached = this.cache.get(slug);
        if (cached && this.isCacheValid(cached.timestamp)) {
            console.log(`🎯 [GameService] Cache hit for: ${slug}`);
            return { game: cached.game, strategy: 'cache' };
        }

        console.log(`🚀 [GameService] Starting search for: ${slug}`);

        // Ejecutar estrategias en secuencia (no en paralelo para evitar rate limits)
        for (const strategy of this.strategies) {
            console.log(`🔄 [GameService] Trying strategy: ${strategy.getName()}`);

            try {
                const game = await strategy.search(slug);

                if (game) {
                    console.log(`✅ [GameService] Found with ${strategy.getName()}: ${game.name}`);

                    // Cachear el resultado
                    this.cache.set(slug, { game, timestamp: Date.now() });

                    return { game, strategy: strategy.getName() };
                }
            } catch (error) {
                console.error(`❌ [GameService] Strategy ${strategy.getName()} failed:`, error);
                // Continuar con la siguiente estrategia
            }
        }

        console.log(`❌ [GameService] No strategy found game for: ${slug}`);

        // Cachear el fallo también (para evitar búsquedas repetidas)
        this.cache.set(slug, { game: null, timestamp: Date.now() });

        return { game: null, strategy: 'none' };
    }

    clearCache(): void {
        this.cache.clear();
        console.log('🧹 [GameService] Cache cleared');
    }

    getCacheStats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Singleton instance
export const gameService = new GameService();