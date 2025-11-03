import { Game } from '@/types/game';

export interface GameSearchStrategy {
    search(identifier: string): Promise<Game | null>;
    getName(): string;
}

// Estrategia 1: Búsqueda exacta por slug
export class ExactSlugStrategy implements GameSearchStrategy {
    getName() { return 'ExactSlug'; }

    async search(slug: string): Promise<Game | null> {
        try {
            console.log(`🔍 [ExactSlug] Searching for slug: ${slug}`);

            const response = await fetch('http://localhost:3000/api/games', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'slug', slug })
            });

            if (!response.ok) return null;

            const game = await response.json();
            console.log(`✅ [ExactSlug] Found:`, game?.name);
            return game;
        } catch (error) {
            console.error(`❌ [ExactSlug] Error:`, error);
            return null;
        }
    }
}

// Estrategia 2: Búsqueda por nombre (convertir slug a nombre)
export class NameSearchStrategy implements GameSearchStrategy {
    getName() { return 'NameSearch'; }

    private slugToName(slug: string): string {
        return slug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    async search(slug: string): Promise<Game | null> {
        try {
            const name = this.slugToName(slug);
            console.log(`🔍 [NameSearch] Converting slug to name: "${slug}" -> "${name}"`);

            const response = await fetch('http://localhost:3000/api/games', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'search', query: name, limit: 1 })
            });

            if (!response.ok) return null;

            const games = await response.json();
            const game = games[0] || null;

            console.log(`✅ [NameSearch] Found:`, game?.name);
            return game;
        } catch (error) {
            console.error(`❌ [NameSearch] Error:`, error);
            return null;
        }
    }
}

// Estrategia 3: Búsqueda por ID (si el slug es "game-123")
export class IDSearchStrategy implements GameSearchStrategy {
    getName() { return 'IDSearch'; }

    async search(slug: string): Promise<Game | null> {
        try {
            // Verificar si el slug tiene formato "game-123"
            const match = slug.match(/^game-(\d+)$/);
            if (!match) return null;

            const gameId = match[1];
            console.log(`🔍 [IDSearch] Extracted ID from slug: ${gameId}`);

            const response = await fetch('http://localhost:3000/api/games', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'details', gameId })
            });

            if (!response.ok) return null;

            const game = await response.json();
            console.log(`✅ [IDSearch] Found:`, game?.name);
            return game;
        } catch (error) {
            console.error(`❌ [IDSearch] Error:`, error);
            return null;
        }
    }
}

// Estrategia 4: Buscar en colección local
export class LocalCacheStrategy implements GameSearchStrategy {
    getName() { return 'LocalCache'; }

    async search(slug: string): Promise<Game | null> {
        try {
            console.log(`🔍 [LocalCache] Searching in local collection for: ${slug}`);

            // Esto se ejecuta en el cliente, así que necesitamos un approach diferente
            // Para server components, esta estrategia será menos efectiva
            return null;
        } catch (error) {
            console.error(`❌ [LocalCache] Error:`, error);
            return null;
        }
    }
}