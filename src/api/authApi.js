import apiClient from './apiClient';
import { getUserById } from './userApi';

export const registerUser = async (formData) => {
    try {
        const response = await apiClient.post('/auth/register', formData);
        return response.data;
    } catch (error) {
        console.error("Failed to register user:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to register user");
        }
        throw new Error("An unexpected error occurred during registration");
    }
};

export const login = async (usernameOrEmail, password, setIsAuthenticated, setUser) => {
    try {
        const response = await apiClient.post('/auth/login', {
            usernameOrEmail,
            password
        });

        if (response.status !== 200) {
            setIsAuthenticated(false);
            setUser({});
            return false;
        }

        const user = response.data;
        localStorage.setItem('token', user.token);
        localStorage.setItem('userId', user.user_id);
        localStorage.setItem('role', user.role);

        const userData = await getUserById(user.user_id);
        setIsAuthenticated(true);
        setUser(userData);

        return true;
    } catch (error) {
        console.error("Login failed:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Login failed");
        }
        throw new Error("An unexpected error occurred during login");
    }
};

export const logout = async (setIsAuthenticated, setUser, setIsAdmin) => {
    try {
        const response = await apiClient.post('/auth/logout', {
            token: localStorage.getItem('token')
        });

        if (response.status === 200) {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('role');
            setIsAuthenticated(false);
            setIsAdmin(false);
            setUser({});
            return true;
        }

        return false;
    } catch (error) {
        console.error("Logout failed:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Logout failed");
        }
        throw new Error("An unexpected error occurred during logout");
    }
};

export const forgotPassword = async (email) => {
    try {
        const response = await apiClient.post('/auth/forgot-password', {
            email: email
        });
        return response.data;
    } catch (error) {
        console.error("Failed to send forgot password request:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to send forgot password request");
        }
        throw new Error("An unexpected error occurred while sending forgot password request");
    }
};

export const resetPassword = async (userId, token, newPassword) => {
    try {
        const response = await apiClient.post('/auth/reset-password', {
            userId, token, newPassword
        });
        return response.data;
    } catch (error) {
        console.error("Failed to reset password:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to reset password");
        }
        throw new Error("An unexpected error occurred while resetting password");
    }
};

export const verifyEmail = async (token) => {
    if (!token) return;

    try {
        const response = await apiClient.get('/auth/verify', { params: { token } });
        return response.data;
    } catch (error) {
        console.error("Email verification failed:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Email verification failed");
        }
        throw new Error("An unexpected error occurred during email verification");
    }
};

export const resendVerificationEmail = async (userId) => {
    if (!userId) return;

    try {
        const response = await apiClient.put('/auth/resend-verification-email', null, {
            params: { id: userId },
        });
        return response.data;
    } catch (error) {
        console.error("Failed to resend verification email:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "Failed to resend verification email");
        }
        throw new Error("An unexpected error occurred while resending verification email");
    }
};

export const apiWithAuth = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');

    if (token) {
        options.headers = {
            ...options.headers,
            Authorization: `Bearer ${token}`,
        };
    }

    try {
        const response = await apiClient(endpoint, options);
        return response.data;
    } catch (error) {
        console.error("API request failed:", error);
        if (error.response) {
            throw new Error(error.response.data.error || "API request failed");
        }
        throw new Error("An unexpected error occurred during the API request");
    }
};