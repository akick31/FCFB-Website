/** @jest-environment jsdom */
import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { getUserById } from './api/userApi';
import { expireUnauthorizedSession } from './utils/session';

jest.mock('react-router-dom', () => {
    global.TextEncoder = require('util').TextEncoder;
    return jest.requireActual('react-router-dom');
});

jest.mock('./pages', () => {
    const React = require('react');
    return new Proxy(
        { __esModule: true },
        {
            get: (target, name) => (name === '__esModule' ? true : () => React.createElement('div', null, name)),
        }
    );
});
jest.mock('./api/userApi', () => ({ getUserById: jest.fn() }));
jest.mock('./utils/utils', () => ({ checkIfUserIsAdmin: () => global.localStorage.getItem('role') === 'ADMIN' }));
jest.mock('./components/header/Header', () => ({
    __esModule: true,
    default: ({ isAuthenticated, isAdmin, user, setIsAuthenticated, setIsAdmin, setUser }) => (
        <div>
            <output data-testid="session">{JSON.stringify({ isAuthenticated, isAdmin, user })}</output>
            <button
                onClick={() => {
                    global.localStorage.setItem('token', 'new');
                    global.localStorage.setItem('userId', '18');
                    global.localStorage.removeItem('role');
                    setIsAuthenticated(true);
                    setIsAdmin(false);
                    setUser({ id: 18 });
                }}
            >
                New login
            </button>
        </div>
    ),
}));
jest.mock('./components/layout/Footer', () => ({ __esModule: true, default: () => null }));
jest.mock('./context/ColorModeContext', () => ({
    ColorModeProvider: ({ children }) => children,
}));

const session = () => JSON.parse(screen.getByTestId('session').textContent);
const mount = (options) =>
    render(
        <MemoryRouter initialEntries={['/admin']}>
            <AppRoutes />
        </MemoryRouter>,
        options
    );
const expire = () =>
    expireUnauthorizedSession({
        response: { status: 401 },
        config: { headers: { Authorization: 'Bearer original' } },
    });

beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'original');
    localStorage.setItem('userId', '17');
    localStorage.setItem('role', 'ADMIN');
    jest.clearAllMocks();
    getUserById.mockResolvedValue({ id: 17 });
});

test('expired sessions clear React privileges and redirect protected routes', async () => {
    mount();
    await act(async () => {});
    expect(screen.getByText('Admin')).toBeTruthy();
    act(expire);
    expect(session()).toEqual({ isAuthenticated: false, isAdmin: false, user: {} });
    expect(screen.getByText('Login')).toBeTruthy();
});

test('a startup profile response cannot restore an expired session', async () => {
    let resolveProfile;
    getUserById.mockReturnValue(
        new Promise((resolve) => {
            resolveProfile = resolve;
        })
    );
    mount();
    act(expire);
    await act(async () => resolveProfile({ id: 17 }));
    expect(session()).toEqual({ isAuthenticated: false, isAdmin: false, user: {} });
    expect(screen.getByText('Login')).toBeTruthy();
});

test('a previous startup response cannot overwrite a newer login', async () => {
    let resolveProfile;
    getUserById.mockReturnValue(
        new Promise((resolve) => {
            resolveProfile = resolve;
        })
    );
    mount();
    act(() => screen.getByText('New login').click());
    await act(async () => resolveProfile({ id: 17 }));
    expect(session()).toEqual({ isAuthenticated: true, isAdmin: false, user: { id: 18 } });
});

test('cross-tab removal of login storage clears React privileges', async () => {
    mount();
    await act(async () => {});
    localStorage.removeItem('token');
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: 'token' })));
    expect(session()).toEqual({ isAuthenticated: false, isAdmin: false, user: {} });
    expect(screen.getByText('Login')).toBeTruthy();
});

test('startup failures clear admin privileges as well as authentication', async () => {
    const logging = jest.spyOn(console, 'error').mockImplementation(() => {});
    getUserById.mockRejectedValue(new Error('Failed profile lookup'));
    try {
        mount();
        await act(async () => {});
        expect(session()).toEqual({ isAuthenticated: false, isAdmin: false, user: {} });
    } finally {
        logging.mockRestore();
    }
});

test('a previous startup failure cannot sign out a newer login', async () => {
    let rejectProfile;
    getUserById.mockReturnValue(
        new Promise((resolve, reject) => {
            rejectProfile = reject;
        })
    );
    mount();
    act(() => screen.getByText('New login').click());
    await act(async () => rejectProfile(new Error('Old request failed')));
    expect(session()).toEqual({ isAuthenticated: true, isAdmin: false, user: { id: 18 } });
});

test('StrictMode ignores the profile response from its cleaned-up effect', async () => {
    let resolveFirst;
    getUserById.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveFirst = resolve;
        })
    );
    mount({ reactStrictMode: true });
    await act(async () => {});
    await act(async () => resolveFirst({ id: 99 }));
    expect(session()).toEqual({ isAuthenticated: true, isAdmin: true, user: { id: 17 } });
});

test('startup without stored credentials leaves protected routes unauthenticated', async () => {
    localStorage.clear();
    mount();
    await act(async () => {});
    expect(getUserById).not.toHaveBeenCalled();
    expect(session()).toEqual({ isAuthenticated: false, isAdmin: false, user: {} });
    expect(screen.getByText('Login')).toBeTruthy();
});
