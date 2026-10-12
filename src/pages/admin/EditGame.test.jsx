/** @jest-environment jsdom */
import React, { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import EditGame from './EditGame';
import { getGameById, updateGame, restartGame } from '../../api/gameApi';
import { getAllPlaysByGameId, rollbackPlay } from '../../api/playApi';
import { generateGameStats } from '../../api/gameStatsApi.jsx';

let mockGameId;
jest.mock('react-router-dom', () => ({ useParams: () => ({ gameId: mockGameId }), useNavigate: () => jest.fn() }));
jest.mock('../../api/gameApi', () => ({ getGameById: jest.fn(), updateGame: jest.fn(), restartGame: jest.fn() }));
jest.mock('../../api/playApi', () => ({ getAllPlaysByGameId: jest.fn(), rollbackPlay: jest.fn() }));
jest.mock('../../api/gameStatsApi.jsx', () => ({ generateGameStats: jest.fn() }));
jest.mock('../../components/layout/AdminLayout', () => ({
    __esModule: true,
    default: ({ title, children }) => (
        <div>
            <h1>{title}</h1>
            {children}
        </div>
    ),
}));
jest.mock('../../components/ui/Panel', () => ({
    __esModule: true,
    default: ({ header, children }) => (
        <section>
            <h2>{header}</h2>
            {children}
        </section>
    ),
}));
jest.mock('../../components/ui/DataTable', () => ({
    __esModule: true,
    default: ({ children }) => <table>{children}</table>,
}));
const alpha = { id: 'A', homeTeam: 'Home A', awayTeam: 'Away A', season: 11, week: 1 };
const beta = { ...alpha, id: 'B', homeTeam: 'Home B', awayTeam: 'Away B' };
const actions = [
    ['Save changes', updateGame, 'Game updated successfully!', 'Failed to update game'],
    ['Restart game', restartGame, 'Game restarted successfully!', 'Failed to restart game'],
    ['Rollback play', rollbackPlay, 'Play rolled back successfully!', 'Failed to rollback play'],
    ['Regenerate stats', generateGameStats, 'Stats regenerated successfully!', 'Failed to regenerate stats'],
];
beforeEach(() => {
    jest.resetAllMocks();
    mockGameId = 'A';
    getGameById.mockImplementation(async (id) => (id === 'A' ? alpha : beta));
    getAllPlaysByGameId.mockImplementation(async (id) => [{ id: 1, result: `Play ${id}` }]);
    updateGame.mockResolvedValue(undefined);
    restartGame.mockResolvedValue(undefined);
    rollbackPlay.mockResolvedValue(undefined);
    generateGameStats.mockResolvedValue(undefined);
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());
const actionButton = (label) => screen.getByRole('button', { name: new RegExp(label) });
const switchToBeta = async (rerender) => {
    mockGameId = 'B';
    await act(async () => rerender(<EditGame />));
};

test('an old game and its plays cannot replace the new route', async () => {
    let resolveGame;
    let resolvePlays;
    getGameById.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveGame = resolve;
        })
    );
    getAllPlaysByGameId.mockReturnValueOnce(
        new Promise((resolve) => {
            resolvePlays = resolve;
        })
    );
    const { rerender } = render(<EditGame />);
    await switchToBeta(rerender);
    await act(async () => {
        resolveGame(alpha);
        resolvePlays([{ id: 2, result: 'Obsolete play' }]);
    });
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Edit Game: Away B @ Home B');
    expect(screen.getByText('Play B')).toBeTruthy();
    expect(screen.queryByText('Obsolete play')).toBeNull();
});

test('old read failures cannot end the current route loading state', async () => {
    let rejectGame;
    let rejectPlays;
    getGameById
        .mockReturnValueOnce(
            new Promise((resolve, reject) => {
                rejectGame = reject;
            })
        )
        .mockReturnValueOnce(new Promise(() => {}));
    getAllPlaysByGameId
        .mockReturnValueOnce(
            new Promise((resolve, reject) => {
                rejectPlays = reject;
            })
        )
        .mockReturnValueOnce(new Promise(() => {}));
    const { rerender } = render(<EditGame />);
    await switchToBeta(rerender);
    await act(async () => {
        rejectGame(new Error('Old game failure'));
        rejectPlays(new Error('Old plays failure'));
    });
    expect(screen.getByRole('progressbar')).toBeTruthy();
    expect(console.error).not.toHaveBeenCalled();
});

test('a route change hides loaded game fields and clears plays until current reads finish', async () => {
    let resolveGame;
    getGameById.mockResolvedValueOnce(alpha).mockReturnValueOnce(
        new Promise((resolve) => {
            resolveGame = resolve;
        })
    );
    getAllPlaysByGameId
        .mockResolvedValueOnce([{ id: 1, result: 'Old play' }])
        .mockReturnValueOnce(new Promise(() => {}));
    const { rerender } = render(<EditGame />);
    await act(async () => {});
    await switchToBeta(rerender);
    expect(screen.queryByLabelText('Season')).toBeNull();
    await act(async () => resolveGame(beta));
    expect(screen.getByRole('progressbar')).toBeTruthy();
    expect(screen.queryByText('Old play')).toBeNull();
});

test.each(actions)('%s completion cannot update or reload a different game', async (label, api, successMessage) => {
    let resolveWrite;
    api.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveWrite = resolve;
        })
    );
    const { rerender } = render(<EditGame />);
    await act(async () => {});
    fireEvent.click(actionButton(label));
    await switchToBeta(rerender);
    await act(async () => resolveWrite());
    expect(screen.queryByText(successMessage)).toBeNull();
    expect(actionButton('Save changes').disabled).toBe(false);
    expect(api).toHaveBeenCalledWith(label === 'Save changes' ? alpha : 'A');
    expect(getGameById).toHaveBeenCalledTimes(2);
    expect(getAllPlaysByGameId).toHaveBeenCalledTimes(2);
});

test.each(actions)('%s obsolete failure cannot clear a newer save or surface feedback', async (label, api) => {
    let rejectOld;
    api.mockReturnValueOnce(
        new Promise((resolve, reject) => {
            rejectOld = reject;
        })
    );
    const { rerender } = render(<EditGame />);
    await act(async () => {});
    fireEvent.click(actionButton(label));
    await switchToBeta(rerender);
    updateGame.mockReturnValueOnce(new Promise(() => {}));
    fireEvent.click(actionButton('Save changes'));
    await act(async () => rejectOld(new Error('Old write failed')));
    expect(screen.queryByText(/Old write failed/)).toBeNull();
    expect(screen.getByRole('button', { name: 'Saving...' }).disabled).toBe(true);
});

test.each(actions)('%s preserves its current success, payload and reload behavior', async (label, api, message) => {
    render(<EditGame />);
    await act(async () => {});
    await act(async () => fireEvent.click(actionButton(label)));
    expect(screen.getByText(message)).toBeTruthy();
    expect(api).toHaveBeenCalledWith(label === 'Save changes' ? alpha : 'A');
    expect(getGameById).toHaveBeenCalledTimes(['Restart game', 'Rollback play'].includes(label) ? 2 : 1);
    expect(getAllPlaysByGameId).toHaveBeenCalledTimes(label === 'Rollback play' ? 2 : 1);
});

test.each(actions)('%s retains the existing current failure feedback', async (label, api, success, failure) => {
    api.mockRejectedValueOnce(new Error('Unavailable'));
    render(<EditGame />);
    await act(async () => {});
    await act(async () => fireEvent.click(actionButton(label)));
    expect(screen.getByText(`${failure}: Unavailable`)).toBeTruthy();
    expect(actionButton('Save changes').disabled).toBe(false);
});

test.each(actions.slice(1))('%s still requires confirmation', async (label, api) => {
    window.confirm.mockReturnValueOnce(false);
    render(<EditGame />);
    await act(async () => {});
    fireEvent.click(actionButton(label));
    expect(api).not.toHaveBeenCalled();
});

test('a rollback reload takes precedence over a pending initial play read', async () => {
    let resolveInitial;
    getAllPlaysByGameId
        .mockReturnValueOnce(
            new Promise((resolve) => {
                resolveInitial = resolve;
            })
        )
        .mockResolvedValueOnce([{ id: 2, result: 'Reloaded play' }]);
    render(<EditGame />);
    await act(async () => {});
    await act(async () => fireEvent.click(actionButton('Rollback play')));
    await act(async () => resolveInitial([{ id: 1, result: 'Obsolete play' }]));
    expect(screen.getByText('Reloaded play')).toBeTruthy();
    expect(screen.queryByText('Obsolete play')).toBeNull();
});

test('StrictMode cleanup invalidates the first reads', async () => {
    let resolveGame;
    let resolvePlays;
    getGameById.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveGame = resolve;
        })
    );
    getAllPlaysByGameId.mockReturnValueOnce(
        new Promise((resolve) => {
            resolvePlays = resolve;
        })
    );
    render(
        <StrictMode>
            <EditGame />
        </StrictMode>
    );
    await act(async () => {});
    await act(async () => {
        resolveGame(beta);
        resolvePlays([{ id: 2, result: 'Obsolete play' }]);
    });
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Edit Game: Away A @ Home A');
    expect(screen.getByText('Play A')).toBeTruthy();
});
