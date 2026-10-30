/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GameManagement from './GameManagement';
import { getCurrentSeasonOrLatest, getCurrentWeekOrLatest, getAllSeasons } from '../../api/seasonApi';
import useFilteredGames from '../../hooks/useFilteredGames';

jest.mock('../../api/seasonApi', () => ({
    getCurrentSeasonOrLatest: jest.fn(),
    getCurrentWeekOrLatest: jest.fn(),
    getAllSeasons: jest.fn(),
}));
jest.mock('../../api/teamApi', () => ({ getAllTeams: jest.fn().mockResolvedValue([]) }));
jest.mock('../../api/gameApi', () => ({}));
jest.mock('../../hooks/useConferencesMap', () => ({ conferenceLabel: (code) => code }));
const mockRefetch = jest.fn();
jest.mock('../../hooks/useFilteredGames', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        refetch: mockRefetch,
        filters: {},
        filteredGames: [],
        gamesLoading: false,
        currentPage: 0,
        totalGames: 0,
        pageCount: 0,
        pageSize: 50,
    })),
}));
jest.mock('../../hooks/useGameWeekStarter', () => ({
    __esModule: true,
    default: () => ({ stats: {}, selectedStartSeason: null, selectedStartWeek: null }),
}));
jest.mock('../../components/layout/AdminLayout', () => ({
    __esModule: true,
    default: ({ children }) => <main>{children}</main>,
}));
jest.mock('../../components/gameManagement/ScrimmageDialog', () => ({ __esModule: true, default: () => null }));
jest.mock('../../components/gameManagement/StartGameDialog', () => ({ __esModule: true, default: () => null }));
jest.mock('../../components/gameManagement/StartWeekConfirmDialog', () => ({ __esModule: true, default: () => null }));
jest.mock('../../components/gameManagement/ChewAllConfirmDialog', () => ({ __esModule: true, default: () => null }));
jest.mock('../../components/gameManagement/GamesTable', () => ({
    __esModule: true,
    default: ({ onEditGame }) => <button onClick={() => onEditGame(42)}>Edit game 42</button>,
}));
jest.mock('../../components/admin/GameEditDialog', () => ({
    __esModule: true,
    default: ({ gameId, onClose }) => <button onClick={onClose}>Close game {gameId}</button>,
}));
jest.mock('react-router-dom', () => {
    global.TextEncoder = require('util').TextEncoder;
    return jest.requireActual('react-router-dom');
});

beforeEach(() => {
    jest.clearAllMocks();
    getCurrentSeasonOrLatest.mockResolvedValue(12);
    getCurrentWeekOrLatest.mockResolvedValue(3);
    getAllSeasons.mockResolvedValue([{ season_number: 12 }]);
    jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

test('initializes game reads with server season and week', async () => {
    render(<GameManagement />, { wrapper: MemoryRouter });
    await act(async () => {});
    expect(useFilteredGames).toHaveBeenLastCalledWith(12, 3, expect.any(Function), expect.any(Number));
});

test('default lookup failure surfaces the error without fabricating season and week', async () => {
    getCurrentSeasonOrLatest.mockRejectedValue(new Error('unavailable'));
    render(<GameManagement />, { wrapper: MemoryRouter });
    await act(async () => {});
    expect(screen.getByText('Failed to load current season/week')).toBeTruthy();
    expect(useFilteredGames).toHaveBeenLastCalledWith(null, null, expect.any(Function), expect.any(Number));
});

test('a pending season list cannot apply defaults after unmount', async () => {
    let resolveSeasons;
    getAllSeasons.mockReturnValue(
        new Promise((resolve) => {
            resolveSeasons = resolve;
        })
    );
    const { unmount } = render(<GameManagement />, { wrapper: MemoryRouter });
    await act(async () => {});
    const reads = useFilteredGames.mock.calls.length;
    unmount();
    await act(async () => resolveSeasons([{ season_number: 12 }]));
    expect(useFilteredGames).toHaveBeenCalledTimes(reads);
});

test('edit opens the game dialog and closing it refreshes the games', async () => {
    render(<GameManagement />, { wrapper: MemoryRouter });
    await act(async () => {});
    fireEvent.click(screen.getByText('Edit game 42'));
    fireEvent.click(screen.getByText('Close game 42'));
    expect(screen.queryByText('Close game 42')).toBeNull();
    expect(mockRefetch).toHaveBeenCalled();
});
