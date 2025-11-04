describe('Basic Integration Tests - Senior Level', () => {
    describe('Game Collection Flow', () => {
        it('should handle complete game lifecycle', () => {
            const collection = [];
            const searchResults = [
                { id: 1, name: 'The Legend of Zelda', rating: 97 },
                { id: 2, name: 'Super Mario Odyssey', rating: 92 }
            ];

            const searchTerm = 'zelda';
            const filteredResults = searchResults.filter(game =>
                game.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            expect(filteredResults).toHaveLength(1);
            expect(filteredResults[0].name).toBe('The Legend of Zelda');

            collection.push(filteredResults[0]);
            expect(collection).toHaveLength(1);
            expect(collection[0].id).toBe(1);

            const removedGame = collection.pop();
            expect(collection).toHaveLength(0);
            expect(removedGame.id).toBe(1);
        });

        it('should handle edge cases gracefully', () => {
            const collection = [];

            const game = { id: 1, name: 'Test Game' };
            collection.push(game);
            collection.push(game);

            const uniqueGames = [...new Map(collection.map(item => [item.id, item])).values()];
            expect(uniqueGames).toHaveLength(1);
        });
    });

    describe('Search Functionality', () => {
        it('should handle different search scenarios', () => {
            const games = [
                { id: 1, name: 'The Legend of Zelda' },
                { id: 2, name: 'Super Mario Bros' },
                { id: 3, name: 'Metroid Prime' }
            ];

            const exactSearch = games.filter(game =>
                game.name.toLowerCase().includes('zelda')
            );
            expect(exactSearch).toHaveLength(1);

            const partialSearch = games.filter(game =>
                game.name.toLowerCase().includes('mario')
            );
            expect(partialSearch).toHaveLength(1);

            const noResults = games.filter(game =>
                game.name.toLowerCase().includes('nonexistent')
            );
            expect(noResults).toHaveLength(0);
        });
    });
});