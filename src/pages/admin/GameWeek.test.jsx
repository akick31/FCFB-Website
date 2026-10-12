/** @jest-environment jsdom */
import React, { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import GameWeek from './GameWeek';
import { getCurrentSeasonOrLatest } from '../../api/seasonApi';
import { getScheduleBySeasonAndWeek, getGameWeekJobStatus, startGameWeek } from '../../api/scheduleApi';

jest.mock('react-router-dom', () => ({
    useSearchParams: () => [new URLSearchParams('season=12&week=1&selectedWeek=1'), jest.fn()],
}));
jest.mock('../../components/layout/AdminLayout', () => ({ __esModule: true, default: ({ children }) => children }));
jest.mock('../../utils/formatText', () => ({ weekLabel: (week) => `Week ${week}` }));
jest.mock('../../api/seasonApi', () => ({
    getCurrentSeasonOrLatest: jest.fn().mockResolvedValue(12),
    getCurrentWeekOrLatest: jest.fn().mockResolvedValue(1),
}));
jest.mock('../../api/scheduleApi', () => ({
    getScheduleBySeasonAndWeek: jest.fn(),
    getGameWeekJobStatus: jest.fn(),
    startGameWeek: jest.fn(),
    retryFailedGames: jest.fn(),
}));

beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    getCurrentSeasonOrLatest.mockReset().mockResolvedValue(12);
    getScheduleBySeasonAndWeek.mockResolvedValue([{ id: 1, homeTeam: 'Home', awayTeam: 'Away', started: false }]);
    startGameWeek.mockResolvedValue({ jobId: 'first' });
});
afterEach(() => jest.useRealTimers());

const startWeek = async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Start week 1' }));
    await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Start Week 1' }));
    });
    await act(async () => {
        jest.advanceTimersByTime(300);
    });
};

test('page polling does not overlap slow status requests', async () => {
    getGameWeekJobStatus.mockReturnValue(new Promise(() => {}));
    render(<GameWeek />);
    await act(async () => {});
    await startWeek();
    await act(async () => {
        jest.advanceTimersByTime(9000);
    });
    expect(getGameWeekJobStatus).toHaveBeenCalledTimes(1);
});

test('changing weeks cancels the prior job and ignores its late status', async () => {
    let resolveOld;
    getGameWeekJobStatus.mockReturnValue(
        new Promise((resolve) => {
            resolveOld = resolve;
        })
    );
    render(<GameWeek />);
    await act(async () => {});
    await startWeek();
    await act(async () => {
        fireEvent.change(screen.getByRole('combobox'), { target: { value: '2' } });
    });
    await act(async () => {
        resolveOld({ status: 'COMPLETED', logs: [{ message: 'old-job' }], totalGames: 1 });
    });
    expect(screen.queryByText(/old-job/)).toBeNull();
    expect(screen.getByRole('button', { name: 'Start week 2' })).toBeTruthy();
    await act(async () => {
        jest.advanceTimersByTime(9000);
    });
    expect(getGameWeekJobStatus).toHaveBeenCalledTimes(1);
});

test('a late schedule response cannot overwrite the newly selected week', async () => {
    let resolveOld;
    getScheduleBySeasonAndWeek
        .mockReturnValueOnce(
            new Promise((resolve) => {
                resolveOld = resolve;
            })
        )
        .mockResolvedValueOnce([{ id: 2, homeTeam: 'Current Home', awayTeam: 'Current Away', started: false }]);
    render(<GameWeek />);
    await act(async () => {});
    await act(async () => {
        fireEvent.change(screen.getByRole('combobox'), { target: { value: '2' } });
    });
    expect(screen.getByText('Current Home')).toBeTruthy();
    await act(async () => {
        resolveOld([{ id: 1, homeTeam: 'Old Home', awayTeam: 'Old Away', started: false }]);
    });
    expect(screen.getByText('Current Home')).toBeTruthy();
    expect(screen.queryByText('Old Home')).toBeNull();
});

test('interrupted job shows unfinished games without claiming success or enabling failure retry', async () => {
    getGameWeekJobStatus.mockResolvedValue({
        status: 'FAILED',
        totalGames: 3,
        startedGames: 1,
        failedGames: 0,
        currentIndex: 1,
        logs: [],
    });
    render(<GameWeek />);
    await act(async () => {});
    await startWeek();
    expect(screen.getByText(/Processing stopped with 2 games unfinished/)).toBeTruthy();
    expect(screen.queryByText(/started successfully/)).toBeNull();
    expect(screen.queryByRole('button', { name: /Retry .* failed/ })).toBeNull();
});

test('discarded initialization failure cannot replace the current game week', async () => {
    let rejectOlder;
    getCurrentSeasonOrLatest.mockReturnValueOnce(
        new Promise((resolve, reject) => {
            rejectOlder = reject;
        })
    );
    render(
        <StrictMode>
            <GameWeek />
        </StrictMode>
    );
    await act(async () => {});
    await act(async () => rejectOlder(new Error('Obsolete initialization')));
    expect(screen.queryByText('Obsolete initialization')).toBeNull();
    expect(screen.getByRole('button', { name: 'Start week 1' })).toBeTruthy();
});

test('discarded initialization completion cannot finish the newer loader', async () => {
    let resolveOlder;
    let resolveCurrent;
    getCurrentSeasonOrLatest
        .mockReturnValueOnce(
            new Promise((resolve) => {
                resolveOlder = resolve;
            })
        )
        .mockReturnValueOnce(
            new Promise((resolve) => {
                resolveCurrent = resolve;
            })
        );
    render(
        <StrictMode>
            <GameWeek />
        </StrictMode>
    );
    await act(async () => resolveOlder(12));
    expect(screen.getByRole('progressbar')).toBeTruthy();
    await act(async () => resolveCurrent(12));
    expect(screen.getByRole('button', { name: 'Start week 1' })).toBeTruthy();
});
