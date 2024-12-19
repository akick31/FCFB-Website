import apiClient from './apiClient';
import { getUserById } from './userApi';

export const registerUser = async (formData) => {
    try {
        const response = await apiClient.post('/arceus/auth/register', formData);
        return response.data;
    } catch (error) {
        console.error("Failed to register user:", error);
        throw error;
    }
};

export const login = async (usernameOrEmail, password, setIsAuthenticated, setUser) => {
    try {
        const response = await apiClient.post('/arceus/auth/login', null, {
            params: { usernameOrEmail, password },
        });

        if (response.status !== 200) {
            setIsAuthenticated(false);
            setUser({});
            return false;
        }

        const user = response.data;
        // Store the token and user data in localStorage
        localStorage.setItem('token', user.token);
        localStorage.setItem('userId', user.user_id);
        localStorage.setItem('role', user.role);

        // Optionally, store any additional user data if needed
        const userData = await getUserById(user.userId);
        setIsAuthenticated(true);
        setUser(userData);

        return true;
    } catch (error) {
        console.error("Login failed:", error);
        return false;
    }
};

export const logout = async (setIsAuthenticated, setUser, setIsAdmin) => {
    try {
        const response = await apiClient.post('/arceus/auth/logout', null, {
            params: { token: localStorage.getItem('token') },
        });

        if (response.status === 200) {
            // Remove token and user info from localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('role');
            setIsAuthenticated(false);
            setIsAdmin(false);
            setUser({});
            alert("You have been logged out.");
            return true;
        }

        return false;
    } catch (error) {
        console.error("Logout failed:", error);
        return false;
    }
};


export const verifyEmail = async (token) => {
    if (!token) return;

    try {
        const response = await apiClient.get('/arceus/auth/verify', { params: { token } });
        return response.data;
    } catch (error) {
        console.error("Email verification failed:", error);
        throw error;
    }
};

export const resendVerificationEmail = async (userId) => {
    if (!userId) return;

    try {
        const response = await apiClient.put('/arceus/auth/resend-verification-email', null, {
            params: { id: userId },
        });
        return response.data;
    } catch (error) {
        console.error("Failed to resend verification email:", error);
        throw error;
    }
};

// Helper function to add token to API requests
export const apiWithAuth = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');

    if (token) {
        // Include Authorization header with the JWT token
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
        throw error;
    }
};
