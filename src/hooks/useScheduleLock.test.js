/** @jest-environment jsdom */
import { act, renderHook, waitFor } from '@testing-library/react';
import useScheduleLock from './useScheduleLock';
import { isScheduleLocked } from '../api/seasonApi';

jest.mock('../api/seasonApi', () => ({ isScheduleLocked: jest.fn() }));

beforeEach(() => {
    jest.resetAllMocks();
});

test('keeps editing blocked until the current season is confirmed unlocked', async () => {
    let resolve;
    isScheduleLocked.mockReturnValue(
        new Promise((done) => {
            resolve = done;
        })
    );
    const { result } = renderHook(() => useScheduleLock(12));
    expect(result.current.scheduleLocked).toBe(true);
    expect(result.current.lockStatusKnown).toBe(false);
    await act(async () => {
        resolve(false);
    });
    expect(result.current.scheduleLocked).toBe(false);
    expect(result.current.lockStatusKnown).toBe(true);
});

test('reports a failed lookup without treating the schedule as unlocked', async () => {
    const error = new Error('Lock service unavailable');
    isScheduleLocked.mockRejectedValue(error);
    const { result } = renderHook(() => useScheduleLock(12));
    await waitFor(() => expect(result.current.lockError).toBe(error));
    expect(result.current.scheduleLocked).toBe(true);
    expect(result.current.lockStatusKnown).toBe(false);
});

test('preserves a confirmed locked response', async () => {
    isScheduleLocked.mockResolvedValue(true);
    const { result } = renderHook(() => useScheduleLock(12));
    await waitFor(() => expect(result.current.lockStatusKnown).toBe(true));
    expect(result.current.scheduleLocked).toBe(true);
});

test('does not let an old season response unlock the new season', async () => {
    let resolvePrevious;
    let rejectCurrent;
    isScheduleLocked
        .mockReturnValueOnce(
            new Promise((resolve) => {
                resolvePrevious = resolve;
            })
        )
        .mockReturnValueOnce(
            new Promise((resolve, reject) => {
                rejectCurrent = reject;
            })
        );
    const { result, rerender } = renderHook(({ season }) => useScheduleLock(season), { initialProps: { season: 12 } });
    rerender({ season: 13 });
    await act(async () => {
        resolvePrevious(false);
        rejectCurrent(new Error('Unavailable'));
    });
    expect(result.current.scheduleLocked).toBe(true);
    expect(result.current.lockStatusKnown).toBe(false);
});

test('does not reuse an unlocked status when switching seasons', async () => {
    isScheduleLocked.mockResolvedValueOnce(false).mockReturnValueOnce(new Promise(() => {}));
    const { result, rerender } = renderHook(({ season }) => useScheduleLock(season), { initialProps: { season: 12 } });
    await waitFor(() => expect(result.current.scheduleLocked).toBe(false));
    rerender({ season: 13 });
    expect(result.current.scheduleLocked).toBe(true);
});

test('disabled editors make no lock request and require a fresh lookup when enabled', async () => {
    isScheduleLocked.mockResolvedValueOnce(false).mockReturnValueOnce(new Promise(() => {}));
    const { result, rerender } = renderHook(({ enabled }) => useScheduleLock(12, enabled), {
        initialProps: { enabled: false },
    });
    expect(isScheduleLocked).not.toHaveBeenCalled();
    rerender({ enabled: true });
    await waitFor(() => expect(result.current.scheduleLocked).toBe(false));
    rerender({ enabled: false });
    rerender({ enabled: true });
    expect(result.current.scheduleLocked).toBe(true);
    expect(isScheduleLocked).toHaveBeenCalledTimes(2);
});

test('ignores a pending lock response after unmount', async () => {
    let resolve;
    isScheduleLocked.mockReturnValue(
        new Promise((done) => {
            resolve = done;
        })
    );
    const { result, unmount } = renderHook(() => useScheduleLock(12));
    unmount();
    await act(async () => {
        resolve(false);
    });
    expect(result.current.lockStatusKnown).toBe(false);
});

test('rejects a malformed response rather than enabling editing', async () => {
    isScheduleLocked.mockResolvedValue(null);
    const { result } = renderHook(() => useScheduleLock(12));
    await waitFor(() => expect(result.current.lockError).toBeInstanceOf(Error));
    expect(result.current.scheduleLocked).toBe(true);
    expect(result.current.lockStatusKnown).toBe(false);
});

test('ignores lock updates captured for a previous season', async () => {
    isScheduleLocked.mockResolvedValue(true);
    const { result, rerender } = renderHook(({ season }) => useScheduleLock(season), { initialProps: { season: 12 } });
    await waitFor(() => expect(result.current.lockStatusKnown).toBe(true));
    const previousSetter = result.current.setScheduleLocked;
    rerender({ season: 13 });
    await waitFor(() => expect(result.current.lockStatusKnown).toBe(true));
    act(() => previousSetter(false));
    expect(result.current.scheduleLocked).toBe(true);
});
