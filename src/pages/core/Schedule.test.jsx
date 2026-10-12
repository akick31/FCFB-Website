/** @jest-environment jsdom */
import React, { StrictMode } from 'react';
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Schedule from './Schedule';
import { getAllTeamsIncludingInactive } from '../../api/teamApi';
import {
    getScheduleBySeasonAndTeam,
    getConferenceSchedule,
    getScheduleBySeason,
    getPostseasonSchedule,
} from '../../api/scheduleApi';
import { getTeamSeasonConference } from '../../api/teamSeasonConferenceApi';

jest.mock('react-router-dom', () => {
    global.TextEncoder = require('util').TextEncoder;
    return jest.requireActual('react-router-dom');
});
jest.mock('../../api/teamApi', () => ({ getAllTeamsIncludingInactive: jest.fn() }));
jest.mock('../../api/seasonApi', () => ({
    getCurrentSeasonOrUpcoming: jest.fn().mockResolvedValue(12),
    getAllSeasons: jest.fn().mockResolvedValue([{ season_number: 12 }, { season_number: 11 }]),
}));
jest.mock('../../api/scheduleApi', () => ({
    getScheduleBySeasonAndTeam: jest.fn(),
    getConferenceSchedule: jest.fn(),
    getScheduleBySeason: jest.fn(),
    getPostseasonSchedule: jest.fn(),
}));
jest.mock('../../api/teamSeasonConferenceApi', () => ({ getTeamSeasonConference: jest.fn() }));
jest.mock('../../utils/utils', () => ({
    getStorageItem: (_storage, _key, fallback) => fallback,
    checkIfUserIsAdmin: () => false,
}));
jest.mock('../../hooks/useTeamsMap', () => ({ useTeamsMap: () => ({}) }));
jest.mock('../../hooks/useSeo', () => ({ useSeo: () => {} }));
jest.mock('../../hooks/useConferencesMap', () => ({
    useConferencesMap: () => ({}),
    activeConferenceCodes: () => ['SEC', 'ACC'],
    allConferenceList: () => [{ code: 'SEC' }, { code: 'ACC' }],
    conferenceLabel: (code) => code,
}));
jest.mock('../../hooks/useConferenceScheduleEditor', () => ({ __esModule: true, default: () => ({}) }));
jest.mock('../../components/scheduling/ConferenceScheduleGrid', () => ({ __esModule: true, default: () => null }));
jest.mock('../../components/scheduling/ConferenceGameDialogs', () => ({ __esModule: true, default: () => null }));
jest.mock('../../components/schedule/TeamSchedule', () => ({
    __esModule: true,
    default: ({ schedule, loading }) => (
        <div data-testid="team-result">{loading ? 'Loading team' : schedule.map((entry) => entry.label).join(',')}</div>
    ),
}));
jest.mock('../../components/schedule/ConferenceGrid', () => ({
    __esModule: true,
    default: ({ schedule, loading }) => (
        <div data-testid="conference-result">
            {loading ? 'Loading conference' : schedule.map((entry) => entry.label).join(',')}
        </div>
    ),
}));
jest.mock('../../components/schedule/PostseasonView', () => ({
    __esModule: true,
    default: ({ postseasonSchedule, loading }) => (
        <div data-testid="postseason-result">
            {loading ? 'Loading postseason' : postseasonSchedule.map((entry) => entry.label).join(',')}
        </div>
    ),
}));
const teams = [
    { id: 1, name: 'Alpha', active: true, conference: 'SEC' },
    { id: 2, name: 'Beta', active: true, conference: 'ACC' },
];
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
        reject: () => act(async () => reject(new Error('unavailable'))),
    };
};
const open = async (url, strict = false) => {
    const content = (
        <MemoryRouter initialEntries={[url]}>
            <Routes>
                <Route path="/schedules/:tab/:selection?/:seasonParam?" element={<Schedule />} />
            </Routes>
        </MemoryRouter>
    );
    let view;
    await act(async () => {
        view = render(strict ? <StrictMode>{content}</StrictMode> : content);
    });
    return view;
};
const changeSeason = (season) =>
    act(async () => fireEvent.change(screen.getByRole('combobox', { name: 'Season' }), { target: { value: season } }));
beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    getAllTeamsIncludingInactive.mockResolvedValue(teams);
    getScheduleBySeasonAndTeam.mockResolvedValue([]);
    getConferenceSchedule.mockResolvedValue([]);
    getScheduleBySeason.mockResolvedValue([]);
    getPostseasonSchedule.mockResolvedValue([]);
    getTeamSeasonConference.mockResolvedValue({ Alpha: 'SEC', Beta: 'ACC' });
});

test.each(['resolve', 'reject'])(
    'team schedule ignores old-team %s while a new team is loading',
    async (completion) => {
        const previous = pending(getScheduleBySeasonAndTeam);
        const current = pending(getScheduleBySeasonAndTeam);
        await open('/schedules/team/alpha/12');
        await act(async () =>
            fireEvent.change(screen.getByRole('combobox', { name: 'Team' }), { target: { value: 'Beta' } })
        );
        await previous[completion]([{ label: 'Old team', week: 1 }]);
        expect(screen.getByTestId('team-result')).toHaveTextContent('Loading team');
        await current.resolve([{ label: 'New team', week: 1 }]);
        expect(screen.getByTestId('team-result')).toHaveTextContent('New team');
        expect(getScheduleBySeasonAndTeam).toHaveBeenLastCalledWith(12, 'Beta');
    }
);
test('team schedule retains sorted weekly results', async () => {
    getScheduleBySeasonAndTeam.mockResolvedValueOnce([
        { week: 3, label: 'Week three' },
        { week: 1, label: 'Week one' },
    ]);
    await open('/schedules/team/alpha/12');
    expect(screen.getByTestId('team-result')).toHaveTextContent('Week one,Week three');
});
test('conference schedule ignores an old-season result while the new season is loading', async () => {
    const previous = pending(getScheduleBySeason);
    const current = pending(getScheduleBySeason);
    await open('/schedules/conference/sec/12');
    await changeSeason('11');
    await previous.resolve([{ label: 'Old season' }]);
    expect(screen.getByTestId('conference-result')).toHaveTextContent('Loading conference');
    await current.resolve([{ label: 'New season' }]);
    expect(screen.getByTestId('conference-result')).toHaveTextContent('New season');
    expect(getConferenceSchedule).toHaveBeenLastCalledWith(11, 'SEC');
});
test.each(['resolve', 'reject'])(
    'postseason ignores an old-season %s while the new season is loading',
    async (completion) => {
        const previous = pending(getPostseasonSchedule);
        const current = pending(getPostseasonSchedule);
        await open('/schedules/postseason/12');
        await changeSeason('11');
        await previous[completion]([{ label: 'Old postseason' }]);
        expect(screen.getByTestId('postseason-result')).toHaveTextContent('Loading postseason');
        await current.resolve([{ label: 'New postseason' }]);
        expect(screen.getByTestId('postseason-result')).toHaveTextContent('New postseason');
        expect(getPostseasonSchedule).toHaveBeenLastCalledWith(11);
    }
);
test.each(['resolve', 'reject'])(
    'discarded initial Strict Mode %s cannot replace a successful load',
    async (completion) => {
        const previous = pending(getAllTeamsIncludingInactive);
        await open('/schedules/team/alpha/12', true);
        await previous[completion]([{ id: 3, name: 'Obsolete', active: true }]);
        expect(screen.getByRole('combobox', { name: 'Team' })).toHaveValue('Alpha');
        expect(screen.queryByRole('option', { name: 'Obsolete' })).not.toBeInTheDocument();
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    }
);
test('historical conference failures use the existing page error display', async () => {
    getTeamSeasonConference.mockRejectedValueOnce(new Error('unavailable'));
    await open('/schedules/conference/sec/11');
    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load data. Please try again.');
});
test('historical conference failure cannot affect the live season after selection changes', async () => {
    const previous = pending(getTeamSeasonConference);
    await open('/schedules/conference/sec/11');
    await changeSeason('12');
    await previous.reject();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Season' })).toHaveValue('12');
});

test('switching seasons clears a previous historical lookup error', async () => {
    getTeamSeasonConference.mockRejectedValueOnce(new Error('unavailable'));
    await open('/schedules/conference/sec/11');
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await changeSeason('12');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Season' })).toHaveValue('12');
});
