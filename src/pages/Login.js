// Login.js
import React from 'react';
import LoginForm from '../forms/LoginForm';

const Login = ({ setIsAuthenticated, setUser }) => {
    return (
        <div>
            <LoginForm setIsAuthenticated={ setIsAuthenticated } setUser={ setUser } />
        </div>
    );
}

export default Login;
