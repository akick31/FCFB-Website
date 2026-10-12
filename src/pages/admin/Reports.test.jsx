/** @jest-environment jsdom */
import React from 'react';
import { act, render, screen } from '@testing-library/react';
import Reports from './Reports';
import { getEntireCoachTransactionLog } from '../../api/coachTransactionLogApi';
import { getUserDelayOfGameInstances } from '../../api/playApi';
import { getAllSeasons, getCurrentSeasonOrLatest, getCurrentWeekOrLatest } from '../../api/seasonApi';

let mockParams;
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useSearchParams: () => [mockParams, jest.fn()],
}));
jest.mock('../../api/coachTransactionLogApi', () => ({ getEntireCoachTransactionLog: jest.fn() }));
jest.mock('../../api/playApi', () => ({ getUserDelayOfGameInstances: jest.fn() }));
jest.mock('../../api/seasonApi', () => ({
    getAllSeasons: jest.fn(),
    getCurrentSeasonOrLatest: jest.fn(),
    getCurrentWeekOrLatest: jest.fn(),
}));
jest.mock('../../hooks/useTeamsMap', () => ({ useTeamsMap: () => ({}) }));
jest.mock('../../hooks/useConferencesMap', () => ({ conferenceLabel: (code) => code }));
jest.mock('../../components/layout/AdminLayout', () => ({
    __esModule: true,
    default: ({ children }) => <div>{children}</div>,
}));
jest.mock('../../components/ui/Panel', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }));
jest.mock('../../components/ui/DataTable', () => ({
    __esModule: true,
    default: ({ children }) => <table>{children}</table>,
}));
jest.mock('../../components/ui/SelectPill', () => ({
    __esModule: true,
    default: ({ label, value, options }) => (
        <select aria-label={label} value={value} onChange={() => {}}>
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    ),
}));
jest.mock('../../components/ui/SegTabs', () => ({ __esModule: true, default: () => null }));
jest.mock('../../components/ui/TeamMark', () => ({ __esModule: true, default: () => null }));
const firstUser = { username: 'First', role: 'ADMIN' };
const secondUser = { username: 'Second', role: 'ADMIN' };
const transaction = (team) => ({
    team,
    coach: ['Coach'],
    position: 'HEAD_COACH',
    transaction: 'HIRED',
    processed_by: 'Admin',
});
beforeEach(() => {
    jest.resetAllMocks();
    mockParams = new URLSearchParams('report=coach-transactions');
    getEntireCoachTransactionLog.mockResolvedValue([transaction('Current')]);
    getAllSeasons.mockResolvedValue([{ season_number: 12 }]);
    getCurrentSeasonOrLatest.mockResolvedValue(12);
    getCurrentWeekOrLatest.mockResolvedValue(3);
    getUserDelayOfGameInstances.mockResolvedValue([]);
    jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

test('a prior user-load response cannot replace current report transactions', async () => {
    let resolveOld;
    getEntireCoachTransactionLog.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveOld = resolve;
        })
    );
    const { rerender } = render(<Reports user={firstUser} />);
    await act(async () => rerender(<Reports user={secondUser} />));
    await act(async () => resolveOld([transaction('Obsolete')]));
    expect(screen.getByRole('cell', { name: 'Current' })).toBeTruthy();
    expect(screen.queryByText('Obsolete')).toBeNull();
});

test('obsolete transaction failure cannot end current loading or surface feedback', async () => {
    let rejectOld;
    getEntireCoachTransactionLog
        .mockReturnValueOnce(
            new Promise((resolve, reject) => {
                rejectOld = reject;
            })
        )
        .mockReturnValueOnce(new Promise(() => {}));
    const { rerender } = render(<Reports user={firstUser} />);
    await act(async () => rerender(<Reports user={secondUser} />));
    await act(async () => rejectOld(new Error('Obsolete failure')));
    expect(screen.getByRole('progressbar')).toBeTruthy();
    expect(console.error).not.toHaveBeenCalled();
});

test('a new successful transaction load clears a previous failure', async () => {
    getEntireCoachTransactionLog.mockRejectedValueOnce({ message: 'sensitive transport detail' });
    const { rerender } = render(<Reports user={firstUser} />);
    await act(async () => {});
    expect(screen.getByText('Failed to load coach transaction log')).toBeTruthy();
    expect(console.error.mock.calls).toEqual([['Failed to fetch transactions']]);
    await act(async () => rerender(<Reports user={secondUser} />));
    expect(screen.getByRole('cell', { name: 'Current' })).toBeTruthy();
    expect(screen.queryByText('Failed to load coach transaction log')).toBeNull();
});

test('old season defaults cannot replace the new user-load period', async () => {
    let resolveOldSeason;
    getCurrentSeasonOrLatest.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveOldSeason = resolve;
        })
    );
    mockParams = new URLSearchParams('report=delay-of-game');
    const { rerender } = render(<Reports user={firstUser} />);
    await act(async () => rerender(<Reports user={secondUser} />));
    await act(async () => resolveOldSeason(11));
    expect(getUserDelayOfGameInstances).toHaveBeenLastCalledWith(12, 3);
    expect(getUserDelayOfGameInstances.mock.calls.some(([season]) => season === 11)).toBe(false);
});

test('obsolete season lookup failures retain fallback handling without logging', async () => {
    let rejectOldSeasons;
    getAllSeasons.mockReturnValueOnce(
        new Promise((resolve, reject) => {
            rejectOldSeasons = reject;
        })
    );
    const { rerender } = render(<Reports user={firstUser} />);
    await act(async () => rerender(<Reports user={secondUser} />));
    await act(async () => rejectOldSeasons({ message: 'sensitive transport detail' }));
    expect(console.error).not.toHaveBeenCalled();
    expect(screen.getByRole('cell', { name: 'Current' })).toBeTruthy();
});

test('delay report preserves full-season request arguments and ignores replaced-period rows', async () => {
    let resolveOldRows;
    getUserDelayOfGameInstances.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveOldRows = resolve;
        })
    );
    mockParams = new URLSearchParams('report=delay-of-game&season=12&week=full-season');
    const { rerender } = render(<Reports user={firstUser} />);
    await act(async () => {});
    mockParams = new URLSearchParams('report=delay-of-game&season=12&week=2');
    await act(async () => rerender(<Reports user={firstUser} />));
    await act(async () => resolveOldRows([{ username: 'Obsolete', delay_of_game_instances: 99 }]));
    expect(getUserDelayOfGameInstances).toHaveBeenCalledWith(12, null);
    expect(getUserDelayOfGameInstances).toHaveBeenLastCalledWith(12, 2);
    expect(screen.queryByText('Obsolete')).toBeNull();
});

test('role changes retain the existing redirect and stop applying pending report loads', async () => {
    let resolveOld;
    getEntireCoachTransactionLog.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveOld = resolve;
        })
    );
    const { rerender } = render(<Reports user={firstUser} />);
    await act(async () => rerender(<Reports user={{ username: 'First', role: 'USER' }} />));
    await act(async () => resolveOld([transaction('Obsolete')]));
    expect(mockNavigate).toHaveBeenCalledWith('*');
    expect(getEntireCoachTransactionLog).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Obsolete')).toBeNull();
});
