export const formatRating = (rating: number): string => {
    if (!rating) return 'N/A';
    return `${Math.round(rating)}/100`;
};

export const getReleaseYear = (timestamp?: number): string => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp * 1000).getFullYear().toString();
};

describe('Game Utilities', () => {
    describe('formatRating', () => {
        it('formats rating correctly', () => {
            expect(formatRating(85.5)).toBe('86/100');
            expect(formatRating(90)).toBe('90/100');
        });

        it('handles missing rating', () => {
            expect(formatRating(0)).toBe('N/A');
        });
    });

    describe('getReleaseYear', () => {
        it('extracts year from timestamp', () => {
            expect(getReleaseYear(1577836800)).toBe('2020');
        });

        it('handles missing timestamp', () => {
            expect(getReleaseYear(undefined)).toBe('Unknown');
        });
    });
});