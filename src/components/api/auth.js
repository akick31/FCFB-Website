import axios from "axios";
import {getUserById} from "./user";

export const registerUser = async (formData) => {
    const response = await axios.post('http://localhost:8080/arceus/auth/register', formData);
    return response
}

export const login = async (usernameOrEmail, password, setIsAuthenticated, setUser) => {
    try {
        const response = await axios.post('http://localhost:8080/arceus/auth/login', null,{
            params: {
                usernameOrEmail: usernameOrEmail,
                password: password
            }
        });
        if (response.status !== 200) {
            setIsAuthenticated(false);
            setUser({})
            return false;
        }
        const user = response.data;
        localStorage.setItem('token', user.token);
        localStorage.setItem('userId', user.userId);

        const userData = await getUserById(user.userId);
        setIsAuthenticated(true);
        setUser(userData);

        return true

    } catch (error) {
        return false;
    }
};

export const logout = async (setIsAuthenticated, setUser) => {
    try {
        const response = await axios.post('http://localhost:8080/arceus/auth/logout', null, {
            params: {
                token: localStorage.getItem('token')
            }
        });
        if (response.status !== 200) {
            return false;
        }
        localStorage.removeItem('token');
        localStorage.removeItem('userId');

        setIsAuthenticated(false);
        setUser({});
        alert("You have been logged out.")
        return true;
    } catch (error) {
        return false;
    }
};

export const verifyEmail = async (token) => {
    if (token === null) {
        return
    }
    return await axios.get(`http://localhost:8080/arceus/auth/verify?token=${token}`)
}

export const resendVerificationEmail = async (userId) => {
    if (userId === null) {
        return
    }
    return await axios.put('http://localhost:8080/arceus/auth/resend-verification-email', null, {
        params: {
            id: userId
        }
    })
}