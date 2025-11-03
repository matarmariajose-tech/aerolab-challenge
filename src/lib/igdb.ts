import type { Game } from '../types/game';

export async function searchGames(query: string, limit: number = 20): Promise<Game[]> {
  if (!query.trim()) return [];

  try {
    const response = await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'search', query, limit }),
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();
    console.log('🔍 Search results:', data.length, 'games'); // Debug extra
    return data;
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}

export async function getGameDetails(gameId: string): Promise<Game | null> {
  try {
    const response = await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'details', gameId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Details failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📋 Game details for ID', gameId, ':', data?.name || 'null'); // Debug extra
    return data;
  } catch (error) {
    console.error("Game details error:", error);
    return null;
  }
}

export async function getGameBySlug(slug: string): Promise<Game | null> {
  console.log('🔗 getGameBySlug called with:', slug); // Debug: confirma que se llama

  try {
    const response = await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'slug', slug }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Slug lookup failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📦 API Response for slug:', slug, ':', data?.name || 'null'); // Debug: qué devuelve

    return data;
  } catch (error) {
    console.error("Game by slug error:", error);
    return null;
  }
}