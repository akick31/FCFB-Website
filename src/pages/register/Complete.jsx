import React from 'react';
import CompleteRegistrationForm from '../../components/forms/CompleteRegistrationForm';
import PageWrap from '../../components/layout/PageWrap';
import { useSeo } from '../../hooks/useSeo';

const Complete = () => {
    useSeo({ title: 'Complete registration | Fake College Football', description: 'Finish setting up your Fake College Football coach account.' });

    return (
        <PageWrap>
            <CompleteRegistrationForm />
        </PageWrap>
    );
};

export default Complete;
