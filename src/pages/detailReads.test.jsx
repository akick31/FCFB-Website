/** @jest-environment jsdom */
import React from 'react';
import { act, render, screen } from '@testing-library/react';
import TeamDetails from './team/TeamDetails';
import UserDetails from './user/UserDetails';
import { getTeamById } from '../api/teamApi';
import { getAllUsers, getUsernameHistory } from '../api/userApi';
import { getLatestRankings } from '../api/rankingApi';
import { getCoachStats } from '../api/coachStatsApi';
import { getCurrentSeason, getLatestCompletedSeason, getAllSeasons } from '../api/seasonApi';
let mockId;
let mockParams;
const mockSetParams = jest.fn();
jest.mock('react-router-dom', () => ({
    useParams: () => ({ teamId: mockId, coachName: mockId }),
    useSearchParams: () => [mockParams, mockSetParams],
    Link: ({ children }) => <span>{children}</span>,
}));
jest.mock('../api/teamApi', () => ({ getTeamById: jest.fn(), getAllTeams: async () => [] }));
jest.mock('../api/userApi', () => ({ getAllUsers: jest.fn(), getUsernameHistory: jest.fn() }));
jest.mock('../api/eloHistoryApi.jsx', () => ({ getEloHistory: async () => [], getEloHistoryForTeams: async () => [] }));
jest.mock('../api/rankingApi', () => ({
    getLatestRankings: jest.fn(),
    getTeamRankings: async () => [],
    getRankedGames: async () => [],
}));
jest.mock('../api/rankingMetricApi', () => ({
    getRankingMetricWeeks: async () => [],
    getTeamRankingMetrics: async () => [],
    getTeamRankingMetricTrends: async () => [],
}));
jest.mock('../api/seasonStatsApi', () => ({ getFilteredSeasonStats: async () => null }));
jest.mock('../api/scheduleApi', () => ({ getScheduleBySeasonAndTeam: async () => [] }));
jest.mock('../api/seasonApi', () => ({
    getCurrentSeason: jest.fn(),
    getLatestCompletedSeason: jest.fn(),
    getAllSeasons: jest.fn(),
}));
jest.mock('../api/coachTransactionLogApi', () => ({ getEntireCoachTransactionLog: async () => [] }));
jest.mock('../api/coachStatsApi', () => ({ getCoachStats: jest.fn() }));
jest.mock('../hooks/useTeamsMap', () => ({ useTeamsMap: () => ({}), toEntry: (team) => team }));
jest.mock('../hooks/useConferencesMap', () => ({ conferenceLabel: (code) => code }));
jest.mock('../hooks/useSeo', () => ({ useSeo: () => {} }));
jest.mock('../context/ColorModeContext', () => ({ useColorMode: () => ({ mode: 'dark' }) }));
jest.mock('../utils/utils', () => ({ checkIfUserIsAdmin: () => false }));
jest.mock('../components/team/TeamHeader', () => ({
    __esModule: true,
    default: ({ team, pollRank }) => (
        <div>
            Team {team.name} Rank {String(pollRank)}
        </div>
    ),
}));
jest.mock('../components/user/CoachHeader', () => ({
    __esModule: true,
    default: ({ user, championSeason }) => (
        <div>
            Coach {user.username} Champion {String(championSeason)}
        </div>
    ),
}));
jest.mock('../components/user/CurrentTeamsPanel', () => ({ __esModule: true, default: () => null }));
jest.mock('../components/charts/MiniTrendChart', () => ({ __esModule: true, default: () => null }));
jest.mock('../components/charts/MultiLineChart', () => ({ __esModule: true, default: () => null }));
jest.mock('../components/team/SeasonStatTable', () => ({ __esModule: true, default: () => null }));
jest.mock('../components/schedule/TeamSchedule', () => ({ __esModule: true, default: () => null }));
jest.mock('../components/ui/TeamMark', () => ({ __esModule: true, default: () => null }));
const users = [
    { id: 1, username: 'A', team: 'Alpha' },
    { id: 2, username: 'B', team: 'Beta' },
];
beforeEach(() => {
    jest.resetAllMocks();
    mockId = 'A';
    mockParams = new URLSearchParams();
    getTeamById.mockImplementation(async (id) => ({ id, name: id }));
    getAllUsers.mockResolvedValue(users);
    getUsernameHistory.mockResolvedValue([]);
    getCoachStats.mockResolvedValue([]);
    getCurrentSeason.mockResolvedValue(12);
    getLatestCompletedSeason.mockResolvedValue({ season_number: 11, national_championship_winning_team: 'Alpha' });
    getAllSeasons.mockResolvedValue([]);
    getLatestRankings.mockResolvedValue([]);
});

test('team details recover after a previous team fails to load', async () => {
    getTeamById.mockRejectedValueOnce(new Error('unavailable'));
    const { rerender } = render(<TeamDetails />);
    await act(async () => {});
    expect(screen.getByText('Failed to load team details. Please try again.')).toBeTruthy();
    mockId = 'B';
    await act(async () => rerender(<TeamDetails />));
    expect(screen.getByText('Team B Rank null')).toBeTruthy();
    expect(screen.queryByText('Failed to load team details. Please try again.')).toBeNull();
});

test('a new team cannot inherit a previous rank when its own poll lookup fails', async () => {
    getLatestRankings.mockResolvedValueOnce([{ teamId: 'A', rank: 3 }]).mockRejectedValueOnce(new Error('unavailable'));
    const { rerender } = render(<TeamDetails />);
    await act(async () => {});
    expect(screen.getByText('Team A Rank 3')).toBeTruthy();
    mockId = 'B';
    await act(async () => rerender(<TeamDetails />));
    expect(screen.getByText('Team B Rank null')).toBeTruthy();
});

test('an obsolete fallback season list cannot populate or rewrite a new team’s query', async () => {
    let finish;
    getCurrentSeason.mockResolvedValueOnce(null);
    getAllSeasons.mockReturnValueOnce(
        new Promise((resolve) => {
            finish = resolve;
        })
    );
    const { rerender } = render(<TeamDetails />);
    await act(async () => {});
    mockId = 'B';
    await act(async () => rerender(<TeamDetails />));
    mockSetParams.mockClear();
    await act(async () => finish([{ season_number: 99 }]));
    expect(screen.getByText('Team B Rank null')).toBeTruthy();
    expect(mockSetParams).not.toHaveBeenCalled();
});

test('a coach without a championship cannot inherit the previous coach’s badge', async () => {
    const { rerender } = render(<UserDetails />);
    await act(async () => {});
    expect(screen.getByText('Coach A Champion 11')).toBeTruthy();
    mockId = 'B';
    await act(async () => rerender(<UserDetails />));
    expect(screen.getByText('Coach B Champion null')).toBeTruthy();
});

test('an obsolete username-history response cannot launch coach stats or set a championship badge', async () => {
    let finish;
    getUsernameHistory.mockReturnValueOnce(
        new Promise((resolve) => {
            finish = resolve;
        })
    );
    const { rerender } = render(<UserDetails />);
    await act(async () => {});
    mockId = 'B';
    await act(async () => rerender(<UserDetails />));
    await act(async () => finish([]));
    expect(screen.getByText('Coach B Champion null')).toBeTruthy();
    expect(getCoachStats.mock.calls).toEqual([['B']]);
});

test('username history completed after unmount cannot start more profile requests', async () => {
    let finish;
    getUsernameHistory.mockReturnValueOnce(
        new Promise((resolve) => {
            finish = resolve;
        })
    );
    const { unmount } = render(<UserDetails />);
    await act(async () => {});
    unmount();
    await act(async () => finish([]));
    expect(getCoachStats).not.toHaveBeenCalled();
});
