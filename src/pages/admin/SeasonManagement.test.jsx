/** @jest-environment jsdom */
import React, { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import SeasonManagement from './SeasonManagement';
import { getAllSeasons, startSeason, updateCurrentWeek, lockSchedule, unlockSchedule } from '../../api/seasonApi';
import { getCurrentOffseason } from '../../api/offseasonApi';
import { validateSchedule } from '../../api/scheduleApi';

jest.mock('../../api/seasonApi', () => ({
    getAllSeasons: jest.fn(),
    startSeason: jest.fn(),
    endSeason: jest.fn(),
    setCurrentSeason: jest.fn(),
    updateCurrentWeek: jest.fn(),
    lockSchedule: jest.fn(),
    unlockSchedule: jest.fn(),
}));
jest.mock('../../api/offseasonApi', () => ({
    getCurrentOffseason: jest.fn(),
    startOffseason: jest.fn(),
    endOffseason: jest.fn(),
}));
jest.mock('../../api/scheduleApi', () => ({ validateSchedule: jest.fn() }));
jest.mock('@mui/material', () => ({
    ...jest.requireActual('@mui/material'),
    Dialog: ({ open, children, onClose }) =>
        open ? (
            <div role="dialog">
                <button onClick={onClose}>Dismiss dialog</button>
                {children}
            </div>
        ) : null,
}));
jest.mock('../../components/layout/AdminLayout', () => ({
    __esModule: true,
    default: ({ children }) => <div>{children}</div>,
}));
jest.mock('../../components/ui/Panel', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }));
jest.mock('../../components/ui/DataTable', () => ({
    __esModule: true,
    default: ({ children }) => <table>{children}</table>,
}));
jest.mock('../../components/ui/StatTile', () => ({
    __esModule: true,
    default: () => null,
    TileGrid: ({ children }) => <div>{children}</div>,
}));
const seasons = [
    { seasonNumber: 12, currentSeason: false, currentWeek: 1, scheduleLocked: false },
    { seasonNumber: 11, currentSeason: true, currentWeek: 2, startDate: '2026-01-01', scheduleLocked: true },
];
beforeEach(() => {
    jest.resetAllMocks();
    getAllSeasons.mockResolvedValue(seasons);
    getCurrentOffseason.mockResolvedValue(null);
    updateCurrentWeek.mockResolvedValue(undefined);
    startSeason.mockResolvedValue(undefined);
    lockSchedule.mockResolvedValue(undefined);
    unlockSchedule.mockResolvedValue(undefined);
    validateSchedule.mockResolvedValue({ valid: true });
    jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());
const renderSeasons = async () => {
    const view = render(<SeasonManagement />);
    await act(async () => {});
    return view;
};

test('StrictMode obsolete reads cannot replace current week data', async () => {
    let resolveOld;
    getAllSeasons.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveOld = resolve;
        })
    );
    render(
        <StrictMode>
            <SeasonManagement />
        </StrictMode>
    );
    await act(async () => {});
    await act(async () => resolveOld([{ ...seasons[1], currentWeek: 9 }]));
    expect(screen.getByRole('spinbutton').value).toBe('2');
});

test('initial obsolete data cannot overwrite a successful action reload', async () => {
    let resolveOld;
    getAllSeasons
        .mockReturnValueOnce(
            new Promise((resolve) => {
                resolveOld = resolve;
            })
        )
        .mockResolvedValueOnce(seasons)
        .mockResolvedValueOnce([{ ...seasons[1], currentWeek: 3 }]);
    render(
        <StrictMode>
            <SeasonManagement />
        </StrictMode>
    );
    await act(async () => {});
    await act(async () => fireEvent.click(screen.getByRole('button', { name: /Move to next week/ })));
    await act(async () => resolveOld([{ ...seasons[1], currentWeek: 9 }]));
    expect(updateCurrentWeek).toHaveBeenCalledWith(11, 3);
    expect(screen.getByRole('spinbutton').value).toBe('3');
});

test('a reload retains a week draft edited while its write was pending', async () => {
    let resolveWrite;
    updateCurrentWeek.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveWrite = resolve;
        })
    );
    getAllSeasons.mockResolvedValueOnce(seasons).mockResolvedValueOnce([{ ...seasons[1], currentWeek: 3 }]);
    await renderSeasons();
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save week' }));
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '4' } });
    await act(async () => resolveWrite());
    expect(screen.getByRole('spinbutton').value).toBe('4');
    expect(updateCurrentWeek).toHaveBeenCalledWith(11, 3);
    expect(screen.getByRole('button', { name: 'Save week' }).disabled).toBe(false);
});

test('older validation failure cannot dismiss or finish a newer validation', async () => {
    let rejectOld;
    let resolveCurrent;
    validateSchedule
        .mockReturnValueOnce(
            new Promise((resolve, reject) => {
                rejectOld = reject;
            })
        )
        .mockReturnValueOnce(
            new Promise((resolve) => {
                resolveCurrent = resolve;
            })
        );
    await renderSeasons();
    fireEvent.click(screen.getByRole('button', { name: 'Validate pending schedule' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    fireEvent.click(screen.getByRole('button', { name: 'Validate pending schedule' }));
    await act(async () => rejectOld(new Error('Old validation failed')));
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByRole('progressbar')).toBeTruthy();
    expect(screen.queryByText('Old validation failed')).toBeNull();
    expect(console.error).not.toHaveBeenCalled();
    await act(async () => resolveCurrent({ valid: true }));
    expect(screen.getByText(/Every active team has a game scheduled/)).toBeTruthy();
    expect(validateSchedule.mock.calls).toEqual([[12], [12]]);
});

test('validation completion after closing cannot replace the next result', async () => {
    let resolveOld;
    validateSchedule.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveOld = resolve;
        })
    );
    await renderSeasons();
    fireEvent.click(screen.getByRole('button', { name: 'Validate pending schedule' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss dialog' }));
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Validate pending schedule' })));
    await act(async () => resolveOld({ valid: false, incompleteTeams: [{ team: 'Obsolete', missingWeeks: [1] }] }));
    expect(screen.queryByText('Obsolete')).toBeNull();
    expect(screen.getByText(/Every active team has a game scheduled/)).toBeTruthy();
});

test('lock operations preserve their endpoint choices and reload data', async () => {
    await renderSeasons();
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Locked' })));
    expect(unlockSchedule).toHaveBeenCalledWith(11);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Unlocked' })));
    expect(lockSchedule).toHaveBeenCalledWith(12);
    expect(getAllSeasons).toHaveBeenCalledTimes(3);
});

test('current action failures retain the message and fixed diagnostic', async () => {
    updateCurrentWeek.mockRejectedValueOnce(new Error('Week update failed'));
    await renderSeasons();
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Save week' })));
    expect(screen.getByText('Week update failed')).toBeTruthy();
    expect(console.error.mock.calls).toEqual([['Season action failed']]);
});

test('a start completed after unmount cannot reload the page', async () => {
    let resolveStart;
    startSeason.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveStart = resolve;
        })
    );
    const { unmount } = await renderSeasons();
    fireEvent.click(screen.getByRole('button', { name: 'Start season 12' }));
    fireEvent.click(screen.getByRole('button', { name: 'Start season' }));
    unmount();
    await act(async () => resolveStart());
    expect(startSeason).toHaveBeenCalledWith();
    expect(getAllSeasons).toHaveBeenCalledTimes(1);
});
