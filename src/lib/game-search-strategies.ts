import { Game } from '@/types/game';

export interface GameSearchStrategy {
    search(identifier: string): Promise<Game | null>;
    getName(): string;
}

const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        return '';
    }

    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    if (process.env.NODE_ENV === 'production') {
        return 'https://aerolab-challenge-beryl-six.vercel.app';
    }

    return 'http://localhost:3000';
};

export class ExactSlugStrategy implements GameSearchStrategy {
    getName() { return 'ExactSlug'; }

    async search(slug: string): Promise<Game | null> {
        try {
            const baseUrl = getBaseUrl();
            const apiUrl = `${baseUrl}/api/games`;

            console.log(`[ExactSlug] Fetching from: ${apiUrl}`);

            const response = await fetch(apiUrl, {
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
            const baseUrl = getBaseUrl();
            const apiUrl = `${baseUrl}/api/games`;

            console.log(`[NameSearch] Fetching from: ${apiUrl}`);

            const response = await fetch(apiUrl, {
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
            const baseUrl = getBaseUrl();
            const apiUrl = `${baseUrl}/api/games`;

            console.log(`[IDSearch] Fetching from: ${apiUrl}`);

            const response = await fetch(apiUrl, {
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