import React from 'react';
import LoginForm from '../components/forms/LoginForm';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';

const Login = ({ setIsAuthenticated, setUser, setIsAdmin }) => {
    return (
        <Box>
            <LoginForm setIsAuthenticated={setIsAuthenticated} setUser={setUser} setIsAdmin={setIsAdmin} />
        </Box>
    );
}

Login.propTypes = {
    setIsAuthenticated: PropTypes.func.isRequired,
    setUser: PropTypes.func.isRequired,
    setIsAdmin: PropTypes.func.isRequired,
};

export default Login;