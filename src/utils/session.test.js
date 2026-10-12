/** @jest-environment jsdom */
import { AxiosHeaders } from 'axios';
import { expireUnauthorizedSession, SESSION_EXPIRED_EVENT } from './session';

const unauthorized = (token) => ({
    response: { status: 401 },
    config: { headers: { Authorization: `Bearer ${token}` } },
});

beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'current');
    localStorage.setItem('userId', '17');
    localStorage.setItem('role', 'ADMIN');
    localStorage.setItem('apiKey', 'explorer');
});

test('a current-session 401 clears login fields and notifies the application once', () => {
    const expired = jest.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, expired);
    try {
        expireUnauthorizedSession(unauthorized('current'));
        expireUnauthorizedSession(unauthorized('current'));
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('userId')).toBeNull();
        expect(localStorage.getItem('role')).toBeNull();
        expect(localStorage.getItem('apiKey')).toBe('explorer');
        expect(expired).toHaveBeenCalledTimes(1);
    } finally {
        window.removeEventListener(SESSION_EXPIRED_EVENT, expired);
    }
});

test.each([
    unauthorized('previous'),
    { response: { status: 401 }, config: { headers: {} } },
    { response: { status: 403 }, config: { headers: { Authorization: 'Bearer current' } } },
    { message: 'Network error' },
])('unrelated failures preserve the current session', (error) => {
    expireUnauthorizedSession(error);
    expect(localStorage.getItem('token')).toBe('current');
    expect(localStorage.getItem('userId')).toBe('17');
    expect(localStorage.getItem('role')).toBe('ADMIN');
});

test('Axios header normalization still identifies the session bearer token', () => {
    expireUnauthorizedSession({
        response: { status: 401 },
        config: { headers: new AxiosHeaders({ authorization: 'Bearer current' }) },
    });
    expect(localStorage.getItem('token')).toBeNull();
});
