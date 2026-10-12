/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import LoginForm from './LoginForm';
import apiClient from '../../api/apiClient';
import { getUserById } from '../../api/userApi';
import { useNavigate, useSearchParams } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
    Link: ({ to, children }) => <a href={to}>{children}</a>,
    useNavigate: jest.fn(),
    useSearchParams: jest.fn(),
}));
jest.mock('../../config/discord', () => ({ clientId: 'client', redirectUri: 'https://example.test/login' }));
jest.mock('../../assets/graphics/main_logo.png', () => 'logo');
jest.mock('../../api/apiClient', () => ({ post: jest.fn() }));
jest.mock('../../api/userApi', () => ({ getUserById: jest.fn() }));
jest.mock('../../utils/utils', () => ({ checkIfUserIsAdmin: () => global.localStorage.getItem('role') === 'ADMIN' }));
jest.mock('./ForgotPasswordForm', () => ({ __esModule: true, default: () => null }));

let callbacks;
let navigate;
let setSearchParams;

beforeEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
    navigate = jest.fn();
    setSearchParams = jest.fn();
    useNavigate.mockReturnValue(navigate);
    useSearchParams.mockReturnValue([new URLSearchParams(), setSearchParams]);
    apiClient.post.mockResolvedValue({ status: 200, data: { token: 'password-token', userId: 18, role: 'ADMIN' } });
    getUserById.mockResolvedValue({ id: 18 });
    callbacks = { setIsAuthenticated: jest.fn(), setUser: jest.fn(), setIsAdmin: jest.fn() };
});

const mount = (options) => render(<LoginForm {...callbacks} />, options);
const discord = () =>
    useSearchParams.mockReturnValue([
        new URLSearchParams('discordToken=discord-token&discordUserId=17&discordRole=ADMIN&other=keep'),
        setSearchParams,
    ]);
const submitPassword = () => {
    fireEvent.change(screen.getByLabelText('Username or email'), { target: { value: 'coach' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
    fireEvent.submit(screen.getByLabelText('Password').closest('form'));
};

test('successful password login retains session callbacks and navigation', async () => {
    mount();
    submitPassword();
    await act(async () => {});
    expect(callbacks.setIsAuthenticated).toHaveBeenCalledWith(true);
    expect(callbacks.setUser).toHaveBeenCalledWith({ id: 18 });
    expect(callbacks.setIsAdmin).toHaveBeenCalledWith(true);
    expect(navigate).toHaveBeenCalledWith('/');
});

test('unmounting before a credential response prevents storage writes and navigation', async () => {
    let resolveLogin;
    apiClient.post.mockReturnValue(
        new Promise((resolve) => {
            resolveLogin = resolve;
        })
    );
    const view = mount();
    submitPassword();
    view.unmount();
    await act(async () => resolveLogin({ status: 200, data: { token: 'password-token', userId: 18 } }));
    expect(localStorage.getItem('token')).toBeNull();
    expect(callbacks.setUser).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
});

test('unmounting before a password profile response prevents authentication and navigation', async () => {
    let resolveProfile;
    getUserById.mockReturnValue(
        new Promise((resolve) => {
            resolveProfile = resolve;
        })
    );
    const view = mount();
    submitPassword();
    await act(async () => {});
    view.unmount();
    await act(async () => resolveProfile({ id: 18 }));
    expect(callbacks.setIsAuthenticated).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
});

test('successful Discord completion preserves role and profile behavior', async () => {
    discord();
    getUserById.mockResolvedValue({ id: 17 });
    mount();
    await act(async () => {});
    expect(localStorage.getItem('token')).toBe('discord-token');
    expect(localStorage.getItem('userId')).toBe('17');
    expect(callbacks.setUser).toHaveBeenCalledWith({ id: 17 });
    expect(callbacks.setIsAdmin).toHaveBeenCalledWith(true);
    expect(navigate).toHaveBeenCalledWith('/');
});

test.each([null, 'new-token'])('Discord profile responses ignore removed or replaced sessions (%s)', async (token) => {
    let resolveProfile;
    discord();
    getUserById.mockReturnValue(
        new Promise((resolve) => {
            resolveProfile = resolve;
        })
    );
    mount();
    if (token) {
        localStorage.setItem('token', token);
    } else {
        localStorage.removeItem('token');
    }
    await act(async () => resolveProfile({ id: 17 }));
    expect(callbacks.setUser).not.toHaveBeenCalled();
    expect(callbacks.setIsAuthenticated).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
});

test('StrictMode only completes the active Discord effect', async () => {
    let resolveFirst;
    discord();
    getUserById.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveFirst = resolve;
        })
    );
    getUserById.mockResolvedValue({ id: 17 });
    mount({ reactStrictMode: true });
    await act(async () => {});
    await act(async () => resolveFirst({ id: 99 }));
    expect(callbacks.setUser).toHaveBeenCalledTimes(1);
    expect(callbacks.setUser).toHaveBeenCalledWith({ id: 17 });
    expect(navigate).toHaveBeenCalledTimes(1);
});

test('password login supersedes a pending Discord completion', async () => {
    let resolveDiscord;
    discord();
    getUserById.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveDiscord = resolve;
        })
    );
    mount();
    submitPassword();
    await act(async () => {});
    await act(async () => resolveDiscord({ id: 17 }));
    expect(callbacks.setUser).toHaveBeenCalledTimes(1);
    expect(callbacks.setUser).toHaveBeenCalledWith({ id: 18 });
    expect(localStorage.getItem('token')).toBe('password-token');
    expect(navigate).toHaveBeenCalledTimes(1);
});

test('an active Discord failure preserves the error and removes only callback parameters', async () => {
    discord();
    getUserById.mockRejectedValue(new Error('Profile unavailable'));
    mount();
    await act(async () => {});
    expect(screen.getByText('Discord sign-in failed. Please try again.')).toBeTruthy();
    expect(setSearchParams).toHaveBeenCalledTimes(1);
    const [params, options] = setSearchParams.mock.calls[0];
    expect(params.toString()).toBe('other=keep');
    expect(options).toEqual({ replace: true });
});

test('a discarded Discord failure cannot edit the URL or show an error', async () => {
    let rejectProfile;
    discord();
    getUserById.mockReturnValue(
        new Promise((resolve, reject) => {
            rejectProfile = reject;
        })
    );
    const view = mount();
    view.unmount();
    await act(async () => rejectProfile(new Error('Profile unavailable')));
    expect(setSearchParams).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
});

test('password errors retain the existing message and release the submit button', async () => {
    apiClient.post.mockRejectedValue(new Error('Request failed'));
    mount();
    submitPassword();
    await act(async () => {});
    expect(screen.getByText('An error occurred during login. Please try again.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Log in', exact: true }).disabled).toBe(false);
});

test('an older password attempt cannot clear loading for the current attempt', async () => {
    let resolveFirst;
    let resolveSecond;
    apiClient.post.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveFirst = resolve;
        })
    );
    apiClient.post.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveSecond = resolve;
        })
    );
    mount();
    submitPassword();
    submitPassword();
    await act(async () => resolveFirst({ status: 200, data: { token: 'old-token', userId: 17 } }));
    expect(screen.getByRole('button', { name: 'Signing in…' }).disabled).toBe(true);
    expect(localStorage.getItem('token')).toBeNull();
    await act(async () => resolveSecond({ status: 200, data: { token: 'password-token', userId: 18 } }));
    expect(callbacks.setUser).toHaveBeenCalledTimes(1);
    expect(callbacks.setUser).toHaveBeenCalledWith({ id: 18 });
    expect(navigate).toHaveBeenCalledTimes(1);
});

test('a current profile rejection after transport expiry retains the login error', async () => {
    getUserById.mockImplementation(async () => {
        localStorage.removeItem('token');
        throw new Error('Expired session');
    });
    mount();
    submitPassword();
    await act(async () => {});
    expect(screen.getByText('An error occurred during login. Please try again.')).toBeTruthy();
    expect(callbacks.setIsAuthenticated).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
});

test('a previous Discord failure cannot change the URL after password login succeeds', async () => {
    let rejectDiscord;
    discord();
    getUserById.mockReturnValueOnce(
        new Promise((resolve, reject) => {
            rejectDiscord = reject;
        })
    );
    mount();
    submitPassword();
    await act(async () => {});
    await act(async () => rejectDiscord(new Error('Old profile failed')));
    expect(setSearchParams).not.toHaveBeenCalled();
    expect(screen.queryByText('Discord sign-in failed. Please try again.')).toBeNull();
    expect(navigate).toHaveBeenCalledTimes(1);
});
