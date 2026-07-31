import React from 'react';
import PropTypes from 'prop-types';
import PageWrap from '../../components/layout/PageWrap';
import LoginForm from '../../components/forms/LoginForm';
import { useSeo } from '../../hooks/useSeo';

const Login = ({ setIsAuthenticated, setUser, setIsAdmin }) => {
    useSeo({ title: 'Log in | Fake College Football', description: 'Sign in to your Fake College Football coach account.' });

    return (
        <PageWrap>
            <LoginForm setIsAuthenticated={setIsAuthenticated} setUser={setUser} setIsAdmin={setIsAdmin} />
        </PageWrap>
    );
};

Login.propTypes = {
    setIsAuthenticated: PropTypes.func.isRequired,
    setUser: PropTypes.func.isRequired,
    setIsAdmin: PropTypes.func.isRequired,
};

export default Login;
