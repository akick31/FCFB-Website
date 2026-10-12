/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import useConferenceRuleActions from './useConferenceRuleActions';
import { saveConferenceRules } from '../api/scheduleApi';

jest.mock('../api/scheduleApi', () => ({ saveConferenceRules: jest.fn() }));
jest.mock('./useConferencesMap', () => ({ formatConference: () => 'Southeastern' }));
let props;
beforeEach(() => {
    saveConferenceRules.mockReset().mockResolvedValue({});
    props = {
        selectedConference: 'SEC',
        numConferenceGames: 8,
        protectedRivalries: [{ team1: 'Home', team2: 'Away', week: 5 }],
        setProtectedRivalries: jest.fn(),
        divisions: ['East', 'West'],
        setDivisions: jest.fn(),
        showSnackbar: jest.fn(),
    };
});

test('removing a saved rivalry changes local state only after the existing write succeeds', async () => {
    let finish;
    saveConferenceRules.mockReturnValueOnce(
        new Promise((resolve) => {
            finish = resolve;
        })
    );
    const { result } = renderHook(useConferenceRuleActions, { initialProps: props });
    let pending;
    act(() => {
        pending = result.current.removeRivalry(0);
    });
    expect(saveConferenceRules).toHaveBeenCalledWith('SEC', 8, []);
    expect(props.setProtectedRivalries).not.toHaveBeenCalled();
    await act(async () => {
        finish();
        await pending;
    });
    expect(props.setProtectedRivalries).toHaveBeenCalledWith([]);
});

test('removing an empty draft does not write rules', async () => {
    props.protectedRivalries = [{ team1: '', team2: '', week: null }];
    const { result } = renderHook(useConferenceRuleActions, { initialProps: props });
    await act(async () => result.current.removeRivalry(0));
    expect(saveConferenceRules).not.toHaveBeenCalled();
    expect(props.setProtectedRivalries).toHaveBeenCalledWith([]);
});

test('a failed division write retains existing divisions and feedback', async () => {
    saveConferenceRules.mockRejectedValueOnce(new Error('Rejected'));
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
        const { result } = renderHook(useConferenceRuleActions, { initialProps: props });
        await act(async () => result.current.toggleDivisions(false));
        expect(saveConferenceRules).toHaveBeenCalledWith('SEC', 8, props.protectedRivalries, []);
        expect(props.setDivisions).not.toHaveBeenCalled();
        expect(props.showSnackbar).toHaveBeenCalledWith('Failed to disable divisions: Rejected', 'error');
    } finally {
        consoleError.mockRestore();
    }
});

test('explicit rule saving preserves all arguments and the cache-backed label', async () => {
    const { result } = renderHook(useConferenceRuleActions, { initialProps: props });
    await act(async () =>
        result.current.handleSaveConferenceRules('SEC', 9, props.protectedRivalries, props.divisions)
    );
    expect(saveConferenceRules).toHaveBeenCalledWith('SEC', 9, props.protectedRivalries, props.divisions);
    expect(props.showSnackbar).toHaveBeenCalledWith('Conference rules saved for Southeastern');
});
