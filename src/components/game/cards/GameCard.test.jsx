/** @jest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GameCard from './GameCard';
import { getGameStatsByIdAndTeam } from '../../../api/gameStatsApi';
import { getPreviousPlay } from '../../../api/playApi';

jest.mock('react-router-dom', () => {
    global.TextEncoder = require('util').TextEncoder;
    return jest.requireActual('react-router-dom');
});
jest.mock('../../../api/gameStatsApi', () => ({ getGameStatsByIdAndTeam: jest.fn() }));
jest.mock('../../../api/playApi', () => ({ getPreviousPlay: jest.fn() }));
jest.mock('../../../hooks/useTeamsMap', () => ({ ensureTeam: jest.fn() }));
jest.mock('../../../context/ColorModeContext', () => ({ useColorMode: () => ({ mode: 'light' }) }));
jest.mock('../../../utils/formatPlay', () => ({ describePlay: (play) => play.description }));
jest.mock('../../ui/TeamMark', () => ({ __esModule: true, default: () => null }));
jest.mock('../../ui/FitTeamName', () => ({ __esModule: true, default: ({ fullName }) => <span>{fullName}</span> }));
jest.mock('./GameTypeLabel', () => ({ __esModule: true, default: () => null }));
const game = {
    game_id: 1,
    home_team: 'Alpha',
    away_team: 'Beta',
    home_score: 7,
    away_score: 0,
    game_status: 'IN_PROGRESS',
    possession: 'HOME',
    quarter: 1,
    clock: '10:00',
};
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
const open = async (initial = game) => {
    const content = (next) => (
        <MemoryRouter>
            <GameCard game={next} teamsMap={{}} />
        </MemoryRouter>
    );
    let view;
    await act(async () => {
        view = render(content(initial));
    });
    return { ...view, change: (next) => act(async () => view.rerender(content(next))) };
};
beforeEach(() => {
    jest.clearAllMocks();
    getGameStatsByIdAndTeam.mockResolvedValue({ q1_score: 7, q2_score: 0 });
    getPreviousPlay.mockResolvedValue({ description: 'Previous game play', possession: 'HOME', win_probability: 0.93 });
});
test('a replacement game does not display previous quarters, play, or win probability while loading', async () => {
    const view = await open();
    expect(screen.getByText('Q1')).toBeInTheDocument();
    expect(screen.getByText('Previous game play')).toBeInTheDocument();
    expect(screen.getByText(/93% win probability/)).toBeInTheDocument();
    const home = pending(getGameStatsByIdAndTeam);
    const away = pending(getGameStatsByIdAndTeam);
    const play = pending(getPreviousPlay);
    await view.change({ ...game, game_id: 2, home_team: 'Gamma', away_team: 'Delta' });
    expect(screen.queryByText('Q1')).not.toBeInTheDocument();
    expect(screen.queryByText('Previous game play')).not.toBeInTheDocument();
    expect(screen.queryByText(/93% win probability/)).not.toBeInTheDocument();
    await home.resolve({ q1_score: 3 });
    await away.resolve({ q1_score: 0 });
    await play.resolve({ description: 'Current game play' });
    expect(screen.getByText('Q1')).toBeInTheDocument();
    expect(screen.getByText('Current game play')).toBeInTheDocument();
    expect(getPreviousPlay).toHaveBeenLastCalledWith(2);
});
test('changed team identities hide previous quarter scores', async () => {
    const view = await open();
    const home = pending(getGameStatsByIdAndTeam);
    const away = pending(getGameStatsByIdAndTeam);
    await view.change({ ...game, home_team: 'Gamma' });
    expect(screen.queryByText('Q1')).not.toBeInTheDocument();
    await home.resolve({ q1_score: 0 });
    await away.resolve({ q1_score: 0 });
    expect(screen.getByText('Q1')).toBeInTheDocument();
    expect(getGameStatsByIdAndTeam).toHaveBeenCalledWith(1, 'Gamma');
});
test('same-game score refresh retains quarters and previous play while loading', async () => {
    const view = await open();
    const home = pending(getGameStatsByIdAndTeam);
    const away = pending(getGameStatsByIdAndTeam);
    const play = pending(getPreviousPlay);
    await view.change({ ...game, home_score: 14 });
    expect(screen.getByText('Q1')).toBeInTheDocument();
    expect(screen.getByText('Previous game play')).toBeInTheDocument();
    await play.reject();
    expect(screen.getByText('Previous game play')).toBeInTheDocument();
    await home.resolve({ q1_score: 14 });
    await away.resolve({ q1_score: 0 });
    expect(screen.getByText('Q1')).toBeInTheDocument();
});
test('replacement-game failures cannot restore previous supplemental data', async () => {
    const view = await open();
    getGameStatsByIdAndTeam
        .mockRejectedValueOnce(new Error('unavailable'))
        .mockRejectedValueOnce(new Error('unavailable'));
    getPreviousPlay.mockRejectedValueOnce(new Error('unavailable'));
    await view.change({ ...game, game_id: 2 });
    expect(screen.queryByText('Q1')).not.toBeInTheDocument();
    expect(screen.queryByText('Previous game play')).not.toBeInTheDocument();
});
test('late previous-game results cannot replace the current game data', async () => {
    const home = pending(getGameStatsByIdAndTeam);
    const away = pending(getGameStatsByIdAndTeam);
    const play = pending(getPreviousPlay);
    const view = await open();
    getPreviousPlay.mockResolvedValueOnce({ description: 'Current game play' });
    await view.change({ ...game, game_id: 2 });
    await home.resolve({ q1_score: 99 });
    await away.resolve({ q1_score: 99 });
    await play.resolve({ description: 'Obsolete play' });
    expect(screen.getByText('Current game play')).toBeInTheDocument();
    expect(screen.queryByText('Obsolete play')).not.toBeInTheDocument();
    expect(screen.queryByText('99')).not.toBeInTheDocument();
});
test('a final game does not display a previous live play', async () => {
    const view = await open();
    await view.change({ ...game, game_status: 'FINAL' });
    expect(screen.queryByText('Previous game play')).not.toBeInTheDocument();
    expect(screen.getByText('Q1')).toBeInTheDocument();
    expect(getPreviousPlay).toHaveBeenCalledTimes(1);
});

test('a game without an ID keeps the existing missing-data fallback', async () => {
    await open({ ...game, game_id: undefined });
    expect(screen.queryByText('Q1')).not.toBeInTheDocument();
    expect(screen.queryByText('Previous game play')).not.toBeInTheDocument();
    expect(getGameStatsByIdAndTeam).not.toHaveBeenCalled();
    expect(getPreviousPlay).not.toHaveBeenCalled();
});
