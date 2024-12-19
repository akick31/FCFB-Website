// Login.jsx
import React from 'react';
import LoginForm from '../forms/LoginForm';

const Login = ({ setIsAuthenticated, setUser, setIsAdmin }) => {
    return (
        <div>
            <LoginForm setIsAuthenticated={ setIsAuthenticated } setUser={ setUser } setIsAdmin={ setIsAdmin } />
        </div>
    );
}

export default Login;
