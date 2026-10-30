/** @jest-environment jsdom */
import React, { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import CompleteRegistrationForm from './CompleteRegistrationForm';
import { pickTeam } from '../../testUtils/pickTeam';
import { registerUser } from '../../api/authApi';
import { validateUser } from '../../api/userApi';
import { getOpenTeams } from '../../api/teamApi';
let mockSearch;
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate, useLocation: () => ({ search: mockSearch }) }));
jest.mock('../../api/authApi', () => ({ registerUser: jest.fn() }));
jest.mock('../../api/userApi', () => ({ validateUser: jest.fn() }));
jest.mock('../../api/teamApi', () => ({ getOpenTeams: jest.fn() }));
jest.mock('../ui/TeamMark', () => ({ __esModule: true, default: () => null }));
jest.mock('../../assets/graphics/main_logo.png', () => 'logo.png');
jest.mock('../../hooks/useConferencesMap', () => ({ conferenceLabel: (code) => code }));
beforeEach(() => {
    jest.resetAllMocks();
    mockSearch = '?discordTag=first&discordId=1';
    getOpenTeams.mockResolvedValue(['Alpha']);
    validateUser.mockResolvedValue({});
    registerUser.mockResolvedValue(undefined);
});
const fillForm = async () => {
    for (const [label, value] of [
        ['Username', 'coach'],
        ['Coach name', 'Coach'],
        ['Email address', 'coach@example.test'],
        ['Confirm email', 'coach@example.test'],
        ['Password', 'StrongPass!'],
        ['Confirm password', 'StrongPass!'],
    ]) {
        fireEvent.change(screen.getByLabelText(label), { target: { value } });
    }
    await pickTeam('1st choice', 'Alpha');
};
const submit = () => fireEvent.submit(screen.getByLabelText('Username').closest('form'));

test('current registration validates then sends the same complete payload and redirects', async () => {
    render(<CompleteRegistrationForm />);
    await act(async () => {});
    await fillForm();
    await act(async () => submit());
    const expected = {
        username: 'coach',
        coach_name: 'Coach',
        position: 'HEAD_COACH',
        offensive_playbook: 'FLEXBONE',
        defensive_playbook: 'FOUR_THREE',
        discord_tag: 'first',
        discord_id: '1',
        email: 'coach@example.test',
        confirm_email: 'coach@example.test',
        password: 'StrongPass!',
        confirm_password: 'StrongPass!',
        team_choice_one: 'Alpha',
        team_choice_two: '',
        team_choice_three: '',
    };
    expect(validateUser).toHaveBeenCalledWith(expected);
    expect(registerUser).toHaveBeenCalledWith(expected);
    expect(validateUser.mock.invocationCallOrder[0]).toBeLessThan(registerUser.mock.invocationCallOrder[0]);
    expect(mockNavigate).toHaveBeenCalledWith('/register/success');
});

test('validation completed after unmount cannot initiate registration', async () => {
    let finish;
    validateUser.mockReturnValueOnce(
        new Promise((resolve) => {
            finish = resolve;
        })
    );
    const { unmount } = render(<CompleteRegistrationForm />);
    await act(async () => {});
    await fillForm();
    submit();
    unmount();
    await act(async () => finish({}));
    expect(registerUser).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
});

test('old validation cannot register or finish submission for another Discord query', async () => {
    let finish;
    validateUser
        .mockReturnValueOnce(
            new Promise((resolve) => {
                finish = resolve;
            })
        )
        .mockReturnValueOnce(new Promise(() => {}));
    const { rerender } = render(<CompleteRegistrationForm />);
    await act(async () => {});
    await fillForm();
    submit();
    mockSearch = '?discordTag=second&discordId=2';
    await act(async () => rerender(<CompleteRegistrationForm />));
    expect(screen.getByLabelText('Discord tag').value).toBe('second');
    submit();
    await act(async () => finish({}));
    expect(registerUser).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Completing registration…' }).disabled).toBe(true);
    expect(validateUser.mock.calls[1][0].discord_id).toBe('2');
});

test.each(['success', 'failure'])('an older registration %s cannot affect the new query', async (outcome) => {
    let finish, reject;
    registerUser.mockReturnValueOnce(
        new Promise((resolve, fail) => {
            finish = resolve;
            reject = fail;
        })
    );
    const { rerender } = render(<CompleteRegistrationForm />);
    await act(async () => {});
    await fillForm();
    await act(async () => submit());
    mockSearch = '?discordTag=second&discordId=2';
    await act(async () => rerender(<CompleteRegistrationForm />));
    await act(async () => (outcome === 'success' ? finish() : reject(new Error('obsolete'))));
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.queryByText('Registration failed. Please try again.')).toBeNull();
    expect(screen.getByRole('button', { name: 'Complete registration' }).disabled).toBe(false);
});

test('an obsolete StrictMode team load cannot replace current options', async () => {
    let finish;
    getOpenTeams.mockReturnValueOnce(
        new Promise((resolve) => {
            finish = resolve;
        })
    );
    render(
        <StrictMode>
            <CompleteRegistrationForm />
        </StrictMode>
    );
    await act(async () => {});
    await act(async () => finish(['Old']));
    fireEvent.mouseDown(screen.getByLabelText('1st choice'));
    expect(screen.getByRole('option', { name: 'Alpha' })).toBeTruthy();
    expect(screen.queryByRole('option', { name: 'Old' })).toBeNull();
});

test('an old team-list failure cannot surface after query replacement', async () => {
    let reject;
    getOpenTeams.mockReturnValueOnce(
        new Promise((resolve, fail) => {
            reject = fail;
        })
    );
    const { rerender } = render(<CompleteRegistrationForm />);
    mockSearch = '?discordTag=second&discordId=2';
    await act(async () => rerender(<CompleteRegistrationForm />));
    await act(async () => reject(new Error('obsolete')));
    expect(screen.queryByText('Failed to load available teams. Please refresh the page.')).toBeNull();
});

test('removed Discord query fields do not retain the previous identity', async () => {
    const { rerender } = render(<CompleteRegistrationForm />);
    await act(async () => {});
    mockSearch = '';
    await act(async () => rerender(<CompleteRegistrationForm />));
    expect(screen.getByLabelText('Discord tag').value).toBe('');
    await fillForm();
    await act(async () => submit());
    expect(validateUser.mock.calls[0][0].discord_id).toBe('');
});

test.each([
    ['discord_id_exists', 'Discord ID already exists.'],
    ['discord_username_exists', 'Discord Username already exists.'],
    ['username_exists', 'Username already exists.'],
    ['email_exists', 'Email already exists.'],
])('current %s rejection retains its message and prevents registration', async (key, message) => {
    validateUser.mockResolvedValueOnce({ [key]: true });
    render(<CompleteRegistrationForm />);
    await act(async () => {});
    await fillForm();
    await act(async () => submit());
    expect(screen.getByText(message)).toBeTruthy();
    expect(registerUser).not.toHaveBeenCalled();
});

test('a current registration failure retains the existing generic feedback', async () => {
    registerUser.mockRejectedValueOnce(new Error('unavailable'));
    render(<CompleteRegistrationForm />);
    await act(async () => {});
    await fillForm();
    await act(async () => submit());
    expect(screen.getByText('Registration failed. Please try again.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Complete registration' }).disabled).toBe(false);
});

test('current team requirements and confirmation checks still prevent requests', async () => {
    render(<CompleteRegistrationForm />);
    await act(async () => {});
    await fillForm();
    await pickTeam('1st choice', 'No selection');
    submit();
    expect(screen.getByText('Please fix the highlighted errors.')).toBeTruthy();
    await pickTeam('1st choice', 'Alpha');
    fireEvent.change(screen.getByLabelText('Confirm email'), { target: { value: 'other@example.test' } });
    submit();
    expect(screen.getByText('Emails do not match.')).toBeTruthy();
    expect(validateUser).not.toHaveBeenCalled();
});

test('a Discord mention cannot be used as the username', async () => {
    render(<CompleteRegistrationForm />);
    await act(async () => {});
    await fillForm();
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: '<@789932609806401546>' } });
    submit();
    expect(screen.getByText('Username must be a plain name, not a Discord mention.')).toBeTruthy();
    expect(validateUser).not.toHaveBeenCalled();
});
