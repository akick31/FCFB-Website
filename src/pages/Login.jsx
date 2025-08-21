import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import LoginForm from '../components/forms/LoginForm';

const Login = ({ setIsAuthenticated, setUser, setIsAdmin }) => {
    return (
        <PageLayout
            title="Welcome Back"
            subtitle="Sign in to your FCFB account to continue your journey"
            background="background.default"
            showHeader={false}
            fullWidth={true}
        >
            <LoginForm 
                setIsAuthenticated={setIsAuthenticated}
                setUser={setUser}
                setIsAdmin={setIsAdmin}
            />
        </PageLayout>
    );
};

export default Login;