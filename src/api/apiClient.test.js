/** @jest-environment jsdom */
import apiClient from './apiClient';

jest.mock('../config/api', () => ({ baseURL: '/api/v1/arceus' }));

beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'current');
    localStorage.setItem('userId', '17');
    localStorage.setItem('role', 'ADMIN');
});

const successfulAdapter = jest.fn(async (config) => ({ data: {}, status: 200, headers: {}, config }));

test('requests without explicit authorization use the current session token', async () => {
    const response = await apiClient.get('/test', { adapter: successfulAdapter });
    expect(response.config.headers.get('Authorization')).toBe('Bearer current');
});

test('explicit logout authorization is retained when the stored session changes before dispatch', async () => {
    const request = apiClient.post('/auth/logout', null, {
        headers: { authorization: 'Bearer original' },
        adapter: successfulAdapter,
    });
    localStorage.setItem('token', 'new');
    const response = await request;
    expect(response.config.headers.get('Authorization')).toBe('Bearer original');
});

test('requests without a session do not receive a bearer token', async () => {
    localStorage.clear();
    const response = await apiClient.get('/test', { adapter: successfulAdapter });
    expect(response.config.headers.has('Authorization')).toBe(false);
});

test('a current-session 401 invalidates the session and rejects the original error', async () => {
    const error = new Error('Unauthorized');
    const adapter = async (config) => {
        error.config = config;
        error.response = { status: 401 };
        throw error;
    };
    await expect(apiClient.get('/test', { adapter })).rejects.toBe(error);
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('role')).toBeNull();
});

test('a stale-session 401 preserves a newer login and rejects the original error', async () => {
    let rejectRequest;
    let requestConfig;
    const adapter = (config) => {
        requestConfig = config;
        return new Promise((resolve, reject) => {
            rejectRequest = reject;
        });
    };
    const request = apiClient.get('/test', { adapter });
    await Promise.resolve();
    await Promise.resolve();
    localStorage.setItem('token', 'new');
    const error = new Error('Unauthorized');
    error.config = requestConfig;
    error.response = { status: 401 };
    rejectRequest(error);
    await expect(request).rejects.toBe(error);
    expect(localStorage.getItem('token')).toBe('new');
    expect(localStorage.getItem('role')).toBe('ADMIN');
});
