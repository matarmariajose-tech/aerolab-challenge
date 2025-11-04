import { renderHook, act } from '@testing-library/react';
import { useGameStore } from '@/store/useGameStore';

describe('useGameStore', () => {
    it('manages game collection', () => {
        const { result } = renderHook(() => useGameStore());

        const testGame = { id: 1, name: 'Test Game' };

        act(() => result.current.addGame(testGame));
        expect(result.current.games).toHaveLength(1);

        act(() => result.current.removeGame(1));
        expect(result.current.games).toHaveLength(0);
    });
});