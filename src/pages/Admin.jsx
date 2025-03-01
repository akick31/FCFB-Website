import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import { Box, Button, Typography, Paper, CircularProgress } from '@mui/material';

const Admin = ({ user }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // If user is not loaded yet, just return (we're loading)
        if (!user || !user.role) {
            setLoading(true);
            return;
        }

        // Once the user is loaded, check the role
        if (user.role !== "ADMIN" && user.role !== "CONFERENCE_COMMISSIONER") {
            navigate('*');
        } else {
            setLoading(false);
        }
    }, [user, navigate]);

    const handleNavigateToUsers = () => {
        navigate('/users');
    };

    const handleNavigateToOpenTeams = () => {
        navigate('/open-teams');
    }

    const handleNavigateToSignups = () => {
        navigate('/new-signups');
    };

    const handleNavigateToStartGamesDashboard = () => {
        navigate('*');
    };

    if (loading) {
        return (
            <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

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
                    onClick={handleNavigateToOpenTeams}
                    fullWidth
                >
                    View Open Teams
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