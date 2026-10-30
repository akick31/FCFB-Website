/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import StadiumPage from './StadiumPage';
import { getStadium, getStadiumById, getStadiumGames } from '../../api/stadiumApi';
let mockRoute = { params: {}, query: 'name=War Memorial Stadium' };
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    Link: ({ to, children }) => <a href={to}>{children}</a>,
    useParams: () => mockRoute.params,
    useSearchParams: () => [new URLSearchParams(mockRoute.query)],
    useNavigate: () => mockNavigate,
}));
jest.mock('../../api/stadiumApi', () => ({
    getStadium: jest.fn(),
    getStadiumById: jest.fn(),
    getStadiumGames: jest.fn(),
}));
jest.mock('../../hooks/useTeamsMap', () => ({
    useTeamsMap: () => ({}),
    ensureTeam: jest.fn(),
    isTeamsListLoading: () => false,
}));
jest.mock('../../components/ui/TeamMark', () => ({ __esModule: true, default: () => null }));
jest.mock('../../components/stadium/StadiumPreview', () => ({
    __esModule: true,
    default: ({ title }) => <div>{title}</div>,
}));
jest.mock('../../components/stadium/StadiumEditDialog', () => ({
    __esModule: true,
    default: ({ open }) => (open ? <div>Editor dialog</div> : null),
}));
jest.mock('../../components/layout/PageWrap', () => ({
    __esModule: true,
    default: ({ children }) => <div>{children}</div>,
}));
jest.mock('../../components/ui/Panel', () => ({
    __esModule: true,
    default: ({ header, children }) => (
        <div>
            <h2>{header}</h2>
            {children}
        </div>
    ),
}));

const stadium = {
    name: 'War Memorial Stadium',
    city: 'Laramie',
    state: 'WY',
    country: 'United States',
    capacity: 29181,
    active: true,
    teams: ['Wyoming'],
    bowls: ['Arizona Bowl'],
    conferences: [],
    playoff_rounds: [],
};
const games = {
    games: [
        {
            game_id: 7,
            season: 12,
            week: 3,
            home_team: 'Wyoming',
            away_team: 'Boise State',
            home_score: 31,
            away_score: 17,
            final: true,
            postseason_game_name: null,
        },
    ],
    records: [{ team: 'Wyoming', wins: 1, losses: 0 }],
};

beforeEach(() => {
    mockRoute = { params: {}, query: 'name=War Memorial Stadium' };
    mockNavigate.mockReset();
    getStadium.mockResolvedValue(stadium);
    getStadiumById.mockResolvedValue({ ...stadium, id: 17 });
    getStadiumGames.mockResolvedValue(games);
});
afterEach(() => localStorage.clear());

test('the stadium page shows where it is, what it hosts and the games played there', async () => {
    render(<StadiumPage />);
    await act(async () => {});
    expect(screen.getByText('War Memorial Stadium')).toBeTruthy();
    expect(screen.getByText('Laramie, WY')).toBeTruthy();
    expect(screen.getByText('29,181 seats')).toBeTruthy();
    expect(screen.getByText('Home of Wyoming')).toBeTruthy();
    expect(screen.getByText('Wyoming is 1-0 at War Memorial Stadium all-time')).toBeTruthy();
    expect(screen.getByText('Hosts Arizona Bowl')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Edit stadium' })).toBeNull();
    expect(screen.getByText('17–31').closest('a').getAttribute('href')).toBe('/game-details/7');
    fireEvent.click(screen.getByRole('tab', { name: 'Team records (1)' }));
    expect(screen.getByText('1–0')).toBeTruthy();
    expect(screen.getByText('1.000')).toBeTruthy();
});

test('stadium games can be searched, filtered by season and paged', async () => {
    const many = Array.from({ length: 20 }, (_, index) => ({
        game_id: 100 + index,
        season: index < 16 ? 12 : 11,
        week: index + 1,
        home_team: 'Wyoming',
        away_team: index === 3 ? 'Air Force' : 'Boise State',
        home_score: 10,
        away_score: 3,
        final: true,
        postseason_game_name: null,
    }));
    getStadiumGames.mockResolvedValue({ games: many, records: games.records });
    render(<StadiumPage />);
    await act(async () => {});
    expect(screen.getByText(/^1-\d+ of 20 games$/)).toBeTruthy();
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search teams or bowls' }), {
        target: { value: 'air force' },
    });
    expect(screen.getAllByText('Air Force')).toHaveLength(1);
    expect(screen.queryByText('Boise State')).toBeNull();
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search teams or bowls' }), { target: { value: '' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '11' } });
    expect(screen.getAllByText('Boise State')).toHaveLength(4);
});

test.each(['ADMIN', 'CONFERENCE_COMMISSIONER'])('%s can edit the stadium right from its page', async (role) => {
    localStorage.setItem('role', role);
    render(<StadiumPage />);
    await act(async () => {});
    fireEvent.click(screen.getByRole('button', { name: 'Edit stadium' }));
    expect(screen.getByText('Editor dialog')).toBeTruthy();
});

test('a stadium opens by its id, and a name link is swapped for the id link', async () => {
    mockRoute = { params: { id: '17' }, query: '' };
    render(<StadiumPage />);
    await act(async () => {});
    expect(getStadiumById).toHaveBeenCalledWith('17');
    expect(screen.getByText('War Memorial Stadium')).toBeTruthy();

    mockRoute = { params: {}, query: 'name=War Memorial Stadium' };
    getStadium.mockResolvedValue({ ...stadium, id: 17 });
    render(<StadiumPage />);
    await act(async () => {});
    expect(mockNavigate).toHaveBeenCalledWith('/stadium/17', { replace: true });
});
