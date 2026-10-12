/** @jest-environment jsdom */
import React, { StrictMode } from 'react';
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Home from './Home';
import RiceSheet from './RiceSheet';
import Standings from './Standings';
import { getAllTeams } from '../../api/teamApi';
import { getTeamSeasonConference } from '../../api/teamSeasonConferenceApi';
import { getRankingWeeks, getRankings } from '../../api/rankingApi';
import { getFilteredGames } from '../../api/gameApi';
import { getPostseasonSchedule, getScheduleBySeasonAndTeam } from '../../api/scheduleApi';
import { getCurrentSeasonOrLatest } from '../../api/seasonApi';

jest.mock('react-router-dom', () => {
    global.TextEncoder = require('util').TextEncoder;
    return jest.requireActual('react-router-dom');
});
jest.mock('../../assets/graphics/main_logo.png', () => 'logo');
jest.mock('../../assets/graphics/trophy.png', () => 'trophy');
jest.mock('../../components/game/cards/GameCard', () => ({ __esModule: true, default: () => null }));
jest.mock('../../components/ui/ConferenceMark', () => ({ __esModule: true, default: () => null }));
jest.mock('../../api/teamApi', () => ({
    getAllTeams: jest.fn().mockResolvedValue([]),
    getAllTeamsIncludingInactive: jest.fn().mockResolvedValue([{ id: 1, name: 'Alpha', active: true }]),
}));
jest.mock('../../api/seasonApi', () => ({
    getCurrentSeason: jest.fn().mockResolvedValue(12),
    getLatestCompletedSeason: jest.fn().mockResolvedValue({ season_number: 11 }),
    getAllSeasons: jest.fn().mockResolvedValue([{ season_number: 12 }, { season_number: 11 }]),
    getCurrentSeasonOrLatest: jest.fn().mockResolvedValue(12),
}));
jest.mock('../../api/rankingApi', () => ({
    getRankingWeeks: jest.fn().mockResolvedValue([4]),
    getRankings: jest.fn().mockResolvedValue([]),
}));
jest.mock('../../api/gameApi', () => ({ getFilteredGames: jest.fn().mockResolvedValue({ content: [] }) }));
jest.mock('../../api/scheduleApi', () => ({
    getPostseasonSchedule: jest.fn().mockResolvedValue([]),
    getScheduleBySeasonAndTeam: jest.fn().mockResolvedValue([]),
    getScheduleBySeason: jest.fn().mockResolvedValue([]),
    getConferenceRules: jest.fn().mockResolvedValue({ divisions: [] }),
}));
jest.mock('../../api/eloHistoryApi.jsx', () => ({ getEloHistory: jest.fn().mockResolvedValue([]) }));
jest.mock('../../api/seasonStatsApi', () => ({ getFilteredSeasonStats: jest.fn().mockResolvedValue({ content: [] }) }));
jest.mock('../../components/game/scoreboard/hooks/useOffseasonStatus', () => ({
    useOffseasonStatus: () => ({ isOffseason: false }),
}));
jest.mock('../../api/teamSeasonConferenceApi', () => ({
    getTeamSeasonConference: jest.fn().mockResolvedValue({ Alpha: 'TEST' }),
}));
jest.mock('../../api/rankingMetricApi', () => ({
    getValidRankingMetricWeeks: jest.fn().mockResolvedValue([]),
    getRankingMetrics: jest.fn().mockResolvedValue([]),
}));
jest.mock('../../api/teamResumeMetricApi', () => ({ getTeamResumeMetrics: jest.fn().mockResolvedValue([]) }));
jest.mock('../../hooks/useTeamsMap', () => ({
    useTeamsMap: () => ({}),
    toEntry: (team) => team,
    ensureTeam: jest.fn(),
}));
jest.mock('../../hooks/useConferencesMap', () => ({
    useConferencesMap: () => ({}),
    activeConferenceCodes: () => [],
    allConferenceList: () => [],
    seasonConferenceList: () => [],
    conferenceLabel: (code) => code,
}));
jest.mock('../../hooks/useSeo', () => ({ useSeo: () => {} }));
jest.mock('../../components/riceSheet/TeamPicker', () => ({ __esModule: true, default: () => null }));
jest.mock('../../components/riceSheet/RiceSheetCard', () => ({
    __esModule: true,
    default: ({ opponents, opponentsLoading }) => (
        <div>{opponentsLoading ? 'Loading opponents' : opponents.map((opponent) => opponent.name).join(',')}</div>
    ),
}));

const pending = (api) => {
    let resolve;
    let reject;
    api.mockReturnValueOnce(
        new Promise((finish, fail) => {
            resolve = finish;
            reject = fail;
        })
    );
    return {
        resolve: (value) => act(async () => resolve(value)),
        reject: () => act(async () => reject(new Error('failed'))),
    };
};
const open = async (Page, url = '/') => {
    let view;
    await act(async () => {
        view = render(
            <MemoryRouter initialEntries={[url]}>
                <Page />
            </MemoryRouter>
        );
    });
    return view;
};
const schedule = (opponent) => [
    { home_team: 'Alpha', away_team: opponent, week: 1, finished: true, home_score: 7, away_score: 0 },
];
beforeEach(() => jest.clearAllMocks());

test('Home stops before the poll when navigation occurs during the weeks read', async () => {
    const weeks = pending(getRankingWeeks);
    const view = await open(Home);
    view.unmount();
    await weeks.resolve([4]);
    expect(getRankings).not.toHaveBeenCalled();
});
test('Home fetches games independently of the coaches-poll chain', async () => {
    const poll = pending(getRankings);
    await open(Home);
    expect(getFilteredGames).toHaveBeenCalledTimes(2);
    await poll.resolve([]);
});
test('Home fetches the postseason schedule independently of the games chain', async () => {
    const games = pending(getFilteredGames);
    await open(Home);
    expect(getPostseasonSchedule).toHaveBeenCalledWith(11);
    await games.resolve({ content: [] });
});
test('Home retains current-season polling and both game categories while mounted', async () => {
    await open(Home);
    expect(getRankingWeeks).toHaveBeenCalledWith(12, 'COACHES_POLL');
    expect(getRankings).toHaveBeenCalledWith(12, 4, 'COACHES_POLL');
    expect(getFilteredGames).toHaveBeenCalledTimes(2);
    expect(getPostseasonSchedule).toHaveBeenCalledWith(11);
    expect(screen.getByText('Season 12')).toBeInTheDocument();
});
test('RiceSheet reloads opponents when changing seasons instead of retaining the old cache', async () => {
    getScheduleBySeasonAndTeam
        .mockResolvedValueOnce(schedule('Old opponent'))
        .mockResolvedValueOnce(schedule('New opponent'));
    await open(RiceSheet, '/rice-sheet?season=12&teams=1');
    expect(screen.getByText('Old opponent')).toBeInTheDocument();
    await act(async () =>
        fireEvent.change(screen.getByRole('combobox', { name: 'Season' }), { target: { value: '11' } })
    );
    expect(getScheduleBySeasonAndTeam).toHaveBeenLastCalledWith(11, 'Alpha');
    expect(screen.getByText('New opponent')).toBeInTheDocument();
    expect(screen.queryByText('Old opponent')).not.toBeInTheDocument();
});
test.each(['resolve', 'reject'])(
    'RiceSheet ignores an old-season schedule %s while the new request is pending',
    async (completion) => {
        const old = pending(getScheduleBySeasonAndTeam);
        const next = pending(getScheduleBySeasonAndTeam);
        await open(RiceSheet, '/rice-sheet?season=12&teams=1');
        await act(async () =>
            fireEvent.change(screen.getByRole('combobox', { name: 'Season' }), { target: { value: '11' } })
        );
        await old[completion](schedule('Old opponent'));
        expect(screen.getByText('Loading opponents')).toBeInTheDocument();
        expect(screen.queryByText('Old opponent')).not.toBeInTheDocument();
        await next.resolve(schedule('New opponent'));
        expect(screen.getByText('New opponent')).toBeInTheDocument();
    }
);
test('RiceSheet retains the current-season default and explicit URL season', async () => {
    const view = await open(RiceSheet, '/rice-sheet');
    expect(screen.getByRole('combobox', { name: 'Season' })).toHaveValue('12');
    view.unmount();
    getCurrentSeasonOrLatest.mockClear();
    await open(RiceSheet, '/rice-sheet?season=11');
    expect(screen.getByRole('combobox', { name: 'Season' })).toHaveValue('11');
    expect(getCurrentSeasonOrLatest).not.toHaveBeenCalled();
});

const openStandings = async (season = 12, strict = false) => {
    const routes = (
        <MemoryRouter initialEntries={[`/standings/test/${season}`]}>
            <Routes>
                <Route path="/standings/:conference/:seasonParam" element={<Standings />} />
            </Routes>
        </MemoryRouter>
    );
    let view;
    await act(async () => {
        view = render(strict ? <StrictMode>{routes}</StrictMode> : routes);
    });
    return view;
};
test('Standings ignores the discarded Strict Mode initial season lookup', async () => {
    const previous = pending(getCurrentSeasonOrLatest);
    await openStandings(99, true);
    expect(screen.getByRole('combobox', { name: 'Season' })).toHaveValue('12');
    await previous.resolve(11);
    expect(screen.getByRole('combobox', { name: 'Season' })).toHaveValue('12');
});
test('Standings ignores a discarded initial lookup failure after the current read succeeds', async () => {
    const previous = pending(getAllTeams);
    await openStandings(12, true);
    await previous.reject();
    expect(screen.queryByText('Failed to load standings data. Please try again.')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Season' })).toHaveValue('12');
});
test('Standings shows its existing error message when a historical conference lookup fails', async () => {
    getTeamSeasonConference.mockRejectedValueOnce(new Error('unavailable'));
    await openStandings(11);
    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load standings data. Please try again.');
});
test('Standings ignores a historical lookup failure after switching back to the live season', async () => {
    const previous = pending(getTeamSeasonConference);
    await openStandings(11);
    await act(async () =>
        fireEvent.change(screen.getByRole('combobox', { name: 'Season' }), { target: { value: '12' } })
    );
    await previous.reject();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Season' })).toHaveValue('12');
});
test('Standings retains a successful historical lookup and season selection', async () => {
    await openStandings(11);
    expect(getTeamSeasonConference).toHaveBeenCalledWith(11);
    expect(screen.getByRole('combobox', { name: 'Season' })).toHaveValue('11');
    expect(screen.getByRole('columnheader', { name: 'Overall' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
