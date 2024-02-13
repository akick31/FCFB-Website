// auth.js

// Function to authenticate user
export const login = (token) => {
    localStorage.setItem('token', token);
};

// Function to log out user
export const logout = () => {
    localStorage.removeItem('token');
};

// Function to check if user is authenticated
export const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
};
