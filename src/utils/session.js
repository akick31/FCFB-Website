export const SESSION_EXPIRED_EVENT = 'session-expired';

export const expireUnauthorizedSession = (error) => {
    const token = localStorage.getItem('token');
    const headers = error.config?.headers;
    const authorization = headers?.get?.('Authorization') ?? headers?.Authorization;
    if (error.response?.status !== 401 || !token || authorization !== `Bearer ${token}`) {
        return;
    }

    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
};
