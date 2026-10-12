/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import GameDetails from './GameDetails';
import { getGameById, chewGameByGameId, unchewGameByGameId, endGameByGameId } from '../../api/gameApi';
import { generateGameStats } from '../../api/gameStatsApi.jsx';
let mockId;
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    useParams: () => ({ gameId: mockId }),
    useNavigate: () => mockNavigate,
    Link: ({ children }) => <span>{children}</span>,
}));
jest.mock('../../api/gameApi', () => ({
    getGameById: jest.fn(),
    chewGameByGameId: jest.fn(),
    unchewGameByGameId: jest.fn(),
    endGameByGameId: jest.fn(),
}));
jest.mock('../../api/playApi', () => ({ getAllPlaysByGameId: async () => [] }));
jest.mock('../../api/gameStatsApi.jsx', () => ({
    getGameStatsByIdAndTeam: async () => null,
    generateGameStats: jest.fn(),
}));
jest.mock('../../api/teamApi', () => ({ getTeamByName: async () => null }));
jest.mock('../../api/seasonApi', () => ({ getCurrentSeasonOrLatest: async () => 12 }));
jest.mock('../../api/scheduleApi', () => ({ getScheduleBySeasonAndTeam: async () => [] }));
jest.mock('../../hooks/useTeamsMap', () => ({ useTeamsMap: () => ({}), toEntry: (team) => team }));
jest.mock('../../hooks/useVenuesMap', () => ({ useVenuesMap: () => ({}) }));
jest.mock('../../hooks/useConferencesMap', () => ({ conferenceLabel: (code) => code }));
jest.mock('../../hooks/useSeo', () => ({ useSeo: () => {} }));
jest.mock('../../context/ColorModeContext', () => ({ useColorMode: () => ({ mode: 'dark' }) }));
jest.mock('../../components/layout/PageWrap', () => ({
    __esModule: true,
    default: ({ children }) => <div>{children}</div>,
}));
jest.mock('../../components/ui/PageHeading', () => ({ __esModule: true, default: () => null }));
jest.mock('../../components/ui/Panel', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }));
jest.mock('../../components/ui/TeamMark', () => ({ __esModule: true, default: () => null }));
jest.mock('../../components/ui/ConferenceMark', () => ({ __esModule: true, default: () => null }));
jest.mock('../../components/game/detail/GameScorebug', () => ({
    __esModule: true,
    default: ({ game }) => (
        <div>
            Game {game.game_id} {game.game_mode}
        </div>
    ),
}));
jest.mock('../../components/game/detail/DriveFieldChart', () => ({ __esModule: true, default: () => null }));
jest.mock('../../components/game/detail/WinProbChart', () => ({ __esModule: true, default: () => null }));
jest.mock('../../components/game/detail/ScoreChart', () => ({ __esModule: true, default: () => null }));
jest.mock('../../components/game/detail/PlaysPanel', () => ({ __esModule: true, default: () => null }));
jest.mock('../../components/gameManagement/ChewConfirmDialog', () => ({
    __esModule: true,
    default: ({ open, onConfirm }) => (open ? <button onClick={onConfirm}>Confirm chew</button> : null),
}));
const game = (id, mode = 'NORMAL') => ({
    game_id: id,
    home_team: 'Home',
    away_team: 'Away',
    game_status: 'IN_PROGRESS',
    game_mode: mode,
    season: 12,
});
beforeEach(() => {
    jest.resetAllMocks();
    mockId = 'A';
    getGameById.mockImplementation(async (id) => game(id));
    [chewGameByGameId, unchewGameByGameId, endGameByGameId, generateGameStats].forEach((write) =>
        write.mockResolvedValue(undefined)
    );
});

test('a prior load failure does not block the next valid game', async () => {
    getGameById.mockRejectedValueOnce(new Error('unavailable'));
    const { rerender } = render(<GameDetails isAdmin />);
    await act(async () => {});
    expect(screen.getByText('Failed to load game details. Please try again.')).toBeTruthy();
    mockId = 'B';
    await act(async () => rerender(<GameDetails isAdmin />));
    expect(screen.getByText('Game B NORMAL')).toBeTruthy();
    expect(screen.queryByText('Failed to load game details. Please try again.')).toBeNull();
});

test.each(['success', 'failure'])(
    'an old admin action %s cannot affect the new game or finish its action',
    async (outcome) => {
        let finish, reject;
        endGameByGameId.mockReturnValueOnce(
            new Promise((resolve, fail) => {
                finish = resolve;
                reject = fail;
            })
        );
        generateGameStats.mockReturnValueOnce(new Promise(() => {}));
        const { rerender } = render(<GameDetails isAdmin />);
        await act(async () => {});
        fireEvent.click(screen.getByText('End game'));
        mockId = 'B';
        await act(async () => rerender(<GameDetails isAdmin />));
        fireEvent.click(screen.getByText('Generate game stats'));
        await act(async () => (outcome === 'success' ? finish() : reject(new Error('obsolete'))));
        expect(screen.getByText('Game B NORMAL')).toBeTruthy();
        expect(screen.queryByText('Game ended.')).toBeNull();
        expect(screen.queryByText('obsolete')).toBeNull();
        expect(screen.getByText('Generate game stats').disabled).toBe(true);
        expect(getGameById.mock.calls).toEqual([['A'], ['B']]);
        expect(endGameByGameId).toHaveBeenCalledWith('A');
    }
);

test('an old action refresh cannot overwrite another game', async () => {
    let finish;
    const { rerender } = render(<GameDetails isAdmin />);
    await act(async () => {});
    getGameById.mockReturnValueOnce(
        new Promise((resolve) => {
            finish = resolve;
        })
    );
    await act(async () => fireEvent.click(screen.getByText('End game')));
    mockId = 'B';
    await act(async () => rerender(<GameDetails isAdmin />));
    await act(async () => finish(game('A', 'CHEW')));
    expect(screen.getByText('Game B NORMAL')).toBeTruthy();
    expect(screen.queryByText('Game A CHEW')).toBeNull();
});

test('action completion after unmount does not start a refresh', async () => {
    let finish;
    endGameByGameId.mockReturnValueOnce(
        new Promise((resolve) => {
            finish = resolve;
        })
    );
    const { unmount } = render(<GameDetails isAdmin />);
    await act(async () => {});
    fireEvent.click(screen.getByText('End game'));
    unmount();
    await act(async () => finish());
    expect(getGameById).toHaveBeenCalledTimes(1);
});

test('finishing one action does not enable a different pending action', async () => {
    let finishStats;
    generateGameStats.mockReturnValueOnce(
        new Promise((resolve) => {
            finishStats = resolve;
        })
    );
    endGameByGameId.mockReturnValueOnce(new Promise(() => {}));
    render(<GameDetails isAdmin />);
    await act(async () => {});
    fireEvent.click(screen.getByText('End game'));
    fireEvent.click(screen.getByText('Generate game stats'));
    await act(async () => finishStats());
    expect(screen.getByText('End game').disabled).toBe(true);
    expect(screen.getByText('Generate game stats').disabled).toBe(false);
});

test('changing games clears an open chew confirmation', async () => {
    const { rerender } = render(<GameDetails isAdmin />);
    await act(async () => {});
    fireEvent.click(screen.getByText('Chew game'));
    expect(screen.getByText('Confirm chew')).toBeTruthy();
    mockId = 'B';
    await act(async () => rerender(<GameDetails isAdmin />));
    expect(screen.queryByText('Confirm chew')).toBeNull();
});

test('current chew success preserves the endpoint and refreshes the game', async () => {
    render(<GameDetails isAdmin />);
    await act(async () => {});
    getGameById.mockResolvedValueOnce(game('A', 'CHEW'));
    fireEvent.click(screen.getByText('Chew game'));
    await act(async () => fireEvent.click(screen.getByText('Confirm chew')));
    expect(chewGameByGameId).toHaveBeenCalledWith('A');
    expect(screen.getByText('Chew mode set.')).toBeTruthy();
    expect(screen.getByText('Game A CHEW')).toBeTruthy();
});

test('an older action refresh cannot replace the newest refresh for the same game', async () => {
    let finishOld;
    render(<GameDetails isAdmin />);
    await act(async () => {});
    getGameById
        .mockReturnValueOnce(
            new Promise((resolve) => {
                finishOld = resolve;
            })
        )
        .mockResolvedValueOnce(game('A', 'CHEW'));
    await act(async () => fireEvent.click(screen.getByText('End game')));
    fireEvent.click(screen.getByText('Chew game'));
    await act(async () => fireEvent.click(screen.getByText('Confirm chew')));
    await act(async () => finishOld(game('A', 'NORMAL')));
    expect(screen.getByText('Game A CHEW')).toBeTruthy();
    expect(screen.getByText('Chew mode set.')).toBeTruthy();
});

test('current unchew retains its endpoint, success message, and refresh', async () => {
    getGameById.mockResolvedValueOnce(game('A', 'CHEW'));
    render(<GameDetails isAdmin />);
    await act(async () => {});
    getGameById.mockResolvedValueOnce(game('A'));
    fireEvent.click(screen.getByText('Take out of chew mode'));
    await act(async () => fireEvent.click(screen.getByText('Confirm chew')));
    expect(unchewGameByGameId).toHaveBeenCalledWith('A');
    expect(screen.getByText('Chew mode turned off.')).toBeTruthy();
    expect(screen.getByText('Game A NORMAL')).toBeTruthy();
});

test('a current action failure preserves its message and releases its own button', async () => {
    endGameByGameId.mockRejectedValueOnce(new Error('end unavailable'));
    render(<GameDetails isAdmin />);
    await act(async () => {});
    await act(async () => fireEvent.click(screen.getByText('End game')));
    expect(screen.getByText('end unavailable')).toBeTruthy();
    expect(screen.getByText('End game').disabled).toBe(false);
    expect(getGameById).toHaveBeenCalledTimes(1);
});

test('public views retain the existing absence of admin actions', async () => {
    render(<GameDetails isAdmin={false} />);
    await act(async () => {});
    expect(screen.getByText('Game A NORMAL')).toBeTruthy();
    expect(screen.queryByText('End game')).toBeNull();
    expect(screen.queryByText('Chew game')).toBeNull();
    expect(screen.queryByText('Generate game stats')).toBeNull();
});
