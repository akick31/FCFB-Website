/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import useConferenceGeneration from './useConferenceGeneration';
import { generateConferenceSchedule } from '../api/scheduleApi';

jest.mock('../api/scheduleApi', () => ({ generateConferenceSchedule: jest.fn() }));
let props;
beforeEach(() => {
    generateConferenceSchedule.mockReset().mockResolvedValue({});
    props = {
        season: 12,
        selectedConference: 'SEC',
        scheduleLocked: false,
        conferenceTeams: [{ name: 'Home', subdivision: 'FCS' }],
        numConferenceGames: 8,
        protectedRivalries: [
            { team1: 'Home', team2: 'Away', week: 5 },
            { team1: '', team2: '', week: null },
        ],
        divisions: ['East', '', 'West'],
        showSnackbar: jest.fn(),
        fetchConferenceSchedule: jest.fn().mockResolvedValue(undefined),
        refreshAllSeasonSchedule: jest.fn(),
        isMountedRef: { current: true },
    };
});

test('generation preserves payload filtering and refreshes the conference before the full schedule', async () => {
    let finishConferenceRefresh;
    props.fetchConferenceSchedule.mockReturnValueOnce(
        new Promise((resolve) => {
            finishConferenceRefresh = resolve;
        })
    );
    const { result } = renderHook(useConferenceGeneration, { initialProps: props });
    act(() => result.current.setGenerateDialogOpen(true));
    let pending;
    await act(async () => {
        pending = result.current.handleGenerateConferenceSchedule();
    });
    expect(generateConferenceSchedule).toHaveBeenCalledWith({
        season: 12,
        conference: 'SEC',
        subdivision: 'FCS',
        numConferenceGames: 8,
        protectedRivalries: [{ team1: 'Home', team2: 'Away', week: 5 }],
        startWeek: 1,
        divisions: ['East', 'West'],
    });
    expect(result.current.generateDialogOpen).toBe(false);
    expect(result.current.generationLoading).toBe(true);
    expect(props.refreshAllSeasonSchedule).not.toHaveBeenCalled();
    await act(async () => {
        finishConferenceRefresh();
        await pending;
    });
    expect(props.refreshAllSeasonSchedule).toHaveBeenCalledTimes(1);
    expect(result.current.generationLoading).toBe(false);
});

test.each(['lock', 'incomplete rivalry'])('generation preserves the existing %s block', async (reason) => {
    if (reason === 'lock') {
        props.scheduleLocked = true;
    } else {
        props.protectedRivalries = [{ team1: 'Home', team2: '' }];
    }
    const { result } = renderHook(useConferenceGeneration, { initialProps: props });
    await act(async () => result.current.handleGenerateConferenceSchedule());
    expect(generateConferenceSchedule).not.toHaveBeenCalled();
    expect(props.fetchConferenceSchedule).not.toHaveBeenCalled();
});

test.each(['season', 'conference', 'unmount'])(
    'pending generation cannot publish feedback or refresh after %s replacement',
    async (replacement) => {
        let finish;
        generateConferenceSchedule.mockReturnValueOnce(
            new Promise((resolve) => {
                finish = resolve;
            })
        );
        const { result, rerender, unmount } = renderHook(useConferenceGeneration, { initialProps: props });
        let pending;
        act(() => {
            pending = result.current.handleGenerateConferenceSchedule();
        });
        if (replacement === 'unmount') {
            unmount();
        } else {
            rerender({ ...props, ...(replacement === 'season' ? { season: 13 } : { selectedConference: 'ACC' }) });
        }
        await act(async () => {
            finish();
            await pending;
        });
        expect(props.showSnackbar).not.toHaveBeenCalled();
        expect(props.fetchConferenceSchedule).not.toHaveBeenCalled();
        expect(props.refreshAllSeasonSchedule).not.toHaveBeenCalled();
    }
);
