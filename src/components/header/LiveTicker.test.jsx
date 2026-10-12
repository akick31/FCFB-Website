/** @jest-environment jsdom */
import React from 'react';
import { act, render, screen } from '@testing-library/react';
import LiveTicker from './LiveTicker';
import { getCurrentSeasonOrLatest, getCurrentWeekOrLatest } from '../../api/seasonApi';
import { getFilteredGames } from '../../api/gameApi';
import { getPostseasonSchedule } from '../../api/scheduleApi';

jest.mock('react-router-dom', () => ({
    Link: ({ to, children, ...props }) => (
        <a href={to} {...props}>
            {children}
        </a>
    ),
}));
jest.mock('../../hooks/useTeamsMap', () => ({ useTeamsMap: () => ({}), ensureTeam: jest.fn() }));
jest.mock('../ui/TeamMark', () => ({ __esModule: true, default: () => null }));
jest.mock('../../api/seasonApi', () => ({ getCurrentSeasonOrLatest: jest.fn(), getCurrentWeekOrLatest: jest.fn() }));
jest.mock('../../api/gameApi', () => ({ getFilteredGames: jest.fn() }));
jest.mock('../../api/scheduleApi', () => ({ getPostseasonSchedule: jest.fn() }));

const game = {
    game_id: 1,
    home_team: 'Home',
    away_team: 'Away',
    home_score: 7,
    away_score: 3,
    game_status: 'FINAL',
    game_type: 'CONFERENCE_GAME',
};

beforeEach(() => {
    jest.useFakeTimers();
    jest.resetAllMocks();
    getCurrentSeasonOrLatest.mockResolvedValue(12);
    getCurrentWeekOrLatest.mockResolvedValue(1);
    getFilteredGames.mockImplementation(({ category }) =>
        Promise.resolve({ content: category === 'PAST' ? [game] : [] })
    );
});
afterEach(() => jest.useRealTimers());

test('does not overlap a refresh that takes longer than thirty seconds', async () => {
    getCurrentSeasonOrLatest.mockReturnValue(new Promise(() => {}));
    render(<LiveTicker />);
    await act(async () => {
        jest.advanceTimersByTime(90000);
    });
    expect(getCurrentSeasonOrLatest).toHaveBeenCalledTimes(1);
    expect(getCurrentWeekOrLatest).toHaveBeenCalledTimes(1);
});

test('preserves regular-season games and excludes scrimmages', async () => {
    getFilteredGames.mockImplementation(({ category }) =>
        Promise.resolve({
            content:
                category === 'PAST'
                    ? [game, { ...game, game_id: 2, home_team: 'Scrimmage', game_type: 'SCRIMMAGE' }]
                    : [],
        })
    );
    render(<LiveTicker />);
    await act(async () => {});
    expect(screen.getByRole('link', { name: 'Away at Home, FINAL' }).getAttribute('href')).toBe('/game-details/1');
    expect(screen.queryByRole('link', { name: /Scrimmage/ })).toBeNull();
});

test('preserves postseason loading including pregame entries', async () => {
    getCurrentWeekOrLatest.mockResolvedValue(14);
    getPostseasonSchedule.mockResolvedValue([
        game,
        { ...game, game_id: 2, home_team: 'Future', game_status: 'PREGAME', home_score: null },
    ]);
    render(<LiveTicker />);
    await act(async () => {});
    expect(getPostseasonSchedule).toHaveBeenCalledWith(12);
    expect(getFilteredGames).not.toHaveBeenCalled();
    expect(screen.getByRole('link', { name: 'Away at Home, FINAL' })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Future/ })).toBeTruthy();
});

test('stops refreshes after unmount while an earlier load is pending', async () => {
    let resolveSeason;
    getCurrentSeasonOrLatest.mockReturnValue(
        new Promise((resolve) => {
            resolveSeason = resolve;
        })
    );
    const { unmount } = render(<LiveTicker />);
    unmount();
    await act(async () => {
        resolveSeason(12);
    });
    await act(async () => {
        jest.advanceTimersByTime(90000);
    });
    expect(getCurrentSeasonOrLatest).toHaveBeenCalledTimes(1);
});
