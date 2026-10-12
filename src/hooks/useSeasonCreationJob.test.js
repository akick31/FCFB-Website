/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import useSeasonCreationJob from './useSeasonCreationJob';
import { createSeasonForScheduling } from '../api/seasonApi';
import { generateAllConferenceSchedules, pollScheduleGenJobStatus } from '../api/scheduleApi';

jest.mock('../api/seasonApi', () => ({ createSeasonForScheduling: jest.fn() }));
jest.mock('../api/scheduleApi', () => ({
    generateAllConferenceSchedules: jest.fn(),
    pollScheduleGenJobStatus: jest.fn(),
}));
let props;
beforeEach(() => {
    jest.useFakeTimers();
    jest.resetAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    props = { isMountedRef: { current: true }, onSeasonCreated: jest.fn(), showSnackbar: jest.fn() };
    createSeasonForScheduling.mockResolvedValue({});
    generateAllConferenceSchedules.mockResolvedValue({ jobId: 'job' });
});
afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
});

const start = async (result) => {
    act(() => result.current.openDialog(12));
    let completion;
    await act(async () => {
        completion = result.current.handleCreateSeason();
    });
    return { completion };
};

test('polls sequentially and reports the existing successful result', async () => {
    let resolvePoll;
    pollScheduleGenJobStatus
        .mockReturnValueOnce(
            new Promise((resolve) => {
                resolvePoll = resolve;
            })
        )
        .mockResolvedValue({ status: 'COMPLETED', totalGamesGenerated: 42 });
    const { result } = renderHook(() => useSeasonCreationJob(props));
    const { completion } = await start(result);
    await act(async () => jest.advanceTimersByTime(2000));
    await act(async () => jest.advanceTimersByTime(10000));
    expect(pollScheduleGenJobStatus).toHaveBeenCalledTimes(1);
    await act(async () => resolvePoll({ status: 'RUNNING' }));
    await act(async () => {
        jest.advanceTimersByTime(2000);
        await completion;
    });
    expect(props.showSnackbar).toHaveBeenCalledWith(
        'Season 12 created with 42 conference games auto-generated!',
        'success'
    );
    expect(props.onSeasonCreated).toHaveBeenCalledWith(12);
    expect(result.current.creatingSeasonLoading).toBe(false);
    expect(result.current.createSeasonDialogOpen).toBe(false);
});

test('unmount clears the pending timer and does not poll', async () => {
    const { result, unmount } = renderHook(() => useSeasonCreationJob(props));
    const { completion } = await start(result);
    const clearTimer = jest.spyOn(global, 'clearTimeout');
    unmount();
    await act(async () => completion);
    expect(clearTimer).toHaveBeenCalled();
    await act(async () => jest.advanceTimersByTime(10000));
    expect(pollScheduleGenJobStatus).not.toHaveBeenCalled();
    expect(props.onSeasonCreated).not.toHaveBeenCalled();
});

test('a creation response after unmount does not start generation', async () => {
    let resolveCreate;
    createSeasonForScheduling.mockReturnValue(
        new Promise((resolve) => {
            resolveCreate = resolve;
        })
    );
    const { result, unmount } = renderHook(() => useSeasonCreationJob(props));
    const { completion } = await start(result);
    unmount();
    await act(async () => {
        resolveCreate({});
        await completion;
    });
    expect(generateAllConferenceSchedules).not.toHaveBeenCalled();
    expect(props.onSeasonCreated).not.toHaveBeenCalled();
});

test('a polling failure still refreshes the created season with the existing warning', async () => {
    pollScheduleGenJobStatus.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useSeasonCreationJob(props));
    const { completion } = await start(result);
    await act(async () => {
        jest.advanceTimersByTime(2000);
        await completion;
    });
    expect(props.showSnackbar).toHaveBeenCalledWith(
        expect.stringContaining('lost track of generation progress'),
        'warning'
    );
    expect(props.onSeasonCreated).toHaveBeenCalledWith(12);
});

test('creation failure leaves the dialog open and never starts generation', async () => {
    createSeasonForScheduling.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useSeasonCreationJob(props));
    const { completion } = await start(result);
    await act(async () => completion);
    expect(result.current.createSeasonDialogOpen).toBe(true);
    expect(result.current.creatingSeasonLoading).toBe(false);
    expect(generateAllConferenceSchedules).not.toHaveBeenCalled();
});

test.each([0, 1])(
    'interrupted generation with %i failures reports unfinished conferences',
    async (failedConferences) => {
        pollScheduleGenJobStatus.mockResolvedValue({
            status: 'FAILED',
            totalConferences: 3,
            completedConferences: 1,
            failedConferences,
            totalGamesGenerated: 9,
        });
        const { result } = renderHook(() => useSeasonCreationJob(props));
        const { completion } = await start(result);
        await act(async () => {
            jest.advanceTimersByTime(2000);
            await completion;
        });
        expect(props.showSnackbar).toHaveBeenCalledWith(
            `Generated 9 conference games before generation stopped. ${2 - failedConferences} conferences were not processed${failedConferences > 0 ? '; 1 failed' : ''}. Check the conference tab to generate the remaining schedules individually.`,
            'warning'
        );
        expect(props.showSnackbar).toHaveBeenCalledTimes(1);
        expect(props.onSeasonCreated).toHaveBeenCalledWith(12);
    }
);

test('fully processed generation preserves the existing failure warning', async () => {
    pollScheduleGenJobStatus.mockResolvedValue({
        status: 'COMPLETED',
        totalConferences: 2,
        completedConferences: 1,
        failedConferences: 1,
        totalGamesGenerated: 9,
        logs: [{ status: 'FAILED', conference: 'TEST' }],
    });
    const { result } = renderHook(() => useSeasonCreationJob(props));
    const { completion } = await start(result);
    await act(async () => {
        jest.advanceTimersByTime(2000);
        await completion;
    });
    expect(props.showSnackbar).toHaveBeenCalledWith(
        'Generated 9 conference games. Failed for: TEST. You can regenerate those individually.',
        'warning'
    );
});
