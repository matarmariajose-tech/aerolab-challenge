import { NextResponse } from "next/server";

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

let accessToken: string | null = null;
let tokenExpiry: number = 0;

const requestQueue = new Map<string, { count: number; lastRequest: number }>();
const RATE_LIMIT_WINDOW = 60000;
const MAX_REQUESTS_PER_WINDOW = 50;

class IGDBService {
    private async getAccessToken(): Promise<string> {
        if (accessToken && Date.now() < tokenExpiry) {
            return accessToken!;
        }

        const response = await fetch("https://id.twitch.tv/oauth2/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: "client_credentials",
            }),
        });

        if (!response.ok) throw new Error(`Token request failed: ${response.status}`);

        const data = await response.json();
        accessToken = data.access_token;
        tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
        return accessToken!;
    }

    private checkRateLimit(identifier: string): boolean {
        const now = Date.now();
        const userRequests = requestQueue.get(identifier) || { count: 0, lastRequest: now };

        if (now - userRequests.lastRequest > RATE_LIMIT_WINDOW) {
            userRequests.count = 0;
        }

        if (userRequests.count >= MAX_REQUESTS_PER_WINDOW) return false;

        userRequests.count++;
        userRequests.lastRequest = now;
        requestQueue.set(identifier, userRequests);
        return true;
    }

    private async makeIGDBRequest(body: string, identifier: string = 'default') {
        if (!this.checkRateLimit(identifier)) {
            throw new Error('Rate limit exceeded');
        }

        const token = await this.getAccessToken();

        const response = await fetch("https://api.igdb.com/v4/games", {
            method: "POST",
            headers: {
                "Client-ID": CLIENT_ID!,
                "Authorization": `Bearer ${token}`,
                "Content-Type": "text/plain",
            },
            body,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`IGDB API error ${response.status}:`, errorText);
            throw new Error(`IGDB API error: ${response.status}`);
        }

        return await response.json();
    }

    async getPopularGames(limit: number = 30) {
        const body = `
            fields name, slug, cover.image_id, first_release_date, rating, platforms.name, summary, total_rating_count;
            where cover != null & total_rating_count > 10;
            sort total_rating_count desc;
            limit ${limit};
        `;

        const games = await this.makeIGDBRequest(body, 'popular');
        return games.map((game: any) => ({
            ...game,
            slug: game.slug || `game-${game.id}`,
            cover: game.cover ? {
                image_id: game.cover.image_id,
                url: `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
            } : null
        }));
    }

    async searchGames(query: string, limit: number = 30) {
        if (!query || query.trim().length === 0) {
            return this.getPopularGames(limit);
        }

        // Búsqueda principal SIN sort
        const searchBody = `
        search "${query}";
        fields name, slug, cover.image_id, first_release_date, rating, platforms.name, summary, total_rating_count;
        where cover != null & total_rating_count > 10;
        limit ${limit};
    `;

        let games = await this.makeIGDBRequest(searchBody, `search:${query}`);

        // Fallback con fuzzy match SIN sort
        if (games.length === 0) {
            const fallbackBody = `
            fields name, slug, cover.image_id, first_release_date, rating, platforms.name, summary, total_rating_count;
            where name ~ *"${query}"* & cover != null & total_rating_count > 10;
            limit ${limit};
        `;
            games = await this.makeIGDBRequest(fallbackBody, `fallback:${query}`);
        }

        // Ordenar localmente por total_rating_count
        games.sort((a: any, b: any) => (b.total_rating_count || 0) - (a.total_rating_count || 0));

        return games.map((game: any) => ({
            ...game,
            slug: game.slug || `game-${game.id}`,
            cover: game.cover ? {
                image_id: game.cover.image_id,
                url: `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
            } : null
        }));
    }

    async getGameDetails(gameId: string) {
        const body = `
            fields name, slug, cover.image_id, first_release_date, rating, platforms.name, summary,
                   screenshots.image_id, similar_games.name, similar_games.slug, 
                   similar_games.cover.image_id, similar_games.first_release_date, similar_games.rating,
                   genres.name, involved_companies.company.name, involved_companies.developer,
                   involved_companies.publisher, websites.category, websites.url, total_rating_count;
            where id = ${gameId};
        `;

        const games = await this.makeIGDBRequest(body, `details:${gameId}`);
        const game = games[0] || null;

        if (game && !game.slug) {
            game.slug = `game-${game.id}`;
        }

        if (game?.cover) {
            game.cover = {
                image_id: game.cover.image_id,
                url: `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
            };
        }

        return game;
    }

    async getGameBySlug(slug: string) {
        console.log(`Processing slug: "${slug}"`);

        const exactBody = `
            fields name, slug, cover.image_id, first_release_date, rating, platforms.name, summary,
                   screenshots.image_id, similar_games.name, similar_games.slug, 
                   similar_games.cover.image_id, similar_games.first_release_date, similar_games.rating,
                   genres.name, involved_companies.company.name, involved_companies.developer,
                   involved_companies.publisher, websites.category, websites.url, total_rating_count;
            where slug = "${slug}";
        `;

        let games = await this.makeIGDBRequest(exactBody, `slug:${slug}`);

        if (games.length > 0) {
            const game = games[0];
            if (game.cover) {
                game.cover = {
                    image_id: game.cover.image_id,
                    url: `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
                };
            }
            console.log(`Found game by exact slug: ${game.name}`);
            return game;
        }

        const nameFromSlug = this.slugToName(slug);
        const searchBody = `
            search "${nameFromSlug}";
            fields name, slug, cover.image_id, first_release_date, rating, platforms.name, summary,
                   screenshots.image_id, similar_games.name, similar_games.slug, 
                   similar_games.cover.image_id, similar_games.first_release_date, similar_games.rating,
                   genres.name, involved_companies.company.name, involved_companies.developer,
                   involved_companies.publisher, total_rating_count;
            where cover != null;
            limit 20;
        `;

        const searchResults = await this.makeIGDBRequest(searchBody, `search:${nameFromSlug}`);

        if (searchResults.length > 0) {
            const best = this.findBestMatch(searchResults, nameFromSlug, slug);
            if (best?.cover) {
                best.cover = {
                    image_id: best.cover.image_id,
                    url: `https://images.igdb.com/igdb/image/upload/t_cover_big/${best.cover.image_id}.jpg`
                };
            }
            return best;
        }

        const idMatch = slug.match(/^game-(\d+)$/);
        if (idMatch) {
            return await this.getGameDetails(idMatch[1]);
        }

        return null;
    }

    private slugToName(slug: string): string {
        const romanMap: Record<string, string> = {
            'i': 'I', 'ii': 'II', 'iii': 'III', 'iv': 'IV', 'v': 'V',
            'vi': 'VI', 'vii': 'VII', 'viii': 'VIII', 'ix': 'IX', 'x': 'X',
            'xi': 'XI', 'xii': 'XII'
        };

        return slug
            .split('-')
            .map(word => romanMap[word] || word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
            .replace(/\bAll Stars\b/gi, 'All-Stars');
    }

    private findBestMatch(games: any[], name: string, originalSlug: string) {
        if (games.length === 0) return null;

        return games.reduce((best, current) => {
            const bestScore = best ? this.calculateMatchScore(best, name, originalSlug) : -1;
            const currentScore = this.calculateMatchScore(current, name, originalSlug);
            return currentScore > bestScore ? current : best;
        });
    }

    private calculateMatchScore(game: any, name: string, originalSlug: string): number {
        if (!game) return -1;

        let score = 0;
        const gameName = game.name.toLowerCase();
        const searchName = name.toLowerCase();

        if (gameName === searchName) score += 100;
        if (gameName.includes(searchName)) score += 50;
        if (game.slug === originalSlug) score += 200;
        if (game.rating) score += game.rating / 10;

        if (game.first_release_date) {
            const yearsAgo = (Date.now() / 1000 - game.first_release_date) / (365 * 24 * 60 * 60);
            score += Math.max(0, 20 - yearsAgo);
        }

        return score;
    }
}

const igdbService = new IGDBService();
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;
const POPULAR_CACHE_TTL = 30 * 60 * 1000;

function getCacheKey(action: string, identifier: string): string {
    return `${action}:${identifier}`;
}

function getCachedResponse(cacheKey: string, customTTL?: number) {
    const cached = responseCache.get(cacheKey);
    const ttl = customTTL || CACHE_TTL;

    if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.data;
    }
    return null;
}

function setCachedResponse(cacheKey: string, data: any) {
    responseCache.set(cacheKey, { data, timestamp: Date.now() });
}

export async function POST(request: Request) {
    const startTime = Date.now();

    try {
        const { query, action, gameId, slug, limit = 30 } = await request.json();

        if (!action) {
            return NextResponse.json({ error: "Action is required" }, { status: 400 });
        }

        let result;
        let cacheKey;

        switch (action) {
            case "popular":
                cacheKey = getCacheKey('popular', `limit-${limit}`);
                result = getCachedResponse(cacheKey, POPULAR_CACHE_TTL);
                if (!result) {
                    result = await igdbService.getPopularGames(limit);
                    setCachedResponse(cacheKey, result);
                }
                break;

            case "search":
                if (query && query.length < 2) {
                    return NextResponse.json({ error: "Query must be at least 2 characters" }, { status: 400 });
                }

                if (!query || query.trim() === '') {
                    cacheKey = getCacheKey('popular', 'default');
                    result = getCachedResponse(cacheKey, POPULAR_CACHE_TTL);
                    if (!result) {
                        result = await igdbService.getPopularGames(30);
                        setCachedResponse(cacheKey, result);
                    }
                } else {
                    cacheKey = getCacheKey('search', query);
                    result = getCachedResponse(cacheKey);
                    if (!result) {
                        result = await igdbService.searchGames(query, limit);
                        setCachedResponse(cacheKey, result);
                    }
                }
                break;

            case "details":
                if (!gameId) {
                    return NextResponse.json({ error: "Game ID is required" }, { status: 400 });
                }

                cacheKey = getCacheKey('details', gameId);
                result = getCachedResponse(cacheKey);
                if (!result) {
                    result = await igdbService.getGameDetails(gameId);
                    setCachedResponse(cacheKey, result);
                }
                break;

            case "slug":
                if (!slug) {
                    return NextResponse.json({ error: "Slug is required" }, { status: 400 });
                }

                cacheKey = getCacheKey('slug', slug);
                result = getCachedResponse(cacheKey);
                if (!result) {
                    result = await igdbService.getGameBySlug(slug);
                    setCachedResponse(cacheKey, result);
                }
                break;

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        console.log(`${action} completed in ${Date.now() - startTime}ms`);
        return NextResponse.json(result);

    } catch (error) {
        console.error(`Error after ${Date.now() - startTime}ms:`, error);

        if (error instanceof Error) {
            if (error.message.includes('Rate limit')) {
                return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
            }
            if (error.message.includes('IGDB API error')) {
                return NextResponse.json({ error: "Game database unavailable" }, { status: 503 });
            }
        }

        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const gameId = searchParams.get('gameId');
    const action = searchParams.get('action');
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '30');

    if (!slug && !gameId && !action && !query) {
        return NextResponse.json({
            status: "healthy",
            cacheSize: responseCache.size,
        });
    }

    try {
        let result;
        let cacheKey;

        if (slug) {
            cacheKey = getCacheKey('slug', slug);
            result = getCachedResponse(cacheKey);
            if (!result) {
                result = await igdbService.getGameBySlug(slug);
                setCachedResponse(cacheKey, result);
            }
        } else if (gameId) {
            cacheKey = getCacheKey('details', gameId);
            result = getCachedResponse(cacheKey);
            if (!result) {
                result = await igdbService.getGameDetails(gameId);
                setCachedResponse(cacheKey, result);
            }
        } else if (action === 'search') {
            if (query && query.length < 2) {
                return NextResponse.json({ error: "Query must be at least 2 characters" }, { status: 400 });
            }

            if (!query || query.trim() === '') {
                cacheKey = getCacheKey('popular', 'default');
                result = getCachedResponse(cacheKey, POPULAR_CACHE_TTL);
                if (!result) {
                    result = await igdbService.getPopularGames(limit);
                    setCachedResponse(cacheKey, result);
                }
            } else {
                cacheKey = getCacheKey('search', query);
                result = getCachedResponse(cacheKey);
                if (!result) {
                    result = await igdbService.searchGames(query, limit);
                    setCachedResponse(cacheKey, result);
                }
            }
        } else if (action === 'popular') {
            cacheKey = getCacheKey('popular', `limit-${limit}`);
            result = getCachedResponse(cacheKey, POPULAR_CACHE_TTL);
            if (!result) {
                result = await igdbService.getPopularGames(limit);
                setCachedResponse(cacheKey, result);
            }
        } else {
            return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
        }

        if (!result) {
            return NextResponse.json({ error: "Game not found" }, { status: 404 });
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error('GET error:', error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}