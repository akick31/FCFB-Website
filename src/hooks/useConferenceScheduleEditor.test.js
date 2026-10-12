/** @jest-environment jsdom */
import { act, renderHook, waitFor } from '@testing-library/react';
import useConferenceScheduleEditor from './useConferenceScheduleEditor';
import { isScheduleLocked } from '../api/seasonApi';
import {
    getConferenceSchedule,
    getScheduleBySeason,
    createScheduleEntry,
    deleteScheduleEntry,
    moveGame,
    updateScheduleEntry,
} from '../api/scheduleApi';

jest.mock('../api/seasonApi', () => ({ isScheduleLocked: jest.fn() }));
jest.mock('../api/scheduleApi', () => ({
    getScheduleBySeason: jest.fn().mockResolvedValue([]),
    getConferenceSchedule: jest.fn().mockResolvedValue([]),
    getConferenceRules: jest.fn().mockResolvedValue({ numConferenceGames: 9 }),
    createScheduleEntry: jest.fn().mockResolvedValue({}),
    updateScheduleEntry: jest.fn().mockResolvedValue({}),
    deleteScheduleEntry: jest.fn().mockResolvedValue({}),
    moveGame: jest.fn().mockResolvedValue({}),
}));

const props = { season: 12, selectedConference: 'ACC', allTeams: [], teamsMap: {}, enabled: true };
const game = { id: 1, season: 12, week: 1, homeTeam: 'Home', awayTeam: 'Away' };

beforeEach(() => {
    jest.clearAllMocks();
});

const prepareEdits = (result) => {
    act(() => {
        result.current.handleAddGameHomeChange({ name: 'Home' });
        result.current.handleAddGameAwayChange({ name: 'Away' });
        result.current.handleFilledCellClick(game, 2);
    });
};

const submitEdits = async (result) => {
    await act(async () => {
        await result.current.handleAddGame();
        await result.current.handleDeleteGame(game.id);
        await result.current.handleMoveGame();
        result.current.handleFilledCellClick(game, 2);
    });
    await act(async () => {
        await result.current.handleSaveEdits();
    });
};

test('a failed lock lookup keeps all conference mutations blocked', async () => {
    isScheduleLocked.mockRejectedValue(new Error('Lock service unavailable'));
    const { result } = renderHook(useConferenceScheduleEditor, { initialProps: props });
    prepareEdits(result);
    await act(async () => {});
    expect(result.current.scheduleLocked).toBe(true);
    expect(result.current.snackbar.severity).toBe('error');
    await submitEdits(result);
    expect(createScheduleEntry).not.toHaveBeenCalled();
    expect(deleteScheduleEntry).not.toHaveBeenCalled();
    expect(moveGame).not.toHaveBeenCalled();
    expect(updateScheduleEntry).not.toHaveBeenCalled();
});

test('an unlocked response preserves normal conference mutations', async () => {
    isScheduleLocked.mockResolvedValue(false);
    const { result } = renderHook(useConferenceScheduleEditor, { initialProps: props });
    await waitFor(() => expect(result.current.scheduleLocked).toBe(false));
    prepareEdits(result);
    await submitEdits(result);
    expect(createScheduleEntry).toHaveBeenCalledWith(
        expect.objectContaining({ season: 12, homeTeam: 'Home', awayTeam: 'Away' })
    );
    expect(deleteScheduleEntry).toHaveBeenCalledWith(1);
    expect(moveGame).toHaveBeenCalledWith(1, 2);
    expect(updateScheduleEntry).toHaveBeenCalledWith(1, expect.objectContaining({ season: 12 }));
});

test('ignores conference and season results from previous selections', async () => {
    let resolveConference;
    let resolveSeason;
    getConferenceSchedule
        .mockReturnValueOnce(
            new Promise((resolve) => {
                resolveConference = resolve;
            })
        )
        .mockResolvedValueOnce([{ id: 'current-conference' }]);
    getScheduleBySeason
        .mockReturnValueOnce(
            new Promise((resolve) => {
                resolveSeason = resolve;
            })
        )
        .mockResolvedValueOnce([{ id: 'current-season' }]);
    isScheduleLocked.mockResolvedValue(false);
    const { result, rerender } = renderHook(useConferenceScheduleEditor, { initialProps: props });
    await act(async () => {
        rerender({ ...props, season: 13, selectedConference: 'SEC' });
    });
    expect(result.current.conferenceSchedule).toEqual([{ id: 'current-conference' }]);
    expect(result.current.allSeasonSchedule).toEqual([{ id: 'current-season' }]);
    await act(async () => {
        resolveConference([{ id: 'old-conference' }]);
        resolveSeason([{ id: 'old-season' }]);
    });
    expect(result.current.conferenceSchedule).toEqual([{ id: 'current-conference' }]);
    expect(result.current.allSeasonSchedule).toEqual([{ id: 'current-season' }]);
});

test('an old conference failure cannot clear the current loading state', async () => {
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
    isScheduleLocked.mockResolvedValue(false);
    const { result, rerender } = renderHook(useConferenceScheduleEditor, { initialProps: props });
    rerender({ ...props, selectedConference: 'SEC' });
    await act(async () => {
        rejectOld(new Error('Old request failed'));
    });
    expect(result.current.confLoading).toBe(true);
    await act(async () => {
        resolveCurrent([{ id: 'current' }]);
    });
    expect(result.current.confLoading).toBe(false);
    expect(result.current.conferenceSchedule).toEqual([{ id: 'current' }]);
});
