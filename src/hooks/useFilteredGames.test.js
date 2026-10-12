/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import useFilteredGames from './useFilteredGames';
import { getFilteredGames } from '../api/gameApi';

jest.mock('../api/gameApi', () => ({ getFilteredGames: jest.fn() }));

beforeEach(() => {
    jest.resetAllMocks();
    getFilteredGames.mockResolvedValue({ content: [], totalElements: 0 });
});

test('ignores an older page response and retains the current total', async () => {
    let resolveOld;
    getFilteredGames
        .mockReturnValueOnce(
            new Promise((resolve) => {
                resolveOld = resolve;
            })
        )
        .mockResolvedValue({ content: [{ id: 'current' }], totalElements: 101 });
    const { result } = renderHook(() => useFilteredGames(12, 1));
    await act(async () => result.current.handlePageChange(1));
    await act(async () => resolveOld({ content: [{ id: 'old' }], totalElements: 1 }));
    expect(result.current.filteredGames).toEqual([{ id: 'current' }]);
    expect(result.current.totalGames).toBe(101);
    expect(result.current.currentPage).toBe(1);
});

test('a previously captured refetch uses the latest filters and page', async () => {
    const { result } = renderHook(() => useFilteredGames(12, 1));
    const refetch = result.current.refetch;
    await act(async () => result.current.handleFilterChange('week', 2));
    await act(async () => result.current.handlePageChange(3));
    await act(async () => refetch());
    expect(getFilteredGames).toHaveBeenLastCalledWith(expect.objectContaining({ season: 12, week: 2, page: 3 }));
});

test('changing an error callback does not repeat the initial read', async () => {
    const { rerender } = renderHook(({ onError }) => useFilteredGames(12, 1, onError), {
        initialProps: { onError: jest.fn() },
    });
    await act(async () => {});
    rerender({ onError: jest.fn() });
    expect(getFilteredGames).toHaveBeenCalledTimes(1);
});

test('obsolete failures do not surface errors or stop a newer request loading', async () => {
    let rejectOld;
    getFilteredGames
        .mockReturnValueOnce(
            new Promise((resolve, reject) => {
                rejectOld = reject;
            })
        )
        .mockReturnValue(new Promise(() => {}));
    const onError = jest.fn();
    const { result } = renderHook(() => useFilteredGames(12, 1, onError));
    act(() => result.current.handleFilterChange('week', 2));
    await act(async () => rejectOld(new Error('old')));
    expect(onError).not.toHaveBeenCalled();
    expect(result.current.gamesLoading).toBe(true);
});

test('does not request games before defaults exist', () => {
    const { result } = renderHook(() => useFilteredGames(null, null));
    expect(getFilteredGames).not.toHaveBeenCalled();
    expect(result.current.gamesLoading).toBe(false);
});

test('ignores failures after unmount', async () => {
    let reject;
    getFilteredGames.mockReturnValue(
        new Promise((resolve, rejectRequest) => {
            reject = rejectRequest;
        })
    );
    const onError = jest.fn();
    const { unmount } = renderHook(() => useFilteredGames(12, 1, onError));
    unmount();
    await act(async () => reject(new Error('late')));
    expect(onError).not.toHaveBeenCalled();
});
