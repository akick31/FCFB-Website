/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import useAddGameDialog from './useAddGameDialog';
import useMoveGameDialog from './useMoveGameDialog';
import useOocScheduleDialog from './useOocScheduleDialog';
import {
    createScheduleEntry,
    deleteScheduleEntry,
    moveGame,
    updateScheduleEntry,
    generateOutOfConferenceSchedule,
} from '../api/scheduleApi';

jest.mock('../api/scheduleApi', () => ({
    createScheduleEntry: jest.fn().mockResolvedValue({}),
    deleteScheduleEntry: jest.fn().mockResolvedValue({}),
    moveGame: jest.fn().mockResolvedValue({}),
    updateScheduleEntry: jest.fn().mockResolvedValue({}),
    generateOutOfConferenceSchedule: jest.fn().mockResolvedValue({ gamesScheduled: 0 }),
    getBowl: jest.fn().mockResolvedValue(null),
}));
jest.mock('../api/uploadApi', () => ({ uploadPostseasonLogo: jest.fn() }));
jest.mock('./useConferencesMap', () => ({ getConference: jest.fn() }));
jest.mock('../utils/logoUrl', () => ({ resolveLogoUrl: jest.fn() }));

const game = { id: 1, season: 12, week: 1, homeTeam: 'Home', awayTeam: 'Away' };
const props = {
    season: 12,
    scheduleLocked: false,
    teamMap: {},
    teamWeekOccupiedAll: new Set(),
    showSnackbar: jest.fn(),
    onSuccess: jest.fn(),
};

beforeEach(() => {
    jest.clearAllMocks();
});

test('an already-open add dialog cannot submit when the schedule becomes blocked', async () => {
    const { result, rerender } = renderHook(useAddGameDialog, { initialProps: props });
    act(() => {
        result.current.openManually('CONFERENCE_GAME');
        result.current.handleHomeChange({ name: 'Home' });
        result.current.handleAwayChange({ name: 'Away' });
    });
    rerender({ ...props, scheduleLocked: true });
    await act(async () => {
        await result.current.handleAddGame();
    });
    expect(createScheduleEntry).not.toHaveBeenCalled();
    expect(result.current.addGameDialogOpen).toBe(true);
});

test('a confirmed unlocked schedule preserves adding a regular-season game', async () => {
    const { result } = renderHook(useAddGameDialog, { initialProps: props });
    act(() => {
        result.current.handleHomeChange({ name: 'Home' });
        result.current.handleAwayChange({ name: 'Away' });
    });
    await act(async () => {
        await result.current.handleAddGame();
    });
    expect(createScheduleEntry).toHaveBeenCalledWith(
        expect.objectContaining({ season: 12, gameType: 'CONFERENCE_GAME' })
    );
});

test.each(['BOWL', 'PLAYOFFS', 'CONFERENCE_CHAMPIONSHIP', 'NATIONAL_CHAMPIONSHIP'])(
    'preserves the lock exemption for %s creation',
    async (gameType) => {
        const { result } = renderHook(useAddGameDialog, { initialProps: { ...props, scheduleLocked: true } });
        act(() => {
            result.current.openForPostseason(gameType, 14);
        });
        act(() => {
            result.current.handleHomeChange({ name: 'Home' });
            result.current.handleAwayChange({ name: 'Away' });
            result.current.setAddGameBowlName('Test Bowl');
            if (gameType === 'PLAYOFFS' || gameType === 'NATIONAL_CHAMPIONSHIP') {
                result.current.setAddGamePlayoffRound(1);
            }
            result.current.setAddGameVenue('Neutral Venue');
        });
        await act(async () => {
            await result.current.handleAddGame();
        });
        expect(createScheduleEntry).toHaveBeenCalledWith(expect.objectContaining({ gameType, neutralSite: true }));
    }
);

test('an already-open move dialog cannot move, delete, or edit a blocked schedule', async () => {
    const { result, rerender } = renderHook(useMoveGameDialog, { initialProps: props });
    act(() => {
        result.current.openForCell(game, 2);
    });
    rerender({ ...props, scheduleLocked: true });
    await act(async () => {
        await result.current.handleSaveEdits();
        await result.current.handleMoveGame();
        await result.current.handleDeleteGame(game.id);
    });
    expect(moveGame).not.toHaveBeenCalled();
    expect(deleteScheduleEntry).not.toHaveBeenCalled();
    expect(updateScheduleEntry).not.toHaveBeenCalled();
});

test('a confirmed unlocked schedule preserves move, delete, and edit requests', async () => {
    const { result } = renderHook(useMoveGameDialog, { initialProps: props });
    act(() => {
        result.current.openForCell(game, 2);
    });
    await act(async () => {
        await result.current.handleSaveEdits();
        await result.current.handleMoveGame();
        await result.current.handleDeleteGame(game.id);
    });
    expect(moveGame).toHaveBeenCalledWith(1, 2);
    expect(deleteScheduleEntry).toHaveBeenCalledWith(1);
    expect(updateScheduleEntry).toHaveBeenCalledWith(1, expect.objectContaining({ season: 12 }));
});

test('an already-open OOC dialog cannot generate a blocked schedule', async () => {
    const { result, rerender } = renderHook(useOocScheduleDialog, { initialProps: props });
    act(() => {
        result.current.openDialog();
    });
    rerender({ ...props, scheduleLocked: true });
    await act(async () => {
        await result.current.handleGenerateOocSchedule();
    });
    expect(generateOutOfConferenceSchedule).not.toHaveBeenCalled();
});

test('a confirmed unlocked schedule preserves OOC generation', async () => {
    const { result } = renderHook(useOocScheduleDialog, { initialProps: props });
    await act(async () => {
        await result.current.handleGenerateOocSchedule();
    });
    expect(generateOutOfConferenceSchedule).toHaveBeenCalledWith(12);
});
