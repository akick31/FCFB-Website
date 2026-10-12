/** @jest-environment jsdom */
import * as React from 'react';
import { act, renderHook } from '@testing-library/react';
import { getConferences } from '../api/conferenceApi';

jest.mock('../api/conferenceApi', () => ({ getConferences: jest.fn() }));
jest.mock('../api/teamSeasonConferenceApi', () => ({ getTeamSeasonConference: jest.fn() }));

let useConferencesMap;
let refreshConferences;
let ensureConferences;
let formatConference;

beforeEach(() => {
    jest.resetAllMocks();
    getConferences.mockResolvedValue([]);
    jest.isolateModules(() => {
        jest.doMock('react', () => React);
        jest.doMock('../api/conferenceApi', () => ({ getConferences }));
        ({
            useConferencesMap,
            refreshConferences,
            ensureConferences,
            formatConference,
        } = require('./useConferencesMap'));
    });
});

test('a pre-refresh response cannot replace the newer conference cache', async () => {
    let resolveOld;
    getConferences.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveOld = resolve;
        })
    );
    getConferences.mockResolvedValueOnce([{ code: 'NEW', label: 'New' }]);
    const { result } = renderHook(() => useConferencesMap());
    await act(async () => refreshConferences());
    expect(result.current).toEqual({ NEW: { code: 'NEW', label: 'New' } });
    await act(async () => resolveOld([{ code: 'OLD', label: 'Old' }]));
    expect(result.current).toEqual({ NEW: { code: 'NEW', label: 'New' } });
});

test('an old failure cannot clear the current refresh request', async () => {
    let rejectOld;
    let resolveNew;
    getConferences.mockReturnValueOnce(
        new Promise((resolve, reject) => {
            rejectOld = reject;
        })
    );
    getConferences.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveNew = resolve;
        })
    );
    renderHook(() => useConferencesMap());
    act(refreshConferences);
    await act(async () => rejectOld(new Error('Old request failed')));
    act(ensureConferences);
    expect(getConferences).toHaveBeenCalledTimes(2);
    await act(async () => resolveNew([{ code: 'NEW' }]));
});

test('cold subscribers share one load and warm mounts reuse the cache', async () => {
    let resolveConferences;
    getConferences.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveConferences = resolve;
        })
    );
    const first = renderHook(() => useConferencesMap());
    const second = renderHook(() => useConferencesMap());
    expect(getConferences).toHaveBeenCalledTimes(1);
    await act(async () => resolveConferences([{ code: 'ONE', label: 'One' }]));
    expect(first.result.current).toEqual({ ONE: { code: 'ONE', label: 'One' } });
    expect(second.result.current).toEqual(first.result.current);
    const warm = renderHook(() => useConferencesMap());
    await act(async () => {});
    expect(warm.result.current).toEqual(first.result.current);
    expect(getConferences).toHaveBeenCalledTimes(1);
});

test('a failed cold load can be requested again on a later mount', async () => {
    getConferences.mockRejectedValueOnce(new Error('Unavailable'));
    getConferences.mockResolvedValueOnce([{ code: 'RECOVERED' }]);
    const first = renderHook(() => useConferencesMap());
    await act(async () => {});
    first.unmount();
    const next = renderHook(() => useConferencesMap());
    await act(async () => {});
    expect(next.result.current).toEqual({ RECOVERED: { code: 'RECOVERED' } });
    expect(getConferences).toHaveBeenCalledTimes(2);
});

test('a stale success cannot expose old data or end a pending refresh', async () => {
    let resolveOld;
    let resolveNew;
    getConferences.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveOld = resolve;
        })
    );
    getConferences.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveNew = resolve;
        })
    );
    const { result } = renderHook(() => useConferencesMap());
    act(refreshConferences);
    await act(async () => resolveOld([{ code: 'OLD' }]));
    expect(result.current).toEqual({});
    act(ensureConferences);
    expect(getConferences).toHaveBeenCalledTimes(2);
    await act(async () => resolveNew([{ code: 'NEW' }]));
    expect(result.current).toEqual({ NEW: { code: 'NEW' } });
});

test('a completed request caches an empty catalog and supports an explicit refresh', async () => {
    const { result } = renderHook(() => useConferencesMap());
    await act(async () => {});
    act(ensureConferences);
    expect(getConferences).toHaveBeenCalledTimes(1);
    getConferences.mockResolvedValueOnce([{ code: 'NEW' }]);
    await act(async () => refreshConferences());
    expect(getConferences).toHaveBeenCalledTimes(2);
    expect(result.current).toEqual({ NEW: { code: 'NEW' } });
});

test('conference formatting retains missing, unknown, cached, and refreshed labels without extra requests', async () => {
    expect(formatConference(null)).toBe('-');
    expect(formatConference('SEC')).toBe('SEC');
    expect(getConferences).not.toHaveBeenCalled();
    getConferences.mockResolvedValueOnce([{ code: 'SEC', label: 'Southeastern' }]);
    renderHook(() => useConferencesMap());
    await act(async () => {});
    expect(formatConference('SEC')).toBe('Southeastern');
    expect(formatConference('UNKNOWN')).toBe('UNKNOWN');
    getConferences.mockResolvedValueOnce([{ code: 'SEC', label: 'Updated label' }]);
    await act(async () => refreshConferences());
    expect(formatConference('SEC')).toBe('Updated label');
    expect(getConferences).toHaveBeenCalledTimes(2);
});
