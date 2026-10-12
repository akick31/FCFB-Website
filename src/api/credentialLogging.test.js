/** @jest-environment jsdom */
import apiClient from './apiClient';
import { registerUser, resetPassword, verifyEmail, forgotPassword } from './authApi';
import { generateApiKey, updatePassword } from './userApi';

jest.mock('./apiClient', () => ({ post: jest.fn(), get: jest.fn(), put: jest.fn() }));
let logging;
beforeEach(() => {
    jest.resetAllMocks();
    logging = jest.spyOn(console, 'error').mockImplementation(() => {});
    const transportError = {
        config: { headers: { Authorization: 'Bearer sensitive-token' }, data: { password: 'sensitive-password' } },
        response: { data: { error: 'Rejected', apiKey: 'sensitive-key' } },
    };
    apiClient.post.mockRejectedValue(transportError);
    apiClient.get.mockRejectedValue(transportError);
    apiClient.put.mockRejectedValue(transportError);
});
afterEach(() => jest.restoreAllMocks());

test.each([
    ['registration', () => registerUser({ password: 'sensitive-password' })],
    ['reset', () => resetPassword('sensitive-token', 'sensitive-password')],
    ['verification', () => verifyEmail('sensitive-token')],
    ['forgot password', () => forgotPassword('user@example.test')],
    ['API key', () => generateApiKey(1)],
    ['password update', () => updatePassword(1, 'old-password', 'new-password')],
])('%s retains its error contract without logging transport credentials', async (name, request) => {
    await expect(request()).rejects.toThrow('Rejected');
    expect(logging).toHaveBeenCalled();
    for (const args of logging.mock.calls) {
        expect(args).toHaveLength(1);
        expect(typeof args[0]).toBe('string');
        expect(args[0]).not.toMatch(/sensitive-/);
    }
});
