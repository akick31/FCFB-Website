import { useEffect, useRef } from 'react';
import { refreshSession } from '../api/authApi';

const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'scroll', 'visibilitychange'];
const CHECK_INTERVAL_MS = 60 * 1000;
const IDLE_CUTOFF_MS = 15 * 60 * 1000;
const RENEW_WHEN_REMAINING_MS = 20 * 60 * 1000;

const expiryOf = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload?.exp ? payload.exp * 1000 : null;
    } catch {
        return null;
    }
};

/**
 * Tokens carry a fixed lifetime, so a session that is still being used has to be renewed before it lapses.
 * Renewal needs recent activity, which is what keeps an abandoned tab from staying signed in forever.
 */
export const useSessionRefresh = (isAuthenticated) => {
    const lastActivity = useRef(Date.now());
    const refreshing = useRef(false);

    useEffect(() => {
        if (!isAuthenticated) return undefined;

        const markActive = () => { lastActivity.current = Date.now(); };
        ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, markActive, { passive: true }));

        const interval = setInterval(async () => {
            if (refreshing.current) return;
            if (Date.now() - lastActivity.current > IDLE_CUTOFF_MS) return;

            const token = localStorage.getItem('token');
            if (!token) return;
            const expiresAt = expiryOf(token);
            if (expiresAt == null || expiresAt - Date.now() > RENEW_WHEN_REMAINING_MS) return;

            refreshing.current = true;
            try {
                await refreshSession();
            } catch {
                // An expired or revoked token is handled by the response interceptor.
            } finally {
                refreshing.current = false;
            }
        }, CHECK_INTERVAL_MS);

        return () => {
            clearInterval(interval);
            ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, markActive));
        };
    }, [isAuthenticated]);
};

export default useSessionRefresh;
