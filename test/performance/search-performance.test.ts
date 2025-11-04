describe('Performance Considerations - Senior Level', () => {
    it('should handle large collections efficiently', () => {
        const largeCollection = Array.from({ length: 1000 }, (_, i) => ({
            id: i + 1,
            name: `Game ${i + 1}`,
            rating: Math.floor(Math.random() * 100)
        }));

        const startTime = Date.now();
        const sorted = [...largeCollection].sort((a, b) => b.rating - a.rating);
        const endTime = Date.now();

        expect(endTime - startTime).toBeLessThan(100);
        expect(sorted[0].rating).toBeGreaterThanOrEqual(sorted[1].rating);
    });

    it('should optimize search operations', () => {
        const games = Array.from({ length: 500 }, (_, i) => ({
            id: i + 1,
            name: `Test Game ${i + 1}`,
            platforms: ['PC', 'PS5']
        }));

        const searchTerm = 'Game 1';
        const startTime = Date.now();

        const results = games.filter(game =>
            game.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const endTime = Date.now();

        expect(endTime - startTime).toBeLessThan(50);
        expect(results.length).toBeGreaterThan(0);
    });
});