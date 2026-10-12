/** @jest-environment jsdom */
import React, { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import ModifyTeamForm from './ModifyTeamForm';
import ModifyTeam from '../../pages/team/ModifyTeam';
import { updateTeam, getTeamById } from '../../api/teamApi';

let mockTeamId;
jest.mock('react-router-dom', () => ({ useParams: () => ({ teamId: mockTeamId }) }));
jest.mock('../../api/teamApi', () => ({ updateTeam: jest.fn(), getTeamById: jest.fn() }));
jest.mock('../../hooks/useConferencesMap', () => ({
    useConferencesMap: () => ({}),
    allConferenceList: () => [{ code: 'TEST', label: 'Test Conference', active: true }],
}));
jest.mock('../../components/icons/LoadingSpinner', () => ({
    __esModule: true,
    default: () => <div role="progressbar" />,
}));

const alpha = {
    id: 1,
    name: 'Alpha',
    abbreviation: 'ALPH',
    conference: 'TEST',
    offensive_playbook: 'AIR_RAID',
    defensive_playbook: 'FOUR_THREE',
    primary_color: '#1976d2',
    secondary_color: '#ffffff',
    logo_dark: 'dark.png',
    coach_usernames: ['Coach'],
};
const beta = { ...alpha, id: 2, name: 'Beta', abbreviation: 'BETA' };
const submit = () => fireEvent.submit(screen.getByRole('textbox', { name: 'Team Name' }).closest('form'));
const rename = (name) =>
    fireEvent.change(screen.getByRole('textbox', { name: 'Team Name' }), { target: { value: name } });
const pending = () => {
    let resolve, reject;
    updateTeam.mockReturnValueOnce(
        new Promise((finish, fail) => {
            resolve = finish;
            reject = fail;
        })
    );
    return { resolve, reject };
};
beforeEach(() => {
    jest.resetAllMocks();
    mockTeamId = '1';
    jest.spyOn(window, 'alert').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

test.each(['success', 'failure'])('a previous route save %s cannot affect another team editor', async (outcome) => {
    const old = pending();
    getTeamById.mockResolvedValueOnce(alpha).mockResolvedValueOnce(beta);
    const { rerender } = render(<ModifyTeam />);
    await act(async () => {});
    submit();
    mockTeamId = '2';
    await act(async () => rerender(<ModifyTeam />));
    await act(async () => (outcome === 'success' ? old.resolve() : old.reject(new Error('obsolete'))));
    expect(screen.getByRole('textbox', { name: 'Team Name' }).value).toBe('Beta');
    expect(window.alert).not.toHaveBeenCalled();
    expect(screen.queryByText('Failed to modify team. Please try again.')).toBeNull();
    expect(updateTeam).toHaveBeenCalledWith(alpha);
});

test('a pending success after unmount cannot display a global alert', async () => {
    const old = pending();
    const { unmount } = render(
        <StrictMode>
            <ModifyTeamForm team={alpha} />
        </StrictMode>
    );
    submit();
    unmount();
    await act(async () => old.resolve());
    expect(window.alert).not.toHaveBeenCalled();
});

test('an older failure cannot replace a newer successful save’s feedback', async () => {
    const old = pending();
    updateTeam.mockResolvedValueOnce(undefined);
    render(<ModifyTeamForm team={alpha} />);
    submit();
    rename('Latest');
    await act(async () => submit());
    await act(async () => old.reject(new Error('obsolete')));
    expect(screen.queryByText('Failed to modify team. Please try again.')).toBeNull();
    expect(window.alert.mock.calls).toEqual([['Team updated successfully!']]);
    expect(updateTeam.mock.calls).toEqual([[alpha], [{ ...alpha, name: 'Latest' }]]);
});

test('an older success cannot interrupt a newer pending save with an alert', async () => {
    const old = pending();
    const current = pending();
    render(<ModifyTeamForm team={alpha} />);
    submit();
    rename('Latest');
    submit();
    await act(async () => old.resolve());
    expect(window.alert).not.toHaveBeenCalled();
    await act(async () => current.resolve());
    expect(window.alert.mock.calls).toEqual([['Team updated successfully!']]);
});

test('a successful retry clears a previous error and preserves edits made during saving', async () => {
    updateTeam.mockRejectedValueOnce(new Error('unavailable'));
    const current = pending();
    render(<ModifyTeamForm team={alpha} />);
    await act(async () => submit());
    expect(screen.getByText('Failed to modify team. Please try again.')).toBeTruthy();
    rename('Submitted');
    submit();
    expect(screen.queryByText('Failed to modify team. Please try again.')).toBeNull();
    rename('Newer draft');
    await act(async () => current.resolve());
    expect(screen.getByRole('textbox', { name: 'Team Name' }).value).toBe('Newer draft');
    expect(updateTeam.mock.calls[1][0]).toEqual({ ...alpha, name: 'Submitted' });
});

test('existing name and abbreviation validation still prevents empty submissions', () => {
    render(<ModifyTeamForm team={alpha} />);
    rename('');
    submit();
    expect(screen.getByText('Team name and abbreviation are required.')).toBeTruthy();
    expect(updateTeam).not.toHaveBeenCalled();
});
