/** @jest-environment jsdom */
import React, { StrictMode } from 'react';
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RankingsGraphTab from './RankingsGraphTab';
import { getEloHistory } from '../../../api/eloHistoryApi.jsx';
import { getRankingWeeks, getRankings } from '../../../api/rankingApi';
import { getRankingMetricWeeks, getRankingMetrics } from '../../../api/rankingMetricApi';

jest.mock('react-router-dom', () => {
    global.TextEncoder = require('util').TextEncoder;
    return jest.requireActual('react-router-dom');
});
jest.mock('../../../api/eloHistoryApi.jsx', () => ({ getEloHistory: jest.fn().mockResolvedValue([]) }));
jest.mock('../../../api/rankingApi', () => ({ getRankingWeeks: jest.fn(), getRankings: jest.fn() }));
jest.mock('../../../api/rankingMetricApi', () => ({ getRankingMetricWeeks: jest.fn(), getRankingMetrics: jest.fn() }));
jest.mock('../../../hooks/useConferencesMap', () => ({
    useConferencesMap: () => ({}),
    useSeasonConferenceCodes: () => [],
    seasonConferenceList: () => [],
    conferenceLabel: (code) => code,
}));
jest.mock('../../charts/MultiLineChart', () => ({
    __esModule: true,
    default: ({ lines }) => (
        <div data-testid="chart">{JSON.stringify(lines.map(({ team, pts }) => ({ team, pts })))}</div>
    ),
}));
const props = {
    season: 12,
    teams: [{ name: 'Alpha', current_elo: 1500 }],
    teamsMap: {},
    mode: 'light',
    onSubChange: jest.fn(),
};
const pending = (api) => {
    let resolve;
    api.mockReturnValueOnce(
        new Promise((finish) => {
            resolve = finish;
        })
    );
    return (value) => act(async () => resolve(value));
};
const open = async (sub, strict = false) => {
    const content = (season) => {
        const tab = (
            <MemoryRouter>
                <RankingsGraphTab {...props} season={season} sub={sub} />
            </MemoryRouter>
        );
        return strict ? <StrictMode>{tab}</StrictMode> : tab;
    };
    let view;
    await act(async () => {
        view = render(content(12));
    });
    return { ...view, changeSeason: (season) => act(async () => view.rerender(content(season))) };
};
beforeEach(() => {
    jest.clearAllMocks();
    getRankingWeeks.mockResolvedValue([1, 3]);
    getRankingMetricWeeks.mockResolvedValue([1, 3]);
    getRankings.mockImplementation(async (_season, week) => [{ teamName: 'Alpha', rank: week }]);
    getRankingMetrics.mockImplementation(async (_season, week) => [{ teamName: 'Alpha', week, value: week * 10 }]);
});

describe.each([
    ['poll', getRankingWeeks, getRankings, 'COACHES_POLL'],
    ['power-rating', getRankingMetricWeeks, getRankingMetrics, 'POWER_RATING'],
])('%s graph reads', (sub, weeksApi, rowsApi, ranking) => {
    test('do not fetch weeks after unmount', async () => {
        const finish = pending(weeksApi);
        const view = await open(sub);
        view.unmount();
        await finish([1, 3]);
        expect(rowsApi).not.toHaveBeenCalled();
    });
    test('do not fetch obsolete weeks or finish loading for a newer season', async () => {
        const previous = pending(weeksApi);
        const current = pending(weeksApi);
        const view = await open(sub);
        await view.changeSeason(11);
        await previous([2, 4]);
        expect(rowsApi).not.toHaveBeenCalled();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        await current([3]);
        expect(rowsApi).toHaveBeenCalledTimes(1);
        expect(rowsApi).toHaveBeenCalledWith(11, 3, ranking);
        expect(screen.getByTestId('chart')).toHaveTextContent('Alpha');
    });
    test('do not fetch obsolete weeks after changing ranking type', async () => {
        const previous = pending(weeksApi);
        await open(sub);
        await act(async () =>
            fireEvent.change(screen.getByRole('combobox', { name: 'Ranking' }), { target: { value: 'ELO' } })
        );
        await previous([1, 3]);
        expect(rowsApi).not.toHaveBeenCalled();
        expect(getEloHistory).toHaveBeenCalledWith('all', 12);
        expect(screen.getByText('No data for this view yet.')).toBeInTheDocument();
    });
    test('discard the first Strict Mode weeks read', async () => {
        const previous = pending(weeksApi);
        await open(sub, true);
        expect(rowsApi).toHaveBeenCalledTimes(2);
        await previous([2, 4]);
        expect(rowsApi).toHaveBeenCalledTimes(2);
    });
    test('preserve weekly arguments and sorted chart points', async () => {
        weeksApi.mockResolvedValueOnce([3, 1]);
        await open(sub);
        expect(rowsApi).toHaveBeenCalledWith(12, 3, ranking);
        expect(rowsApi).toHaveBeenCalledWith(12, 1, ranking);
        expect(JSON.parse(screen.getByTestId('chart').textContent)).toEqual([
            {
                team: 'Alpha',
                pts:
                    sub === 'poll'
                        ? [
                              { x: 1, val: 1 },
                              { x: 3, val: 3 },
                          ]
                        : [
                              { x: 1, val: 10 },
                              { x: 3, val: 30 },
                          ],
            },
        ]);
    });
    test('retain successful weeks when an individual week fails', async () => {
        rowsApi.mockRejectedValueOnce(new Error('unavailable'));
        await open(sub);
        const lines = JSON.parse(screen.getByTestId('chart').textContent);
        expect(lines[0].pts).toEqual([{ x: 3, val: sub === 'poll' ? 3 : 30 }]);
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    test('retain the existing empty view on weeks lookup failure', async () => {
        weeksApi.mockRejectedValueOnce(new Error('unavailable'));
        await open(sub);
        expect(screen.getByText('No data for this view yet.')).toBeInTheDocument();
        expect(rowsApi).not.toHaveBeenCalled();
    });
});
