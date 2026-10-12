/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import useCoachRosterActions from './useCoachRosterActions';
import { hireCoach, hireInterimCoach, fireSingleCoach } from '../api/teamApi';

jest.mock('../api/teamApi', () => ({ hireCoach: jest.fn(), hireInterimCoach: jest.fn(), fireSingleCoach: jest.fn() }));
const alpha = { name: 'Alpha' };
const beta = { name: 'Beta' };
const coach = { discordId: 'coach-id', position: 'HEAD_COACH' };
const candidate = { username: 'Candidate', discord_id: 'candidate-id' };
let onChanged;
let getRosterForTeam;

beforeEach(() => {
    jest.resetAllMocks();
    hireCoach.mockResolvedValue(undefined);
    hireInterimCoach.mockResolvedValue(undefined);
    fireSingleCoach.mockResolvedValue(undefined);
    onChanged = jest.fn().mockResolvedValue(undefined);
    getRosterForTeam = jest.fn().mockReturnValue([coach]);
});
const renderRoster = () =>
    renderHook(() =>
        useCoachRosterActions({
            user: { username: 'Admin' },
            getRosterForTeam,
            onChanged,
        })
    );
const prepareHire = (result, team = alpha) => {
    act(() => result.current.handleHireCoach(team));
    act(() => {
        result.current.setSelectedUser(candidate);
        result.current.setSelectedPosition('HEAD_COACH');
    });
};

test.each([
    [
        'handleHireSubmit',
        hireCoach,
        { team: 'Alpha', discordId: 'candidate-id', coachPosition: 'HEAD_COACH', processedBy: 'Admin' },
    ],
    ['handleHireInterimSubmit', hireInterimCoach, { team: 'Alpha', discordId: 'candidate-id', processedBy: 'Admin' }],
])('%s preserves payloads and closes its successful dialog', async (handler, api, payload) => {
    const { result } = renderRoster();
    prepareHire(result);
    await act(async () => result.current[handler]());
    expect(api).toHaveBeenCalledWith(payload);
    expect(result.current.hireDialogOpen).toBe(false);
    expect(result.current.processing).toBe(false);
    expect(onChanged).toHaveBeenCalledTimes(1);
});

test('a previous hire success cannot close a newly opened dialog', async () => {
    let resolveOld;
    hireCoach.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveOld = resolve;
        })
    );
    const { result } = renderRoster();
    prepareHire(result);
    let save;
    act(() => {
        save = result.current.handleHireSubmit();
    });
    act(() => result.current.setHireDialogOpen(false));
    prepareHire(result, beta);
    await act(async () => {
        resolveOld();
        await save;
    });
    expect(result.current.hireDialogOpen).toBe(true);
    expect(result.current.selectedTeam).toBe(beta);
    expect(result.current.dialogError).toBe('');
    expect(onChanged).toHaveBeenCalledTimes(1);
});

test('an older failure cannot report an error or clear a newer save', async () => {
    let rejectOld;
    let resolveNew;
    hireCoach
        .mockReturnValueOnce(
            new Promise((resolve, reject) => {
                rejectOld = reject;
            })
        )
        .mockReturnValueOnce(
            new Promise((resolve) => {
                resolveNew = resolve;
            })
        );
    const { result } = renderRoster();
    prepareHire(result);
    let oldSave;
    act(() => {
        oldSave = result.current.handleHireSubmit();
    });
    prepareHire(result, beta);
    let newSave;
    act(() => {
        newSave = result.current.handleHireSubmit();
    });
    await act(async () => {
        rejectOld(new Error('Old failure'));
        await oldSave;
    });
    expect(result.current.dialogError).toBe('');
    expect(result.current.processing).toBe(true);
    await act(async () => {
        resolveNew();
        await newSave;
    });
    expect(result.current.processing).toBe(false);
});

test('a prior fire completion cannot dismiss a different fire confirmation', async () => {
    let resolveFire;
    fireSingleCoach.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveFire = resolve;
        })
    );
    const { result } = renderRoster();
    act(() => result.current.handleFireClick(alpha));
    let save;
    act(() => {
        save = result.current.handleFireSubmit();
    });
    act(() => result.current.setFireTarget(null));
    act(() => result.current.setFireTarget({ team: beta, coach }));
    await act(async () => {
        resolveFire();
        await save;
    });
    expect(fireSingleCoach).toHaveBeenCalledWith({
        team: 'Alpha',
        discordId: 'coach-id',
        coachPosition: 'HEAD_COACH',
        processedBy: 'Admin',
    });
    expect(result.current.fireTarget).toEqual({ team: beta, coach });
});

test('current failures retain the confirmation and existing feedback', async () => {
    fireSingleCoach.mockRejectedValueOnce(new Error('Fire failed'));
    const { result } = renderRoster();
    act(() => result.current.handleFireClick(alpha));
    await act(async () => result.current.handleFireSubmit());
    expect(result.current.fireTarget).toEqual({ team: alpha, coach });
    expect(result.current.dialogError).toBe('Fire failed');
    expect(result.current.processing).toBe(false);
    expect(onChanged).not.toHaveBeenCalled();
});

test('fire picker selection preserves team and coach identity and clears old errors', async () => {
    getRosterForTeam.mockReturnValue([coach, { ...coach, discordId: 'other' }]);
    const { result } = renderRoster();
    prepareHire(result);
    hireCoach.mockRejectedValueOnce(new Error('Hire failed'));
    await act(async () => result.current.handleHireSubmit());
    act(() => result.current.handleFireClick(beta));
    act(() => result.current.selectFireFromPicker(coach));
    expect(result.current.fireTarget).toEqual({ team: beta, coach });
    expect(result.current.firePickerTeam).toBeNull();
    expect(result.current.dialogError).toBe('');
});

test('unmounted mutation completion cannot refresh the page', async () => {
    let resolveHire;
    hireCoach.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveHire = resolve;
        })
    );
    const { result, unmount } = renderRoster();
    prepareHire(result);
    let save;
    act(() => {
        save = result.current.handleHireSubmit();
    });
    unmount();
    await act(async () => {
        resolveHire();
        await save;
    });
    expect(onChanged).not.toHaveBeenCalled();
});

test('existing selection and Discord requirements still block invalid submissions', async () => {
    const { result } = renderRoster();
    act(() => result.current.handleHireCoach(alpha));
    await act(async () => result.current.handleHireSubmit());
    expect(result.current.dialogError).toBe('Please select both a user and position');
    await act(async () => result.current.handleHireInterimSubmit());
    expect(result.current.dialogError).toBe('Please select a user');
    act(() => {
        result.current.setSelectedUser({ username: 'Missing Discord' });
        result.current.setSelectedPosition('HEAD_COACH');
    });
    await act(async () => result.current.handleHireSubmit());
    expect(result.current.dialogError).toBe('Selected user does not have a Discord ID');
    expect(hireCoach).not.toHaveBeenCalled();
    expect(hireInterimCoach).not.toHaveBeenCalled();
    expect(result.current.processing).toBe(false);
});
