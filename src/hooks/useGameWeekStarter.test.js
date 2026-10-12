/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import useGameWeekStarter from './useGameWeekStarter';
import { getScheduleBySeasonAndWeek, startGameWeek, getGameWeekJobStatus, retryFailedGames } from '../api/scheduleApi';

jest.mock('../api/scheduleApi', () => ({
    getScheduleBySeasonAndWeek: jest.fn(),
    startGameWeek: jest.fn(),
    getGameWeekJobStatus: jest.fn(),
    retryFailedGames: jest.fn(),
}));

beforeEach(() => {
    jest.useFakeTimers();
    jest.resetAllMocks();
    getScheduleBySeasonAndWeek.mockResolvedValue([]);
    startGameWeek.mockResolvedValue({ jobId: 'first' });
});

afterEach(() => {
    jest.useRealTimers();
});

test('does not overlap job status requests when a poll takes longer than the interval', async () => {
    getGameWeekJobStatus.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useGameWeekStarter(12, 1));
    await act(async () => {});
    await act(async () => {
        await result.current.handleStartWeek();
    });
    expect(getGameWeekJobStatus).toHaveBeenCalledTimes(1);
    await act(async () => {
        jest.advanceTimersByTime(9000);
    });
    expect(getGameWeekJobStatus).toHaveBeenCalledTimes(1);
});

test('ignores a week schedule response from an older selection', async () => {
    let resolveOld;
    getScheduleBySeasonAndWeek
        .mockReturnValueOnce(
            new Promise((resolve) => {
                resolveOld = resolve;
            })
        )
        .mockResolvedValueOnce([{ id: 'current' }]);
    const { result, rerender } = renderHook(({ week }) => useGameWeekStarter(12, week), { initialProps: { week: 1 } });
    await act(async () => {
        rerender({ week: 2 });
    });
    expect(result.current.weekSchedule).toEqual([{ id: 'current' }]);
    await act(async () => {
        resolveOld([{ id: 'old' }]);
    });
    expect(result.current.weekSchedule).toEqual([{ id: 'current' }]);
});

test('ignores old job results after starting a replacement job', async () => {
    let resolveOld;
    getGameWeekJobStatus
        .mockReturnValueOnce(
            new Promise((resolve) => {
                resolveOld = resolve;
            })
        )
        .mockResolvedValue({ status: 'RUNNING', job: 'second' });
    retryFailedGames.mockResolvedValue({ jobId: 'second' });
    const { result } = renderHook(() => useGameWeekStarter(12, 1));
    await act(async () => {});
    await act(async () => {
        await result.current.handleStartWeek();
    });
    await act(async () => {
        await result.current.handleRetryFailed();
    });
    expect(result.current.jobData.job).toBe('second');
    await act(async () => {
        resolveOld({ status: 'COMPLETED', job: 'first' });
    });
    expect(result.current.jobData.job).toBe('second');
    expect(result.current.isStarting).toBe(true);
});

test('does not launch polling if the start request resolves after unmount', async () => {
    let resolveStart;
    startGameWeek.mockReturnValue(
        new Promise((resolve) => {
            resolveStart = resolve;
        })
    );
    const { result, unmount } = renderHook(() => useGameWeekStarter(12, 1));
    await act(async () => {});
    let request;
    act(() => {
        request = result.current.handleStartWeek();
    });
    unmount();
    await act(async () => {
        resolveStart({ jobId: 'late' });
        await request;
    });
    expect(getGameWeekJobStatus).not.toHaveBeenCalled();
    await act(async () => {
        jest.advanceTimersByTime(9000);
    });
    expect(getGameWeekJobStatus).not.toHaveBeenCalled();
});
