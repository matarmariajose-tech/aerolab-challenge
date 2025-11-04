import { Game } from '../types/game';

export interface GameSearchStrategy {
    search(identifier: string): Promise<Game | null>;
    getName(): string;
}

const makeServerRequest = async (url: string, options: any) => {
    const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://aerolab-challenge-beryl-six.vercel.app'
        : 'http://localhost:3000';

    const fullUrl = `${baseUrl}${url}`;
    console.log(`[Server Fetch] URL: ${fullUrl}`);

    return fetch(fullUrl, options);
};

export class ExactSlugStrategy implements GameSearchStrategy {
    getName() { return 'ExactSlug'; }

    async search(slug: string): Promise<Game | null> {
        try {
            console.log(`[ExactSlug] Searching for: ${slug}`);

            const response = await makeServerRequest('/api/games', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'slug', slug })
            });

            if (!response.ok) {
                console.log(`[ExactSlug] Response not OK: ${response.status}`);
                return null;
            }

            const game = await response.json();
            return game;
        } catch (error) {
            console.error(`[ExactSlug] Error:`, error);
            return null;
        }
    }
}

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
            console.log(`[NameSearch] Searching for: ${slug} -> "${name}"`);

            const response = await makeServerRequest('/api/games', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'search', query: name, limit: 1 })
            });

            if (!response.ok) {
                console.log(`[NameSearch] Response not OK: ${response.status}`);
                return null;
            }

            const games = await response.json();
            const game = games[0] || null;

            return game;
        } catch (error) {
            console.error(`[NameSearch] Error:`, error);
            return null;
        }
    }
}

export class IDSearchStrategy implements GameSearchStrategy {
    getName() { return 'IDSearch'; }

    async search(slug: string): Promise<Game | null> {
        try {
            const match = slug.match(/^game-(\d+)$/);
            if (!match) return null;

            const gameId = match[1];
            console.log(`[IDSearch] Searching for ID: ${gameId}`);

            const response = await makeServerRequest('/api/games', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'details', gameId })
            });

            if (!response.ok) {
                console.log(`[IDSearch] Response not OK: ${response.status}`);
                return null;
            }

            const game = await response.json();
            return game;
        } catch (error) {
            console.error(`[IDSearch] Error:`, error);
            return null;
        }
    }
}

export class LocalCacheStrategy implements GameSearchStrategy {
    getName() { return 'LocalCache'; }

    async search(slug: string): Promise<Game | null> {
        try {
            console.log(`[LocalCache] Searching in local collection for: ${slug}`);
            return null;
        } catch (error) {
            console.error(`[LocalCache] Error:`, error);
            return null;
        }
    }
}