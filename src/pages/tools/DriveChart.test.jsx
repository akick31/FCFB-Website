/** @jest-environment jsdom */
import React, { StrictMode } from 'react';
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import DriveChart from './DriveChart';
import { getFilteredGames, getGameById } from '../../api/gameApi';
import { getAllPlaysByGameId } from '../../api/playApi';

jest.mock('react-router-dom', () => {
    global.TextEncoder = require('util').TextEncoder;
    return jest.requireActual('react-router-dom');
});
jest.mock('../../api/gameApi', () => ({ getFilteredGames: jest.fn(), getGameById: jest.fn() }));
jest.mock('../../api/playApi', () => ({ getAllPlaysByGameId: jest.fn() }));
jest.mock('../../hooks/useTeamsMap', () => ({
    useTeamsMap: () => ({}),
    toEntry: ({ name }) => ({ name, abbreviation: name }),
}));
jest.mock('../../hooks/useSeo', () => ({ useSeo: () => {} }));
jest.mock('../../context/ColorModeContext', () => ({ useColorMode: () => ({ mode: 'light' }) }));
jest.mock('../../components/ui/TeamMark', () => ({ __esModule: true, default: () => null }));
jest.mock('../../components/game/detail/WinProbChart', () => ({ __esModule: true, default: () => null }));
jest.mock('../../components/game/detail/ScoreChart', () => ({ __esModule: true, default: () => null }));
jest.mock('../../components/game/detail/DriveFieldChart', () => ({
    __esModule: true,
    default: ({ drive }) => <div>Drive for {drive.team}</div>,
}));
jest.mock('../../components/ui/SearchableSelect', () => ({
    __esModule: true,
    default: ({ id, value, options, onChange }) => (
        <select aria-label={id} value={value} onChange={(event) => onChange(event.target.value)}>
            <option value="" />
            {options.map((option) => (
                <option key={option.value} value={option.label}>
                    {option.label}
                </option>
            ))}
        </select>
    ),
}));
const games = [
    { game_id: 1, season: 12, week: 1, home_team: 'Alpha', away_team: 'Beta' },
    { game_id: 2, season: 12, week: 2, home_team: 'Gamma', away_team: 'Delta' },
];
const plays = [1, 2].map((number) => ({
    play_id: number,
    play_number: number,
    quarter: 1,
    clock: 900 - number,
    possession: 'HOME',
    home_team: 'Alpha',
    away_team: 'Beta',
    play_call: 'RUN',
    actual_result: 'GAIN',
    yards: number,
    ball_location: 25 + number,
    down: 1,
    yards_to_go: 10,
    home_score: 0,
    away_score: 0,
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
const Location = () => <div data-testid="location">{useLocation().search}</div>;
const open = async (url = '/tools/drive-chart', strict = false) => {
    let view;
    const content = (show) => (
        <MemoryRouter initialEntries={[url]}>
            {show && <DriveChart />}
            <Location />
        </MemoryRouter>
    );
    await act(async () => {
        view = render(strict ? <StrictMode>{content(true)}</StrictMode> : content(true));
    });
    return { ...view, leave: () => act(async () => view.rerender(content(false))) };
};
const load = async (number) => {
    const label = `#${number} · S12 Wk${number}: ${games[number - 1].away_team} @ ${games[number - 1].home_team}`;
    fireEvent.change(screen.getByRole('combobox', { name: 'drive-chart-game' }), { target: { value: label } });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Load game' })));
};
beforeEach(() => {
    jest.clearAllMocks();
    getFilteredGames.mockResolvedValue({ content: games });
    getAllPlaysByGameId.mockResolvedValue(plays);
    getGameById.mockResolvedValue(games[0]);
});

test.each(['resolve', 'reject'])(
    'discarded Strict Mode lookup %s cannot replace current game options',
    async (completion) => {
        const previous = pending(getFilteredGames);
        await open('/tools/drive-chart', true);
        await previous[completion]({ content: [] });
        expect(screen.getByRole('option', { name: '#1 · S12 Wk1: Beta @ Alpha' })).toBeInTheDocument();
    }
);
test('unmount before lookup completion cannot launch URL auto-loading', async () => {
    const lookup = pending(getFilteredGames);
    const view = await open('/tools/drive-chart?game=1');
    await view.leave();
    await lookup.resolve({ content: games });
    expect(getAllPlaysByGameId).not.toHaveBeenCalled();
});
test.each(['resolve', 'reject'])('load %s after unmount cannot rewrite the URL', async (completion) => {
    const report = pending(getAllPlaysByGameId);
    const view = await open();
    await load(1);
    await view.leave();
    await report[completion](plays);
    expect(screen.getByTestId('location')).toBeEmptyDOMElement();
});
test('current loading preserves chronological replay and excludes terminal markers', async () => {
    getAllPlaysByGameId.mockResolvedValueOnce([
        plays[1],
        { ...plays[1], play_number: 3, actual_result: 'END_OF_GAME' },
        plays[0],
    ]);
    await open();
    await load(1);
    expect(screen.getByText('Play 1 of 2')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Step ▶' }));
    expect(screen.getByText('Play 2 of 2')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('?game=1');
});
test('an active load failure retains the existing error and permits retry', async () => {
    getAllPlaysByGameId.mockRejectedValueOnce(new Error('unavailable'));
    await open();
    await load(1);
    expect(screen.getByRole('alert')).toHaveTextContent('unavailable');
    expect(screen.getByRole('button', { name: 'Load game' })).toBeEnabled();
    await load(1);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('Play 1 of 2')).toBeInTheDocument();
});
test('URL auto-load retains the direct game lookup for games outside recent options', async () => {
    getGameById.mockResolvedValueOnce({ ...games[0], game_id: 99 });
    await open('/tools/drive-chart?game=99');
    expect(getAllPlaysByGameId).toHaveBeenCalledWith(99);
    expect(getGameById).toHaveBeenCalledWith(99);
    expect(screen.getByRole('combobox', { name: 'drive-chart-game' })).toHaveValue('#99 · S12 Wk1: Beta @ Alpha');
    expect(screen.getByText('Play 1 of 2')).toBeInTheDocument();
});
