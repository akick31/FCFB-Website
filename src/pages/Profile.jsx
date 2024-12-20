import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileContainer from "../components/ProfileContainer";
import ProfileForm from "../forms/ProfileForm";
import { Box, Container } from '@mui/material';
import PropTypes from 'prop-types';

const Profile = ({ user }) => {
    const navigate = useNavigate();

    if (!user) {
        // Redirect to the login page if the user is not authenticated
        navigate('/login');
    }

    return (
        <Container sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <ProfileContainer user={user} />
                <ProfileForm user={user} />
            </Box>
        </Container>
    );
};

Profile.propTypes = {
    user: PropTypes.object,
}

export default Profile;