import type { Game } from '../types/game';

const API_BASE = '/api/games';

export async function getPopularGames(limit: number = 50): Promise<Game[]> {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'popular', limit }),
    });

    if (!response.ok) throw new Error(`Popular games failed: ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error('Error fetching popular games:', error);
    return [];
  }
}

export async function searchGames(query: string, limit: number = 50): Promise<Game[]> {
  if (!query || !query.trim()) {
    return getPopularGames(limit);
  }

  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'search', query, limit }),
    });

    if (!response.ok) throw new Error(`Search failed: ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

export async function getGameDetails(gameId: string): Promise<Game | null> {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'details', gameId }),
    });

    if (!response.ok) throw new Error(`Details failed: ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error('Game details error:', error);
    return null;
  }
}

export async function getGameBySlug(slug: string): Promise<Game | null> {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'slug', slug }),
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Slug lookup failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Game by slug error:', error);
    return null;
  }
}

export function getCoverImageUrl(imageId: string, size: 'thumb' | 'cover_small' | 'cover_big' = 'cover_big'): string {
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
}

export function getScreenshotUrl(imageId: string, size: 'screenshot_med' | 'screenshot_big' | 'screenshot_huge' = 'screenshot_big'): string {
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
}

export function formatReleaseDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}