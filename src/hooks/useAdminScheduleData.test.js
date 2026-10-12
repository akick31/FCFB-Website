/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import useAdminScheduleData from './useAdminScheduleData';
import {
    getScheduleBySeason,
    getConferenceSchedule,
    getConferenceRules,
    getScheduleBySeasonAndTeam,
    getPostseasonSchedule,
} from '../api/scheduleApi';

jest.mock('../api/scheduleApi', () => ({
    getScheduleBySeason: jest.fn(),
    getConferenceSchedule: jest.fn(),
    getConferenceRules: jest.fn(),
    getScheduleBySeasonAndTeam: jest.fn(),
    getPostseasonSchedule: jest.fn(),
}));

const props = { season: 12, selectedConference: 'ACC', selectedTeam: { name: 'Home' }, tab: 'conference' };
const cases = [
    [
        'conference',
        getConferenceSchedule,
        props,
        { ...props, selectedConference: 'SEC' },
        'conferenceSchedule',
        [{ id: 'new' }],
        [{ id: 'old' }],
    ],
    [
        'full season',
        getScheduleBySeason,
        props,
        { ...props, season: 13 },
        'allSeasonSchedule',
        [{ id: 'new' }],
        [{ id: 'old' }],
    ],
    [
        'team',
        getScheduleBySeasonAndTeam,
        { ...props, tab: 'team' },
        { ...props, tab: 'team', selectedTeam: { name: 'Away' } },
        'teamFullSchedule',
        [{ id: 'new', week: 1 }],
        [{ id: 'old', week: 1 }],
    ],
    [
        'postseason',
        getPostseasonSchedule,
        { ...props, tab: 'postseason' },
        { ...props, tab: 'postseason', season: 13 },
        'postseasonSchedule',
        [{ id: 'new' }],
        [{ id: 'old' }],
    ],
    [
        'rules',
        getConferenceRules,
        props,
        { ...props, selectedConference: 'SEC' },
        'numConferenceGames',
        { numConferenceGames: 8 },
        { numConferenceGames: 5 },
    ],
];

beforeEach(() => {
    jest.resetAllMocks();
    getScheduleBySeason.mockResolvedValue([]);
    getConferenceSchedule.mockResolvedValue([]);
    getConferenceRules.mockResolvedValue({ numConferenceGames: 9, protectedRivalries: [], divisions: [] });
    getScheduleBySeasonAndTeam.mockResolvedValue([]);
    getPostseasonSchedule.mockResolvedValue([]);
});

test.each(cases)(
    'ignores a stale %s response after selection changes',
    async (_, load, initialProps, nextProps, field, currentData, oldData) => {
        let resolveOld;
        load.mockReturnValueOnce(
            new Promise((resolve) => {
                resolveOld = resolve;
            })
        ).mockResolvedValueOnce(currentData);
        const { result, rerender } = renderHook(useAdminScheduleData, { initialProps });
        await act(async () => {
            rerender(nextProps);
        });
        const expected = field === 'numConferenceGames' ? currentData.numConferenceGames : currentData;
        expect(result.current[field]).toEqual(expected);
        await act(async () => {
            resolveOld(oldData);
        });
        expect(result.current[field]).toEqual(expected);
    }
);

test('an older failure cannot clear the current conference loading state', async () => {
    let rejectOld;
    let resolveCurrent;
    getConferenceSchedule
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
    const { result, rerender } = renderHook(useAdminScheduleData, { initialProps: props });
    rerender({ ...props, selectedConference: 'SEC' });
    await act(async () => {
        rejectOld(new Error('Old failure'));
    });
    expect(result.current.confLoading).toBe(true);
    await act(async () => {
        resolveCurrent([{ id: 'current' }]);
    });
    expect(result.current.confLoading).toBe(false);
    expect(result.current.conferenceSchedule).toEqual([{ id: 'current' }]);
});

test('callbacks captured before a season change refresh the current season', async () => {
    const { result, rerender } = renderHook(useAdminScheduleData, { initialProps: props });
    await act(async () => {});
    const refresh = result.current.refreshAllSeasonSchedule;
    rerender({ ...props, season: 13 });
    await act(async () => {
        await refresh();
    });
    expect(getScheduleBySeason).toHaveBeenLastCalledWith(13);
});

test('keeps team schedule sorting and current conference rule values', async () => {
    getScheduleBySeasonAndTeam.mockResolvedValue([
        { id: 'late', week: 5 },
        { id: 'early', week: 1 },
    ]);
    getConferenceRules.mockResolvedValue({
        numConferenceGames: 8,
        protectedRivalries: [{ team1: 'Home', team2: 'Away' }],
        divisions: ['East', 'West'],
    });
    const { result, rerender } = renderHook(useAdminScheduleData, { initialProps: props });
    await act(async () => {});
    expect(result.current.numConferenceGames).toBe(8);
    expect(result.current.divisions).toEqual(['East', 'West']);
    expect(result.current.protectedRivalries).toEqual([{ team1: 'Home', team2: 'Away' }]);
    await act(async () => {
        rerender({ ...props, tab: 'team' });
    });
    expect(result.current.teamFullSchedule.map((game) => game.id)).toEqual(['early', 'late']);
});

test('retains existing full-season data on a failed manual refresh', async () => {
    const errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
        getScheduleBySeason.mockResolvedValueOnce([{ id: 'existing' }]).mockRejectedValueOnce(new Error('Unavailable'));
        const { result } = renderHook(useAdminScheduleData, { initialProps: props });
        await act(async () => {});
        await act(async () => {
            await result.current.refreshAllSeasonSchedule();
        });
        expect(result.current.allSeasonSchedule).toEqual([{ id: 'existing' }]);
        expect(errorLog).toHaveBeenCalledTimes(1);
    } finally {
        errorLog.mockRestore();
    }
});

test('late failures after unmount do not report errors or launch more reads', async () => {
    let rejectOld;
    const errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
        getConferenceSchedule.mockReturnValue(
            new Promise((resolve, reject) => {
                rejectOld = reject;
            })
        );
        const { result, unmount } = renderHook(useAdminScheduleData, { initialProps: props });
        const refresh = result.current.fetchConferenceSchedule;
        unmount();
        await act(async () => {
            rejectOld(new Error('Obsolete'));
            await refresh();
        });
        expect(errorLog).not.toHaveBeenCalled();
        expect(getConferenceSchedule).toHaveBeenCalledTimes(1);
    } finally {
        errorLog.mockRestore();
    }
});

test('StrictMode cleanup invalidates reads from its first mount', async () => {
    let resolveOld;
    getConferenceSchedule
        .mockReturnValueOnce(
            new Promise((resolve) => {
                resolveOld = resolve;
            })
        )
        .mockResolvedValueOnce([{ id: 'current' }]);
    const { result } = renderHook(useAdminScheduleData, {
        initialProps: props,
        reactStrictMode: true,
    });
    await act(async () => {});
    await act(async () => {
        resolveOld([{ id: 'old' }]);
    });
    expect(result.current.conferenceSchedule).toEqual([{ id: 'current' }]);
});
