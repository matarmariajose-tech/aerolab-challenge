import { NextResponse } from "next/server";

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

// Cache para access token con expiración
let accessToken: string | null = null;
let tokenExpiry: number = 0;

// Rate limiting
const requestQueue = new Map<string, { count: number; lastRequest: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 50;

class IGDBService {
    private async getAccessToken(): Promise<string> {
        // Verificar si el token actual es válido (expira en 1 hora normalmente)
        if (accessToken && Date.now() < tokenExpiry) {
            return accessToken!;
        }

        try {
            console.log('🔄 Renewing IGDB access token');

            const response = await fetch("https://id.twitch.tv/oauth2/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    grant_type: "client_credentials",
                }),
            });

            if (!response.ok) {
                throw new Error(`Token request failed: ${response.status}`);
            }

            const data = await response.json();
            accessToken = data.access_token;
            tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1 minuto de margen

            console.log('✅ New access token acquired');
            return accessToken!;
        } catch (error) {
            console.error('❌ Failed to get access token:', error);
            throw error;
        }
    }

    private checkRateLimit(identifier: string): boolean {
        const now = Date.now();
        const userRequests = requestQueue.get(identifier) || { count: 0, lastRequest: now };

        // Limpiar requests antiguos
        if (now - userRequests.lastRequest > RATE_LIMIT_WINDOW) {
            userRequests.count = 0;
        }

        if (userRequests.count >= MAX_REQUESTS_PER_WINDOW) {
            return false;
        }

        userRequests.count++;
        userRequests.lastRequest = now;
        requestQueue.set(identifier, userRequests);

        return true;
    }

    private async makeIGDBRequest(body: string, identifier: string = 'default') {
        // Rate limiting
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
            throw new Error(`IGDB API error: ${response.status} - ${errorText}`);
        }

        return await response.json();
    }

    async searchGames(query: string, limit: number = 20) {
        const body = `
      search "${query}";
      fields name, slug, cover.image_id, first_release_date, rating, platforms.name, summary;
      where cover != null & category = 0;
      limit ${limit};
    `;

        const games = await this.makeIGDBRequest(body, `search:${query}`);

        return games.map((game: any) => ({
            ...game,
            slug: game.slug || `game-${game.id}`
        }));
    }

    async getGameDetails(gameId: string) {
        const body = `
      fields name, slug, cover.image_id, first_release_date, rating, platforms.name, summary,
             screenshots.image_id, similar_games.name, similar_games.slug, 
             similar_games.cover.image_id, similar_games.first_release_date, similar_games.rating,
             genres.name, involved_companies.company.name, involved_companies.developer,
             involved_companies.publisher, websites.category, websites.url;
      where id = ${gameId};
    `;

        const games = await this.makeIGDBRequest(body, `details:${gameId}`);
        const game = games[0] || null;

        if (game && !game.slug) {
            game.slug = `game-${game.id}`;
        }

        return game;
    }

    async getGameBySlug(slug: string) {
        console.log(`🔍 Processing slug: "${slug}"`); // Debug: qué slug llega

        // Strategy 1: Búsqueda exacta por slug (sin filtro de category para permitir bundles/compilaciones)
        const exactBody = `
      fields name, slug, cover.image_id, first_release_date, rating, platforms.name, summary,
             screenshots.image_id, similar_games.name, similar_games.slug, 
             similar_games.cover.image_id, similar_games.first_release_date, similar_games.rating,
             genres.name;
      where slug = "${slug}";
    `;

        let games = await this.makeIGDBRequest(exactBody, `slug:${slug}`);
        console.log(`📊 Exact slug results: ${games.length}`); // Debug: cuántos encontró exacto

        if (games.length > 0) {
            console.log(`✅ Found game by exact slug: ${games[0].name}`);
            return games[0];
        }

        // Strategy 2: Búsqueda fuzzy por nombre (con similitud 0.8 para tolerar variaciones, sin category filter)
        console.log(`🔍 No exact match for slug "${slug}", trying fuzzy name search...`);

        const nameFromSlug = this.slugToName(slug);
        console.log(`🔤 Converted name: "${nameFromSlug}"`); // Debug: nombre convertido

        const searchBody = `
      search "${nameFromSlug}~0.8";
      fields name, slug, cover.image_id, first_release_date, rating, platforms.name, summary,
             screenshots.image_id, similar_games.name, similar_games.slug, 
             similar_games.cover.image_id, similar_games.first_release_date, similar_games.rating,
             genres.name;
      where cover != null;
      limit 10;
    `;

        const searchResults = await this.makeIGDBRequest(searchBody, `search:${nameFromSlug}`);
        console.log(`📊 Fuzzy search results: ${searchResults.length}`); // Debug: cuántos encontró fuzzy

        if (searchResults.length > 0) {
            // Encontrar la mejor coincidencia
            const bestMatch = this.findBestMatch(searchResults, nameFromSlug, slug);
            console.log(`🎯 Best match: ${bestMatch?.name} (score: ${this.calculateMatchScore(bestMatch, nameFromSlug, slug)})`);
            return bestMatch;
        }

        // Strategy 3: Si el slug es "game-123", extraer ID
        const idMatch = slug.match(/^game-(\d+)$/);
        if (idMatch) {
            console.log(`🔍 Slug appears to be generated, extracting ID: ${idMatch[1]}`);
            return await this.getGameDetails(idMatch[1]);
        }

        console.log(`❌ No game found for slug: ${slug}`);
        return null;
    }

    private slugToName(slug: string): string {
        let title = slug
            .split('-')
            .map(word => {
                // Manejar numerales romanos comunes en juegos
                const romanMap: { [key: string]: string } = {
                    'i': 'I',
                    'ii': 'II',
                    'iii': 'III',
                    'iv': 'IV',
                    'v': 'V',
                    'vi': 'VI',
                    'vii': 'VII',
                    'viii': 'VIII',
                    'ix': 'IX',
                    'x': 'X',
                    'xi': 'XI',
                    'xii': 'XII',
                    // Agrega más si necesitas, ej. 'xiii': 'XIII'
                };
                if (romanMap[word]) return romanMap[word];
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(' ');

        // Post-procesamiento para preservar hyphens en nombres compuestos comunes (ej. All-Stars)
        title = title.replace(/\bAll Stars\b/gi, 'All-Stars');
        // Agrega más replacements si encuentras otros casos, ej. title = title.replace(/\bStreet Fighter\b/gi, 'Street Fighter'); pero este ya está bien

        return title;
    }

    private findBestMatch(games: any[], name: string, originalSlug: string) {
        // Inicializar con el primer game si existe, para evitar undefined en reduce
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

        // Coincidencia exacta de nombre
        if (game.name.toLowerCase() === name.toLowerCase()) {
            score += 100;
        }

        // El nombre contiene el término de búsqueda
        if (game.name.toLowerCase().includes(name.toLowerCase())) {
            score += 50;
        }

        // Coincidencia de slug
        if (game.slug === originalSlug) {
            score += 200;
        }

        // Rating alto
        if (game.rating) {
            score += game.rating / 10;
        }

        // Juego más reciente
        if (game.first_release_date) {
            const yearsAgo = (Date.now() / 1000 - game.first_release_date) / (365 * 24 * 60 * 60);
            score += Math.max(0, 20 - yearsAgo); // Más puntos para juegos más recientes
        }

        return score;
    }
}

// Instancia singleton del servicio
const igdbService = new IGDBService();

// Cache para respuestas de la API
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

function getCacheKey(action: string, identifier: string): string {
    return `${action}:${identifier}`;
}

function getCachedResponse(cacheKey: string) {
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`🎯 Cache hit for: ${cacheKey}`);
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
        const { query, action, gameId, slug } = await request.json();

        console.log("🎮 API Route - Request:", { query, action, gameId, slug });

        // Validación de entrada
        if (!action) {
            return NextResponse.json(
                { error: "Action is required" },
                { status: 400 }
            );
        }

        let result;
        let cacheKey;

        switch (action) {
            case "search":
                if (!query || query.length < 2) {
                    return NextResponse.json(
                        { error: "Query must be at least 2 characters" },
                        { status: 400 }
                    );
                }

                cacheKey = getCacheKey('search', query);
                result = getCachedResponse(cacheKey) || await igdbService.searchGames(query);
                if (!getCachedResponse(cacheKey)) setCachedResponse(cacheKey, result);
                break;

            case "details":
                if (!gameId) {
                    return NextResponse.json(
                        { error: "Game ID is required" },
                        { status: 400 }
                    );
                }

                cacheKey = getCacheKey('details', gameId);
                result = getCachedResponse(cacheKey) || await igdbService.getGameDetails(gameId);
                if (!getCachedResponse(cacheKey)) setCachedResponse(cacheKey, result);
                break;

            case "slug":
                if (!slug) {
                    return NextResponse.json(
                        { error: "Slug is required" },
                        { status: 400 }
                    );
                }

                cacheKey = getCacheKey('slug', slug);
                result = getCachedResponse(cacheKey) || await igdbService.getGameBySlug(slug);
                if (!getCachedResponse(cacheKey)) setCachedResponse(cacheKey, result);
                break;

            default:
                return NextResponse.json(
                    { error: "Invalid action" },
                    { status: 400 }
                );
        }

        const responseTime = Date.now() - startTime;
        console.log(`⏱️ API ${action} completed in ${responseTime}ms`);

        return NextResponse.json(result);

    } catch (error) {
        const responseTime = Date.now() - startTime;
        console.error(`💥 API route error after ${responseTime}ms:`, error);

        // Manejo de errores específicos
        if (error instanceof Error) {
            if (error.message.includes('Rate limit')) {
                return NextResponse.json(
                    { error: "Rate limit exceeded. Please try again later." },
                    { status: 429 }
                );
            }

            if (error.message.includes('IGDB API error')) {
                return NextResponse.json(
                    { error: "Game database temporarily unavailable" },
                    { status: 503 }
                );
            }
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Endpoint para monitoreo/health check
export async function GET() {
    return NextResponse.json({
        status: "healthy",
        cacheSize: responseCache.size,
        rateLimitStats: Object.fromEntries(requestQueue)
    });
}