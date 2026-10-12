/** @jest-environment jsdom */
import { login } from './authApi';
import apiClient from './apiClient';
import { getUserById } from './userApi';

jest.mock('./apiClient', () => ({ post: jest.fn() }));
jest.mock('./userApi', () => ({ getUserById: jest.fn() }));

let setIsAuthenticated;
let setUser;

beforeEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
    localStorage.setItem('apiKey', 'explorer');
    apiClient.post.mockResolvedValue({ status: 200, data: { token: 'login-token', userId: 17, role: 'ADMIN' } });
    getUserById.mockResolvedValue({ id: 17 });
    setIsAuthenticated = jest.fn();
    setUser = jest.fn();
});

const startLogin = (signal) => login('coach', 'password', setIsAuthenticated, setUser, signal);

test.each([
    { token: 'login-token', userId: 17, role: 'ADMIN' },
    { session: { token: 'login-token' }, user: { id: 17, role: 'ADMIN' } },
    { accessToken: 'login-token', user_id: 17, role: 'ADMIN' },
    { jwt: 'login-token', id: 17, role: 'ADMIN' },
])('successful login preserves compatible response fields (%j)', async (data) => {
    apiClient.post.mockResolvedValue({ status: 200, data });
    await expect(startLogin()).resolves.toBe(true);
    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', { usernameOrEmail: 'coach', password: 'password' });
    expect(getUserById).toHaveBeenCalledWith(17);
    expect(localStorage.getItem('token')).toBe('login-token');
    expect(localStorage.getItem('userId')).toBe('17');
    expect(localStorage.getItem('role')).toBe('ADMIN');
    expect(localStorage.getItem('apiKey')).toBe('explorer');
    expect(setIsAuthenticated).toHaveBeenCalledWith(true);
    expect(setUser).toHaveBeenCalledWith({ id: 17 });
});

test.each([null, 'new-token'])('a late profile cannot restore a removed or replaced token (%s)', async (token) => {
    let resolveProfile;
    getUserById.mockReturnValue(
        new Promise((resolve) => {
            resolveProfile = resolve;
        })
    );
    const pending = startLogin();
    await Promise.resolve();
    if (token) {
        localStorage.setItem('token', token);
    } else {
        localStorage.removeItem('token');
    }
    resolveProfile({ id: 17 });
    await expect(pending).resolves.toBeUndefined();
    expect(setIsAuthenticated).not.toHaveBeenCalled();
    expect(setUser).not.toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBe(token);
});

test('a canceled credential response cannot write login storage', async () => {
    let resolveLogin;
    apiClient.post.mockReturnValue(
        new Promise((resolve) => {
            resolveLogin = resolve;
        })
    );
    const controller = new AbortController();
    const pending = startLogin(controller.signal);
    controller.abort();
    resolveLogin({ status: 200, data: { token: 'login-token', userId: 17 } });
    await expect(pending).resolves.toBeUndefined();
    expect(localStorage.getItem('token')).toBeNull();
    expect(getUserById).not.toHaveBeenCalled();
    expect(setIsAuthenticated).not.toHaveBeenCalled();
});

test('another login completed during the credential request remains current', async () => {
    let resolveLogin;
    apiClient.post.mockReturnValue(
        new Promise((resolve) => {
            resolveLogin = resolve;
        })
    );
    const pending = startLogin();
    localStorage.setItem('token', 'new-token');
    resolveLogin({ status: 200, data: { token: 'login-token', userId: 17 } });
    await expect(pending).resolves.toBeUndefined();
    expect(localStorage.getItem('token')).toBe('new-token');
    expect(getUserById).not.toHaveBeenCalled();
    expect(setIsAuthenticated).not.toHaveBeenCalled();
});

test('a canceled profile response cannot invoke session setters', async () => {
    let resolveProfile;
    getUserById.mockReturnValue(
        new Promise((resolve) => {
            resolveProfile = resolve;
        })
    );
    const controller = new AbortController();
    const pending = startLogin(controller.signal);
    await Promise.resolve();
    controller.abort();
    resolveProfile({ id: 17 });
    await expect(pending).resolves.toBeUndefined();
    expect(setIsAuthenticated).not.toHaveBeenCalled();
    expect(setUser).not.toHaveBeenCalled();
});

test('a canceled failure is ignored without logging credential-bearing errors', async () => {
    let rejectLogin;
    apiClient.post.mockReturnValue(
        new Promise((resolve, reject) => {
            rejectLogin = reject;
        })
    );
    const controller = new AbortController();
    const pending = startLogin(controller.signal);
    const logging = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
        controller.abort();
        rejectLogin({ config: { data: { password: 'password' } } });
        await expect(pending).resolves.toBeUndefined();
        expect(logging).not.toHaveBeenCalled();
    } finally {
        logging.mockRestore();
    }
});

test('a malformed response rejects without exposing its token', async () => {
    const logging = jest.spyOn(console, 'error').mockImplementation(() => {});
    apiClient.post.mockResolvedValue({ status: 200, data: { token: 'login-token' } });
    try {
        await expect(startLogin()).rejects.toThrow('An unexpected error occurred during login');
        expect(logging).not.toHaveBeenCalled();
        expect(localStorage.getItem('token')).toBeNull();
    } finally {
        logging.mockRestore();
    }
});

test('a rejected login preserves its existing error message', async () => {
    apiClient.post.mockRejectedValue({ response: { data: { error: 'Invalid credentials' } } });
    await expect(startLogin()).rejects.toThrow('Invalid credentials');
    expect(setIsAuthenticated).not.toHaveBeenCalled();
});

test('a non-success response preserves the false result and state callbacks', async () => {
    apiClient.post.mockResolvedValue({ status: 202 });
    await expect(startLogin()).resolves.toBe(false);
    expect(setIsAuthenticated).toHaveBeenCalledWith(false);
    expect(setUser).toHaveBeenCalledWith({});
});

test('a response without a role removes the prior stored role', async () => {
    localStorage.setItem('role', 'ADMIN');
    apiClient.post.mockResolvedValue({ status: 200, data: { token: 'login-token', userId: 17 } });
    await expect(startLogin()).resolves.toBe(true);
    expect(localStorage.getItem('role')).toBeNull();
});
