/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import Header from './Header';
import apiClient from '../../api/apiClient';
import { useNavigate } from 'react-router-dom';

jest.mock('react-router-dom', () => ({ useNavigate: jest.fn() }));
jest.mock('../../api/apiClient', () => ({ post: jest.fn() }));
jest.mock('../../api/userApi', () => ({ getUserById: jest.fn() }));
jest.mock('../../hooks/useTeamsMap', () => ({ useTeamsMap: () => ({}), ensureTeam: jest.fn() }));
jest.mock('../../hooks/useConferencesMap', () => ({ useConferencesMap: jest.fn() }));
jest.mock('./CommandBar', () => ({
    __esModule: true,
    default: ({ onLogout }) => <button onClick={onLogout}>Logout</button>,
}));
jest.mock('./LiveTicker', () => ({ __esModule: true, default: () => null }));
jest.mock('./MobileNavDrawer', () => ({ __esModule: true, default: () => null }));

let callbacks;
let navigate;

beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'original');
    localStorage.setItem('userId', '17');
    localStorage.setItem('role', 'ADMIN');
    navigate = jest.fn();
    useNavigate.mockReturnValue(navigate);
    callbacks = { setIsAuthenticated: jest.fn(), setUser: jest.fn(), setIsAdmin: jest.fn() };
});

const clickLogout = () => {
    render(<Header isAuthenticated isAdmin user={{ id: 17 }} {...callbacks} />);
    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));
};

test('Header signs out and navigates immediately while remote logout is pending', async () => {
    let resolveLogout;
    apiClient.post.mockReturnValue(
        new Promise((resolve) => {
            resolveLogout = resolve;
        })
    );
    clickLogout();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('userId')).toBeNull();
    expect(localStorage.getItem('role')).toBeNull();
    expect(callbacks.setIsAuthenticated).toHaveBeenCalledWith(false);
    expect(callbacks.setIsAdmin).toHaveBeenCalledWith(false);
    expect(callbacks.setUser).toHaveBeenCalledWith(null);
    expect(navigate).toHaveBeenCalledWith('/');
    expect(apiClient.post).toHaveBeenCalledWith('/auth/logout', null, {
        headers: { Authorization: 'Bearer original' },
    });
    await act(async () => resolveLogout({ status: 200 }));
    expect(callbacks.setIsAuthenticated).toHaveBeenCalledTimes(1);
});

test('late remote logout success leaves a newer login untouched', async () => {
    let resolveLogout;
    apiClient.post.mockReturnValue(
        new Promise((resolve) => {
            resolveLogout = resolve;
        })
    );
    clickLogout();
    localStorage.setItem('token', 'new');
    localStorage.setItem('userId', '18');
    localStorage.setItem('role', 'USER');
    await act(async () => resolveLogout({ status: 200 }));
    expect(localStorage.getItem('token')).toBe('new');
    expect(localStorage.getItem('userId')).toBe('18');
    expect(localStorage.getItem('role')).toBe('USER');
    Object.values(callbacks).forEach((callback) => expect(callback).toHaveBeenCalledTimes(1));
    expect(navigate).toHaveBeenCalledTimes(1);
});

test('remote rejection is handled without restoring the local session or logging credentials', async () => {
    const logging = jest.spyOn(console, 'error').mockImplementation(() => {});
    apiClient.post.mockRejectedValue({
        config: { headers: { Authorization: 'Bearer original' } },
        response: { data: { error: 'Remote logout unavailable' } },
    });
    try {
        clickLogout();
        await act(async () => {});
        expect(localStorage.getItem('token')).toBeNull();
        expect(callbacks.setIsAuthenticated).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith('/');
        expect(logging).toHaveBeenCalledTimes(1);
        expect(logging).toHaveBeenCalledWith('Remote logout failed. The local session was cleared.');
    } finally {
        logging.mockRestore();
    }
});
