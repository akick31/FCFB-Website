/** @jest-environment jsdom */
import React from 'react';
import { act, render, screen } from '@testing-library/react';
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
jest.mock('../../hooks/useFilteredGames', () => ({
    __esModule: true,
    default: jest.fn(() => ({
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
jest.mock('../../components/gameManagement/GamesTable', () => ({ __esModule: true, default: () => null }));

beforeEach(() => {
    jest.clearAllMocks();
    getCurrentSeasonOrLatest.mockResolvedValue(12);
    getCurrentWeekOrLatest.mockResolvedValue(3);
    getAllSeasons.mockResolvedValue([{ season_number: 12 }]);
    jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

test('initializes game reads with server season and week', async () => {
    render(<GameManagement />);
    await act(async () => {});
    expect(useFilteredGames).toHaveBeenLastCalledWith(12, 3, expect.any(Function));
});

test('default lookup failure surfaces the error without fabricating season and week', async () => {
    getCurrentSeasonOrLatest.mockRejectedValue(new Error('unavailable'));
    render(<GameManagement />);
    await act(async () => {});
    expect(screen.getByText('Failed to load current season/week')).toBeTruthy();
    expect(useFilteredGames).toHaveBeenLastCalledWith(null, null, expect.any(Function));
});

test('a pending season list cannot apply defaults after unmount', async () => {
    let resolveSeasons;
    getAllSeasons.mockReturnValue(
        new Promise((resolve) => {
            resolveSeasons = resolve;
        })
    );
    const { unmount } = render(<GameManagement />);
    await act(async () => {});
    const reads = useFilteredGames.mock.calls.length;
    unmount();
    await act(async () => resolveSeasons([{ season_number: 12 }]));
    expect(useFilteredGames).toHaveBeenCalledTimes(reads);
});
