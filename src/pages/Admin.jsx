import React from 'react';
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import { Box, Button, Typography, Paper } from '@mui/material';

const Admin = ({ user }) => {
    const navigate = useNavigate();

    if (user.role === "USER") {
        navigate('*'); // Redirect to the not-found page if the user is not an admin
    }

    const handleNavigateToUsers = () => {
        navigate('/users');
    };

    const handleNavigateToSignups = () => {
        navigate('/new-signups');
    };

    const handleNavigateToStartGamesDashboard = () => {
        navigate('*');
    };


    return (
        <Box
            sx={{
                padding: 4,
                maxWidth: 600,
                margin: 'auto',
                marginTop: 4,
                borderRadius: 2,
                boxShadow: 3,
                backgroundColor: '#f9f9f9',
            }}
            component={Paper}
        >
            <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
                Admin Dashboard
            </Typography>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    marginTop: 4,
                }}
            >
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNavigateToStartGamesDashboard}
                    fullWidth
                >
                    Start Games
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNavigateToUsers}
                    fullWidth
                >
                    View Current Users
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNavigateToSignups}
                    fullWidth
                >
                    View New Signups
                </Button>
            </Box>
        </Box>
    );
};

Admin.propTypes = {
    user: PropTypes.shape({
        role: PropTypes.string.isRequired,
    }).isRequired,
};

export default Admin;