import React from 'react';
import CompleteRegistrationForm from '../../components/forms/CompleteRegistrationForm';
import PageLayout from '../../components/layout/PageLayout';

const Complete = () => {
    return (
        <PageLayout
            title="Complete Your Registration"
            subtitle="Finish setting up your FCFB account and choose your team preferences"
            background="background.default"
            showHeader={false}
            fullWidth={true}
        >
            <CompleteRegistrationForm />
        </PageLayout>
    );
}

export default Complete;
