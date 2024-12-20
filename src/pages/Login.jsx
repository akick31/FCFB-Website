import React from 'react';
import LoginForm from '../forms/LoginForm';
import PropTypes from 'prop-types';

const Login = ({ setIsAuthenticated, setUser, setIsAdmin }) => {
    return (
        <div>
            <LoginForm setIsAuthenticated={ setIsAuthenticated } setUser={ setUser } setIsAdmin={ setIsAdmin } />
        </div>
    );
}

Login.propTypes = {
    setIsAuthenticated: PropTypes.func.isRequired,
    setUser: PropTypes.func.isRequired,
    setIsAdmin: PropTypes.func.isRequired,
};

export default Login;
