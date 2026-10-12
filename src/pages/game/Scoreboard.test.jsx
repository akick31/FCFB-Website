/** @jest-environment jsdom */
import React, { StrictMode } from 'react';
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Scoreboard from './Scoreboard';
import { getCurrentSeason, getCurrentWeek, getLatestCompletedSeason, getAllSeasons } from '../../api/seasonApi';
import { getFilteredGames } from '../../api/gameApi';
import { getPostseasonSchedule } from '../../api/scheduleApi';
import { useTeamsMap } from '../../hooks/useTeamsMap';

jest.mock('react-router-dom', () => {
    global.TextEncoder = require('util').TextEncoder;
    return jest.requireActual('react-router-dom');
});
jest.mock('../../api/seasonApi', () => ({
    getCurrentSeason: jest.fn(),
    getCurrentWeek: jest.fn(),
    getLatestCompletedSeason: jest.fn(),
    getAllSeasons: jest.fn(),
}));
jest.mock('../../api/gameApi', () => ({ getFilteredGames: jest.fn() }));
jest.mock('../../api/scheduleApi', () => ({ getPostseasonSchedule: jest.fn().mockResolvedValue([]) }));
jest.mock('../../hooks/useTeamsMap', () => ({ useTeamsMap: jest.fn() }));
jest.mock('../../hooks/useConferencesMap', () => ({
    useConferencesMap: () => ({}),
    activeConferenceCodes: () => [],
    conferenceLabel: (code) => code,
}));
jest.mock('../../hooks/useSeo', () => ({ useSeo: () => {} }));
jest.mock('../../components/game/cards/GameCard', () => ({
    __esModule: true,
    default: ({ game }) => <div>{game.home_team}</div>,
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
        reject: () => act(async () => reject(new Error('unavailable'))),
    };
};
const open = async (url = '/scoreboard/final', strict = false) => {
    const content = (
        <MemoryRouter initialEntries={[url]}>
            <Routes>
                <Route path="/scoreboard/:tab/:season?/:week?" element={<Scoreboard />} />
            </Routes>
        </MemoryRouter>
    );
    let view;
    await act(async () => {
        view = render(strict ? <StrictMode>{content}</StrictMode> : content);
    });
    return view;
};
const change = (label, value) =>
    act(async () => fireEvent.change(screen.getByRole('combobox', { name: label }), { target: { value } }));
const tick = () => act(async () => jest.advanceTimersByTime(0));
beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    useTeamsMap.mockReturnValue({});
    getCurrentSeason.mockResolvedValue(12);
    getCurrentWeek.mockResolvedValue(4);
    getLatestCompletedSeason.mockResolvedValue({ season_number: 11 });
    getAllSeasons.mockResolvedValue([{ season_number: 12 }, { season_number: 11 }]);
    getFilteredGames.mockResolvedValue({ content: [], total_pages: 1 });
    getPostseasonSchedule.mockResolvedValue([]);
});
afterEach(() => jest.useRealTimers());

test('late active defaults preserve both user-selected fields', async () => {
    const defaults = pending(getCurrentSeason);
    await open();
    await change('Season', '11');
    await change('Week', '2');
    await defaults.resolve(12);
    expect(screen.getByRole('combobox', { name: 'Season' })).toHaveValue('11');
    expect(screen.getByRole('combobox', { name: 'Week' })).toHaveValue('2');
    await tick();
    expect(getFilteredGames).toHaveBeenLastCalledWith(
        expect.objectContaining({ category: 'PAST', season: 11, week: 2 })
    );
});
test('choosing a week still allows the untouched season default', async () => {
    const defaults = pending(getCurrentSeason);
    await open();
    await change('Week', '2');
    await defaults.resolve(12);
    expect(screen.getByRole('combobox', { name: 'Season' })).toHaveValue('12');
    expect(screen.getByRole('combobox', { name: 'Week' })).toHaveValue('2');
});
test('choosing a season still allows the untouched week default', async () => {
    const defaults = pending(getCurrentSeason);
    await open();
    await change('Season', '11');
    await defaults.resolve(12);
    expect(screen.getByRole('combobox', { name: 'Season' })).toHaveValue('11');
    expect(screen.getByRole('combobox', { name: 'Week' })).toHaveValue('4');
});
test('late offseason defaults preserve chosen season and week', async () => {
    getCurrentSeason.mockResolvedValue(null);
    const latest = pending(getLatestCompletedSeason);
    await open();
    await change('Season', '12');
    await change('Week', '2');
    await latest.resolve({ season_number: 11 });
    expect(screen.getByRole('combobox', { name: 'Season' })).toHaveValue('12');
    expect(screen.getByRole('combobox', { name: 'Week' })).toHaveValue('2');
});
test('unmount stops the latest-completed-season follow-up', async () => {
    const defaults = pending(getCurrentSeason);
    const view = await open();
    view.unmount();
    await defaults.resolve(null);
    expect(getLatestCompletedSeason).not.toHaveBeenCalled();
});
test('discarded Strict Mode defaults cannot overwrite the current defaults', async () => {
    const previous = pending(getCurrentSeason);
    await open('/scoreboard/final', true);
    await previous.resolve(null);
    expect(getLatestCompletedSeason).not.toHaveBeenCalled();
    expect(screen.getByRole('combobox', { name: 'Season' })).toHaveValue('12');
    expect(screen.getByRole('combobox', { name: 'Week' })).toHaveValue('4');
});
test.each(['resolve', 'reject'])('discarded season-list %s preserves the current options', async (completion) => {
    const previous = pending(getAllSeasons);
    await open('/scoreboard/final/12/4', true);
    await previous[completion]([{ season_number: 99 }]);
    expect(screen.getByRole('combobox', { name: 'Season' })).toHaveValue('12');
    expect(screen.queryByRole('option', { name: 'Season 99' })).not.toBeInTheDocument();
});
test('explicit URL selections retain priority over active defaults', async () => {
    await open('/scoreboard/final/11/2');
    expect(screen.getByRole('combobox', { name: 'Season' })).toHaveValue('11');
    expect(screen.getByRole('combobox', { name: 'Week' })).toHaveValue('2');
});
test('unchanged offseason defaults select the completed season and postseason', async () => {
    getCurrentSeason.mockResolvedValue(null);
    await open();
    expect(screen.getByRole('combobox', { name: 'Season' })).toHaveValue('11');
    expect(screen.getByRole('combobox', { name: 'Week' })).toHaveValue('postseason');
});

test.each(['resolve', 'reject'])('an obsolete pagination %s cannot finish a newer filter read', async (completion) => {
    getFilteredGames.mockResolvedValueOnce({ content: [{ game_id: 1, home_team: 'Alpha' }], total_pages: 3 });
    await open('/scoreboard/final/12/4');
    await tick();
    const previous = pending(getFilteredGames);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Next' })));
    await tick();
    const current = pending(getFilteredGames);
    await change('Rank', 'ranked');
    await tick();
    await previous[completion]({ content: [{ game_id: 2, home_team: 'Obsolete' }], total_pages: 3 });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    await current.resolve({ content: [{ game_id: 3, home_team: 'Beta' }], total_pages: 1 });
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.queryByText('Obsolete')).not.toBeInTheDocument();
    expect(getFilteredGames).toHaveBeenLastCalledWith(expect.objectContaining({ page: 0, filters: ['RANKED_GAME'] }));
});

test.each(['empty', 'failure'])('unavailable season defaults stop loading on %s', async (result) => {
    if (result === 'failure') {
        getCurrentSeason.mockRejectedValueOnce(new Error('unavailable'));
        getLatestCompletedSeason.mockRejectedValueOnce(new Error('unavailable'));
    } else {
        getCurrentSeason.mockResolvedValueOnce(null);
        getLatestCompletedSeason.mockResolvedValueOnce(null);
    }
    await open();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByText('No games to show')).toBeInTheDocument();
    expect(getFilteredGames).not.toHaveBeenCalled();
});
test('a selected season can load after unavailable defaults', async () => {
    getCurrentSeason.mockResolvedValueOnce(null);
    getLatestCompletedSeason.mockResolvedValueOnce(null);
    await open();
    await change('Season', '11');
    await change('Week', '2');
    await tick();
    expect(getFilteredGames).toHaveBeenLastCalledWith(expect.objectContaining({ season: 11, week: 2 }));
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
});
test('unavailable defaults cannot finish a user-selected season read', async () => {
    getCurrentSeason.mockResolvedValueOnce(null);
    const latest = pending(getLatestCompletedSeason);
    const games = pending(getFilteredGames);
    await open();
    await change('Season', '11');
    await change('Week', '2');
    await tick();
    await latest.resolve(null);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    await games.resolve({ content: [], total_pages: 1 });
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
});
const replaceTeamMap = async (view, teamsMap) => {
    useTeamsMap.mockReturnValue(teamsMap);
    await act(async () =>
        view.rerender(
            <MemoryRouter initialEntries={['/scoreboard/final/12/4']}>
                <Routes>
                    <Route path="/scoreboard/:tab/:season?/:week?" element={<Scoreboard />} />
                </Routes>
            </MemoryRouter>
        )
    );
};
test('abbreviation search updates when the team reference map arrives', async () => {
    getFilteredGames.mockResolvedValue({
        content: [{ game_id: 1, home_team: 'Alpha', away_team: 'Beta' }],
        total_pages: 1,
    });
    const view = await open('/scoreboard/final/12/4?team=AXY');
    await act(async () => jest.advanceTimersByTime(300));
    expect(screen.getByText('No games to show')).toBeInTheDocument();
    await replaceTeamMap(view, { Alpha: { name: 'Alpha', abbreviation: 'AXY' } });
    await act(async () => jest.advanceTimersByTime(300));
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(getFilteredGames).toHaveBeenLastCalledWith(expect.objectContaining({ size: 100, page: 0 }));
});
test('postseason conference filtering updates when the team reference map arrives', async () => {
    getPostseasonSchedule.mockResolvedValue([
        { game_id: 1, home_team: 'Alpha', away_team: 'Beta', game_status: 'FINAL' },
    ]);
    const view = await open('/scoreboard/final/12/postseason?conference=SEC');
    await tick();
    expect(screen.getByText('No games to show')).toBeInTheDocument();
    await replaceTeamMap(view, { Alpha: { name: 'Alpha', conference: 'SEC' } });
    await tick();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
});
