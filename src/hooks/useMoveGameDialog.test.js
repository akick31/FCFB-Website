/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import useMoveGameDialog from './useMoveGameDialog';
import { moveGame, deleteScheduleEntry } from '../api/scheduleApi';

jest.mock('../api/scheduleApi', () => ({
    moveGame: jest.fn(),
    deleteScheduleEntry: jest.fn(),
    updateScheduleEntry: jest.fn(),
}));
const game = { id: 1, season: 12, week: 1, homeTeam: 'Home', awayTeam: 'Away' };
let props;
beforeEach(() => {
    jest.resetAllMocks();
    props = { scheduleLocked: false, teamWeekOccupiedAll: new Set(), onSuccess: jest.fn(), showSnackbar: jest.fn() };
    jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

test.each(['move', 'delete'])('%s failures preserve the open dialog and selected game', async (action) => {
    moveGame.mockRejectedValue(new Error('failed'));
    deleteScheduleEntry.mockRejectedValue(new Error('failed'));
    const { result } = renderHook(() => useMoveGameDialog(props));
    act(() => result.current.openForGame(game));
    await act(async () =>
        action === 'move' ? result.current.handleMoveGame() : result.current.handleDeleteFromMoveDialog()
    );
    expect(result.current.moveDialogOpen).toBe(true);
    expect(result.current.moveGameData).toEqual(game);
    expect(props.onSuccess).not.toHaveBeenCalled();
});

test.each(['move', 'delete'])('%s success closes the dialog after the request completes', async (action) => {
    let resolve;
    const request = new Promise((done) => {
        resolve = done;
    });
    moveGame.mockReturnValue(request);
    deleteScheduleEntry.mockReturnValue(request);
    const { result } = renderHook(() => useMoveGameDialog(props));
    act(() => result.current.openForGame(game));
    let completion;
    act(() => {
        completion = action === 'move' ? result.current.handleMoveGame() : result.current.handleDeleteFromMoveDialog();
    });
    expect(result.current.moveDialogOpen).toBe(true);
    await act(async () => {
        resolve({});
        await completion;
    });
    expect(result.current.moveDialogOpen).toBe(false);
    expect(result.current.moveGameData).toBeNull();
    expect(props.onSuccess).toHaveBeenCalledTimes(1);
});

test('an occupied destination leaves the dialog open without calling the API', async () => {
    props.teamWeekOccupiedAll.add('Home|2');
    const { result } = renderHook(() => useMoveGameDialog(props));
    act(() => {
        result.current.openForGame(game);
        result.current.setMoveToWeek(2);
    });
    await act(async () => result.current.handleMoveGame());
    expect(moveGame).not.toHaveBeenCalled();
    expect(result.current.moveDialogOpen).toBe(true);
});
