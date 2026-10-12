/** @jest-environment jsdom */
import React, { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import CreateTeamForm from './CreateTeamForm';
import { createTeam } from '../../api/teamApi';

jest.mock('../../api/teamApi', () => ({ createTeam: jest.fn() }));
jest.mock('../../hooks/useConferencesMap', () => ({
    useConferencesMap: () => ({}),
    allConferenceList: () => [{ code: 'TEST', label: 'Test Conference', active: true }],
}));
jest.mock('react-color', () => ({ ChromePicker: () => null }));

const choose = (label, option) => {
    fireEvent.mouseDown(screen.getByRole('combobox', { name: label }));
    fireEvent.click(screen.getByRole('option', { name: option }));
};
const enterTeam = (name = 'Alpha') => {
    fireEvent.change(screen.getByRole('textbox', { name: /Team Name/ }), { target: { value: name } });
    fireEvent.change(screen.getByRole('textbox', { name: /Team Abbreviation/ }), { target: { value: 'ALPH' } });
    choose(/Offensive Playbook/, 'Air Raid');
    choose(/Defensive Playbook/, '4-3');
    choose(/Conference/, 'Test Conference');
};
const submit = () => fireEvent.submit(screen.getByRole('textbox', { name: /Team Name/ }).closest('form'));
const pendingCreate = () => {
    let resolve, reject;
    createTeam.mockReturnValueOnce(
        new Promise((success, failure) => {
            resolve = success;
            reject = failure;
        })
    );
    return { resolve, reject };
};
beforeEach(() => jest.resetAllMocks());

test('successful creation resets every field and retains the dark-logo field on the next payload', async () => {
    createTeam.mockResolvedValue({ id: 1 });
    const props = { onClose: jest.fn(), onTeamCreated: jest.fn() };
    const { rerender } = render(<CreateTeamForm {...props} open />);
    enterTeam();
    fireEvent.change(screen.getByRole('textbox', { name: 'Dark Logo URL' }), { target: { value: 'dark.png' } });
    await act(async () => submit());
    expect(props.onTeamCreated).toHaveBeenCalledWith({ id: 1 });
    expect(props.onClose).toHaveBeenCalledTimes(1);
    rerender(<CreateTeamForm {...props} open={false} />);
    rerender(<CreateTeamForm {...props} open />);
    expect(screen.getByRole('textbox', { name: 'Dark Logo URL' }).value).toBe('');
    enterTeam('Beta');
    await act(async () => submit());
    expect(createTeam.mock.calls.map(([team]) => team.logo_dark)).toEqual(['dark.png', '']);
    expect(createTeam.mock.calls[1][0]).toEqual({
        name: 'Beta',
        short_name: '',
        abbreviation: 'ALPH',
        logo: '',
        logo_dark: '',
        scorebug_logo: '',
        primary_color: '#1976d2',
        secondary_color: '#ffffff',
        subdivision: 'FAKE',
        offensive_playbook: 'AIR_RAID',
        defensive_playbook: 'FOUR_THREE',
        conference: 'TEST',
        coach_usernames: [],
        coach_names: [],
        coach_discord_tags: [],
        coach_discord_ids: [],
    });
});

test.each(['success', 'failure'])('old %s cannot reset or finish a reopened dialog’s pending save', async (outcome) => {
    const old = pendingCreate();
    pendingCreate();
    const props = { onClose: jest.fn(), onTeamCreated: jest.fn() };
    const { rerender } = render(<CreateTeamForm {...props} open />);
    enterTeam();
    submit();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    rerender(<CreateTeamForm {...props} open={false} />);
    rerender(<CreateTeamForm {...props} open />);
    expect(screen.getByRole('textbox', { name: /Team Name/ }).value).toBe('Alpha');
    expect(screen.getByRole('button', { name: 'Create Team' }).disabled).toBe(false);
    fireEvent.change(screen.getByRole('textbox', { name: /Team Name/ }), { target: { value: 'Beta' } });
    submit();
    await act(async () => (outcome === 'success' ? old.resolve({ id: 1 }) : old.reject(new Error('obsolete'))));
    expect(screen.getByRole('textbox', { name: /Team Name/ }).value).toBe('Beta');
    expect(screen.getByRole('button', { name: 'Creating...' }).disabled).toBe(true);
    expect(screen.queryByText('obsolete')).toBeNull();
    expect(props.onClose).toHaveBeenCalledTimes(1);
    expect(props.onTeamCreated.mock.calls).toEqual(outcome === 'success' ? [[{ id: 1 }]] : []);
});

test('closing immediately invalidates completion even before the open prop changes', async () => {
    const old = pendingCreate();
    const props = { onClose: jest.fn(), onTeamCreated: jest.fn() };
    render(<CreateTeamForm {...props} open />);
    enterTeam();
    submit();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await act(async () => old.resolve({ id: 1 }));
    expect(screen.getByRole('textbox', { name: /Team Name/ }).value).toBe('Alpha');
    expect(props.onClose).toHaveBeenCalledTimes(1);
    expect(props.onTeamCreated).toHaveBeenCalledWith({ id: 1 });
});

test.each(['success', 'failure'])('unmounted %s cannot call parent callbacks', async (outcome) => {
    const old = pendingCreate();
    const props = { onClose: jest.fn(), onTeamCreated: jest.fn() };
    const { unmount } = render(
        <StrictMode>
            <CreateTeamForm {...props} open />
        </StrictMode>
    );
    enterTeam();
    submit();
    unmount();
    await act(async () => (outcome === 'success' ? old.resolve({ id: 1 }) : old.reject(new Error('obsolete'))));
    expect(props.onClose).not.toHaveBeenCalled();
    expect(props.onTeamCreated).not.toHaveBeenCalled();
});

test('current failure retains the draft and existing error policy', async () => {
    createTeam.mockRejectedValueOnce(new Error('creation unavailable'));
    render(<CreateTeamForm open onClose={jest.fn()} />);
    enterTeam();
    await act(async () => submit());
    expect(screen.getByText('creation unavailable')).toBeTruthy();
    expect(screen.getByRole('textbox', { name: /Team Name/ }).value).toBe('Alpha');
    expect(screen.getByRole('button', { name: 'Create Team' }).disabled).toBe(false);
});

test('a rejected parent refresh is handled after the successful create closes', async () => {
    createTeam.mockResolvedValueOnce({ id: 1 });
    const onClose = jest.fn();
    const onTeamCreated = jest.fn().mockRejectedValueOnce(new Error('refresh unavailable'));
    render(<CreateTeamForm open onClose={onClose} onTeamCreated={onTeamCreated} />);
    enterTeam();
    await act(async () => submit());
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('refresh unavailable')).toBeNull();
});

test('existing required-field validation prevents incomplete requests', () => {
    render(<CreateTeamForm open onClose={jest.fn()} />);
    submit();
    expect(screen.getByText('Team name and abbreviation are required.')).toBeTruthy();
    fireEvent.change(screen.getByRole('textbox', { name: /Team Name/ }), { target: { value: 'Alpha' } });
    fireEvent.change(screen.getByRole('textbox', { name: /Team Abbreviation/ }), { target: { value: 'ALPH' } });
    submit();
    expect(screen.getByText('Both offensive and defensive playbooks are required.')).toBeTruthy();
    choose(/Offensive Playbook/, 'Air Raid');
    choose(/Defensive Playbook/, '4-3');
    submit();
    expect(screen.getByText('Conference is required.')).toBeTruthy();
    expect(createTeam).not.toHaveBeenCalled();
});
