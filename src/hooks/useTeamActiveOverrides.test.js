/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import useTeamActiveOverrides from './useTeamActiveOverrides';
import { updateTeam } from '../api/teamApi';

jest.mock('../api/teamApi', () => ({ updateTeam: jest.fn() }));
const alpha = { name: 'Alpha', active: false, conference: 'A' };
const beta = { name: 'Beta', active: false, conference: 'B' };
let onSaved;
let onError;

beforeEach(() => {
    jest.resetAllMocks();
    updateTeam.mockResolvedValue(undefined);
    onSaved = jest.fn().mockResolvedValue(undefined);
    onError = jest.fn();
});

const renderOverrides = () =>
    renderHook(({ teams }) => useTeamActiveOverrides(teams, onSaved, onError), {
        initialProps: { teams: [alpha, beta] },
    });

test('batched toggles use the latest draft and return to the original status', () => {
    const { result } = renderOverrides();
    act(() => {
        result.current.handleToggleActive(alpha);
        result.current.handleToggleActive(alpha);
    });
    expect(result.current.effectiveActive(alpha)).toBe(false);
    expect(result.current.pendingActiveCount).toBe(0);
});

test('a successful save clears only submitted values and preserves newer team drafts', async () => {
    let resolveWrite;
    updateTeam.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveWrite = resolve;
        })
    );
    const { result, rerender } = renderOverrides();
    act(() => result.current.handleToggleActive(alpha));
    let save;
    act(() => {
        save = result.current.handleSaveActive();
    });
    act(() => result.current.handleToggleActive(beta));
    await act(async () => {
        rerender({ teams: [{ ...alpha, active: true }, beta] });
        resolveWrite();
        await save;
    });
    expect(updateTeam).toHaveBeenCalledWith({ ...alpha, active: true });
    expect(result.current.activeOverrides).toEqual({ Beta: true });
    expect(result.current.effectiveActive({ ...alpha, active: true })).toBe(true);
    expect(onSaved).toHaveBeenCalledTimes(1);
    expect(result.current.savingActive).toBe(false);
});

test('reverting a submitted team while saving retains a draft against the persisted status', async () => {
    let resolveWrite;
    updateTeam.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveWrite = resolve;
        })
    );
    const { result, rerender } = renderOverrides();
    act(() => result.current.handleToggleActive(alpha));
    let save;
    act(() => {
        save = result.current.handleSaveActive();
    });
    act(() => result.current.handleToggleActive(alpha));
    expect(result.current.effectiveActive(alpha)).toBe(false);
    await act(async () => {
        resolveWrite();
        await save;
        rerender({ teams: [{ ...alpha, active: true }, beta] });
    });
    expect(result.current.activeOverrides).toEqual({ Alpha: false });
    await act(async () => result.current.handleSaveActive());
    expect(updateTeam).toHaveBeenLastCalledWith({ ...alpha, active: false });
});

test('drafts made during the refresh remain pending and unrelated canceled edits are removed', async () => {
    let resolveRefresh;
    onSaved.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveRefresh = resolve;
        })
    );
    const { result } = renderOverrides();
    act(() => result.current.handleToggleActive(alpha));
    let save;
    await act(async () => {
        save = result.current.handleSaveActive();
    });
    act(() => {
        result.current.handleToggleActive(beta);
        result.current.handleToggleActive(beta);
        result.current.handleToggleActive(alpha);
    });
    await act(async () => {
        resolveRefresh();
        await save;
    });
    expect(result.current.activeOverrides).toEqual({ Alpha: false });
});

test('a failed write retains drafts and reports the existing error', async () => {
    updateTeam.mockRejectedValueOnce(new Error('Write failed'));
    const { result } = renderOverrides();
    act(() => result.current.handleToggleActive(alpha));
    await act(async () => result.current.handleSaveActive());
    expect(result.current.activeOverrides).toEqual({ Alpha: true });
    expect(onError).toHaveBeenLastCalledWith('Write failed');
    expect(onSaved).not.toHaveBeenCalled();
    expect(result.current.savingActive).toBe(false);
});

test('completion after unmount does not refresh the page or report an error', async () => {
    let rejectWrite;
    updateTeam.mockReturnValueOnce(
        new Promise((resolve, reject) => {
            rejectWrite = reject;
        })
    );
    const { result, unmount } = renderOverrides();
    act(() => result.current.handleToggleActive(alpha));
    let save;
    act(() => {
        save = result.current.handleSaveActive();
    });
    unmount();
    await act(async () => {
        rejectWrite(new Error('Late failure'));
        await save;
    });
    expect(onSaved).not.toHaveBeenCalled();
    expect(onError.mock.calls).toEqual([[null]]);
});

test('fake teams and empty drafts do not trigger updates', async () => {
    const { result } = renderOverrides();
    act(() => result.current.handleToggleActive({ ...alpha, conference: 'FAKE_TEAM' }));
    await act(async () => result.current.handleSaveActive());
    expect(updateTeam).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
});
