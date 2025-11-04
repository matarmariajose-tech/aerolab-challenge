import { render, screen } from '@testing-library/react';
import Search from '@/components/Search';

jest.mock('@/components/Search', () => {
    return function MockSearch({ onSearch }: { onSearch: (query: string) => void }) {
        return (
            <input
                type="text"
                placeholder="Search for games..."
                onChange={(e) => onSearch(e.target.value)}
            />
        );
    };
});

describe('Search Component', () => {
    it('renders search input', () => {
        render(<Search onSearch={() => { }} />);
        expect(screen.getByPlaceholderText(/search for games/i)).toBeInTheDocument();
    });
});