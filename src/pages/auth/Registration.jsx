import React from 'react';
import PageWrap from '../../components/layout/PageWrap';
import RegistrationForm from '../../components/forms/RegistrationForm';
import { useSeo } from '../../hooks/useSeo';

const Registration = () => {
    useSeo({ title: 'Create account | Fake College Football', description: 'Join Fake College Football and create your coach account with Discord.' });

    return (
        <PageWrap>
            <RegistrationForm />
        </PageWrap>
    );
};

export default Registration;
