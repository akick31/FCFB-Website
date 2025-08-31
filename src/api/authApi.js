import apiClient from './apiClient';
import { getUserById } from './userApi';

const toPlainObject = (maybeFormData) =>
    maybeFormData instanceof FormData
        ? Object.fromEntries(maybeFormData.entries())
        : maybeFormData;

export const registerUser = async (formOrObj) => {
    try {
        const body = toPlainObject(formOrObj);
        const response = await apiClient.post('/auth/register', body);
        return response.data;
    } catch (error) {
        console.error('Failed to register user:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to register user');
        }
        throw new Error('An unexpected error occurred during registration');
    }
};

export const login = async (usernameOrEmail, password, setIsAuthenticated, setUser) => {
    try {
        const response = await apiClient.post('/auth/login', { usernameOrEmail, password });

        if (response.status !== 200) {
            setIsAuthenticated(false);
            setUser({});
            return false;
        }

        const auth = response.data;
        console.log('Login response data:', auth);
        console.log('Response data keys:', Object.keys(auth));
        console.log('Response data values:', Object.values(auth));

        // Be defensive about field names - let's see what we actually get
        const token =
            auth?.token ?? auth?.session?.token ?? auth?.accessToken ?? auth?.jwt ?? null;
        const userId =
            auth?.userId ?? auth?.user?.id ?? auth?.user_id ?? auth?.id ?? null;
        const role =
            auth?.role ?? auth?.user?.role ?? null;

        console.log('Parsed values:', { token, userId, role });

        if (!token || !userId) {
            console.error('Login response missing token or userId:', { token, userId, role });
            throw new Error('Login response missing token or userId');
        }

        localStorage.setItem('token', token);
        localStorage.setItem('userId', String(userId));
        if (role != null) localStorage.setItem('role', String(role));

        console.log('Stored in localStorage:', { 
            token: localStorage.getItem('token'), 
            userId: localStorage.getItem('userId'), 
            role: localStorage.getItem('role') 
        });

        const userData = await getUserById(userId);
        console.log('Fetched user data:', userData);
        
        setIsAuthenticated(true);
        setUser(userData);

        return true;
    } catch (error) {
        console.error('Login failed:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Login failed');
        }
        throw new Error('An unexpected error occurred during login');
    }
};

export const logout = async (setIsAuthenticated, setUser, setIsAdmin) => {
    try {
        const token = localStorage.getItem('token');
        const response = await apiClient.post('/auth/logout', null, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('role');
            setIsAuthenticated(false);
            if (typeof setIsAdmin === 'function') setIsAdmin(false);
            setUser({});
            return true;
        }

        return false;
    } catch (error) {
        console.error('Logout failed:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Logout failed');
        }
        throw new Error('An unexpected error occurred during logout');
    }
};

export const forgotPassword = async (email) => {
    try {
        const response = await apiClient.post('/auth/forgot-password', { email });
        return response.data;
    } catch (error) {
        console.error('Failed to send forgot password request:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to send forgot password request');
        }
        throw new Error('An unexpected error occurred while sending forgot password request');
    }
};

export const resetPassword = async (token, newPassword) => {
    try {
        const response = await apiClient.post('/auth/reset-password', { 
            token, 
            newPassword 
        });
        return response.data;
    } catch (error) {
        console.error('Failed to reset password:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to reset password');
        }
        throw new Error('An unexpected error occurred while resetting password');
    }
};

export const verifyEmail = async (token) => {
    if (!token) return;
    try {
        const response = await apiClient.get('/auth/verify-email', { params: { token } });
        return response.data;
    } catch (error) {
        console.error('Email verification failed:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Email verification failed');
        }
        throw new Error('An unexpected error occurred during email verification');
    }
};

export const resendVerificationEmail = async (newSignupId) => {
    if (!newSignupId) return;
    try {
        const response = await apiClient.post(
            '/auth/verification-email/resend',
            null,
            { params: { newSignupId } }
        );
        return response.data;
    } catch (error) {
        console.error('Failed to resend verification email:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to resend verification email');
        }
        throw new Error('An unexpected error occurred while resending verification email');
    }
};

export const apiWithAuth = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');

    const config = {
        url: endpoint,
        method: options.method || 'get',
        ...options,
        headers: {
            ...(options.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    };

    try {
        const response = await apiClient.request(config);
        return response.data;
    } catch (error) {
        console.error('API request failed:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'API request failed');
        }
        throw new Error('An unexpected error occurred during the API request');
    }
};