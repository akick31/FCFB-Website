/** @jest-environment jsdom */
import { logout } from './authApi';
import apiClient from './apiClient';

jest.mock('./apiClient', () => ({ post: jest.fn() }));
jest.mock('./userApi', () => ({ getUserById: jest.fn() }));

let setIsAuthenticated;
let setUser;
let setIsAdmin;

beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'original');
    localStorage.setItem('userId', '17');
    localStorage.setItem('role', 'ADMIN');
    localStorage.setItem('apiKey', 'explorer');
    setIsAuthenticated = jest.fn();
    setUser = jest.fn();
    setIsAdmin = jest.fn();
});

const startLogout = () => logout(setIsAuthenticated, setUser, setIsAdmin);

test('successful logout clears the matching session and leaves explorer credentials intact', async () => {
    apiClient.post.mockResolvedValue({ status: 200 });
    await expect(startLogout()).resolves.toBe(true);
    expect(apiClient.post).toHaveBeenCalledWith('/auth/logout', null, {
        headers: { Authorization: 'Bearer original' },
    });
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('userId')).toBeNull();
    expect(localStorage.getItem('role')).toBeNull();
    expect(localStorage.getItem('apiKey')).toBe('explorer');
    expect(setIsAuthenticated).toHaveBeenCalledWith(false);
    expect(setIsAdmin).toHaveBeenCalledWith(false);
    expect(setUser).toHaveBeenCalledWith({});
});

test.each(['new', null])('late logout success cannot mutate a changed session (%s)', async (token) => {
    let resolveLogout;
    apiClient.post.mockReturnValue(
        new Promise((resolve) => {
            resolveLogout = resolve;
        })
    );
    const pending = startLogout();
    if (token) {
        localStorage.setItem('token', token);
    } else {
        localStorage.removeItem('token');
    }
    resolveLogout({ status: 200 });
    await expect(pending).resolves.toBe(false);
    expect(localStorage.getItem('token')).toBe(token);
    expect(setIsAuthenticated).not.toHaveBeenCalled();
    expect(setUser).not.toHaveBeenCalled();
    expect(setIsAdmin).not.toHaveBeenCalled();
});

test.each([
    [new Error('Network failure'), 'An unexpected error occurred during logout'],
    [{ response: { data: { error: 'Logout rejected' } } }, 'Logout rejected'],
])('logout failures retain the existing rejection contract', async (error, message) => {
    apiClient.post.mockRejectedValue(error);
    await expect(startLogout()).rejects.toThrow(message);
    expect(localStorage.getItem('token')).toBe('original');
    expect(setIsAuthenticated).not.toHaveBeenCalled();
    expect(setUser).not.toHaveBeenCalled();
    expect(setIsAdmin).not.toHaveBeenCalled();
});

test('a non-successful response leaves the session intact', async () => {
    apiClient.post.mockResolvedValue({ status: 202 });
    await expect(startLogout()).resolves.toBe(false);
    expect(localStorage.getItem('token')).toBe('original');
    expect(setIsAuthenticated).not.toHaveBeenCalled();
});
