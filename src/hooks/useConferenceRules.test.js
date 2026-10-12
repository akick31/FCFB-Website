/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import useConferenceRules from './useConferenceRules';
import { getConferenceRules, saveConferenceRules } from '../api/scheduleApi';

jest.mock('../api/scheduleApi', () => ({ getConferenceRules: jest.fn(), saveConferenceRules: jest.fn() }));
const firstRules = {
    numConferenceGames: 8,
    protectedRivalries: [{ team1: 'A', team2: 'B', week: 1 }],
    divisions: ['East', 'West'],
};
const secondRules = {
    numConferenceGames: 7,
    protectedRivalries: [{ team1: 'C', team2: 'D', week: 2 }],
    divisions: ['North', 'South'],
};
let onError;
let onSuccess;

beforeEach(() => {
    jest.resetAllMocks();
    onError = jest.fn();
    onSuccess = jest.fn();
    getConferenceRules.mockImplementation(async (code) => (code === 'FIRST' ? firstRules : secondRules));
    saveConferenceRules.mockResolvedValue({});
    jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

const renderRules = (options = {}) =>
    renderHook(({ code }) => useConferenceRules({ code, onError, onSuccess }), {
        initialProps: { code: 'FIRST' },
        ...options,
    });

test('a stale rules response cannot replace the selected conference', async () => {
    let resolveOld;
    getConferenceRules
        .mockReturnValueOnce(
            new Promise((resolve) => {
                resolveOld = resolve;
            })
        )
        .mockResolvedValueOnce(secondRules);
    const { result, rerender } = renderRules();
    await act(async () => rerender({ code: 'SECOND' }));
    await act(async () => resolveOld(firstRules));
    expect(result.current.numConferenceGames).toBe(7);
    expect(result.current.protectedRivalries).toEqual(secondRules.protectedRivalries);
    expect(result.current.divisions).toEqual(secondRules.divisions);
});

test('obsolete failure cannot reset new rules or clear loading', async () => {
    let rejectOld;
    getConferenceRules
        .mockReturnValueOnce(
            new Promise((resolve, reject) => {
                rejectOld = reject;
            })
        )
        .mockReturnValueOnce(new Promise(() => {}));
    const { result, rerender } = renderRules();
    rerender({ code: 'SECOND' });
    await act(async () => rejectOld(new Error('old failure')));
    expect(result.current.rulesLoading).toBe(true);
    expect(console.error).not.toHaveBeenCalled();
});

test('switching conferences clears previously loaded editing values while the new rules are pending', async () => {
    getConferenceRules.mockResolvedValueOnce(firstRules).mockReturnValueOnce(new Promise(() => {}));
    const { result, rerender } = renderRules();
    await act(async () => {});
    rerender({ code: 'SECOND' });
    expect(result.current.numConferenceGames).toBe(9);
    expect(result.current.protectedRivalries).toEqual([]);
    expect(result.current.divisions).toEqual([]);
    expect(result.current.rulesLoading).toBe(true);
});

test('current missing rules retain the established defaults', async () => {
    getConferenceRules.mockResolvedValue(null);
    const { result } = renderRules();
    await act(async () => {});
    expect(result.current.numConferenceGames).toBe(9);
    expect(result.current.protectedRivalries).toEqual([]);
    expect(result.current.divisions).toEqual([]);
    expect(result.current.rulesLoading).toBe(false);
});

test('a rivalry removal completion cannot edit another conference', async () => {
    let resolveSave;
    saveConferenceRules.mockReturnValue(
        new Promise((resolve) => {
            resolveSave = resolve;
        })
    );
    const { result, rerender } = renderRules();
    await act(async () => {});
    let removal;
    act(() => {
        removal = result.current.removeRivalry(0);
    });
    expect(saveConferenceRules).toHaveBeenCalledWith('FIRST', 8, []);
    await act(async () => rerender({ code: 'SECOND' }));
    await act(async () => {
        resolveSave({});
        await removal;
    });
    expect(result.current.protectedRivalries).toEqual(secondRules.protectedRivalries);
});

test('current rivalry removal preserves the existing save parameters and result', async () => {
    const { result } = renderRules();
    await act(async () => {});
    await act(async () => result.current.removeRivalry(0));
    expect(saveConferenceRules).toHaveBeenCalledWith('FIRST', 8, []);
    expect(result.current.protectedRivalries).toEqual([]);
});

test('old division-disable success cannot clear another conference divisions or report success', async () => {
    let resolveSave;
    saveConferenceRules.mockReturnValue(
        new Promise((resolve) => {
            resolveSave = resolve;
        })
    );
    const { result, rerender } = renderRules();
    await act(async () => {});
    let disabling;
    act(() => {
        disabling = result.current.toggleDivisions(false);
    });
    expect(saveConferenceRules).toHaveBeenCalledWith('FIRST', 8, firstRules.protectedRivalries, []);
    await act(async () => rerender({ code: 'SECOND' }));
    await act(async () => {
        resolveSave({});
        await disabling;
    });
    expect(result.current.divisions).toEqual(secondRules.divisions);
    expect(onSuccess).not.toHaveBeenCalled();
});

test('an obsolete division save cannot clear a current save or report failure', async () => {
    let rejectOld;
    let resolveCurrent;
    saveConferenceRules
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
    const { result, rerender } = renderRules();
    await act(async () => {});
    let oldSave;
    act(() => {
        oldSave = result.current.saveDivisions();
    });
    await act(async () => rerender({ code: 'SECOND' }));
    expect(result.current.savingDivisions).toBe(false);
    let currentSave;
    act(() => {
        currentSave = result.current.saveDivisions();
    });
    onError.mockClear();
    onSuccess.mockClear();
    await act(async () => {
        rejectOld(new Error('old failure'));
        await oldSave;
    });
    expect(onError).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.savingDivisions).toBe(true);
    await act(async () => {
        resolveCurrent({});
        await currentSave;
    });
    expect(result.current.savingDivisions).toBe(false);
    expect(onSuccess).toHaveBeenCalledWith('Divisions saved');
});

test('current division save failure keeps the original error and clears saving', async () => {
    saveConferenceRules.mockRejectedValue(new Error('Rejected'));
    const { result } = renderRules();
    await act(async () => {});
    await act(async () => result.current.saveDivisions());
    expect(onError).toHaveBeenLastCalledWith('Rejected');
    expect(result.current.savingDivisions).toBe(false);
    expect(result.current.divisions).toEqual(firstRules.divisions);
});

test('save completion after unmount invokes no result callbacks', async () => {
    let resolveSave;
    saveConferenceRules.mockReturnValue(
        new Promise((resolve) => {
            resolveSave = resolve;
        })
    );
    const { result, unmount } = renderRules();
    await act(async () => {});
    let saving;
    act(() => {
        saving = result.current.saveDivisions();
    });
    onSuccess.mockClear();
    unmount();
    await act(async () => {
        resolveSave({});
        await saving;
    });
    expect(onSuccess).not.toHaveBeenCalled();
});

test('StrictMode replay invalidates the discarded read', async () => {
    let resolveOld;
    getConferenceRules
        .mockReturnValueOnce(
            new Promise((resolve) => {
                resolveOld = resolve;
            })
        )
        .mockResolvedValueOnce(secondRules);
    const { result } = renderRules({ reactStrictMode: true });
    await act(async () => {});
    await act(async () => resolveOld(firstRules));
    expect(result.current.numConferenceGames).toBe(7);
    expect(result.current.divisions).toEqual(secondRules.divisions);
    expect(getConferenceRules).toHaveBeenCalledTimes(2);
});
