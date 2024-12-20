import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Box, Button, Divider, Grid, Paper, Typography } from '@mui/material';
import { getTeamByName } from '../api/teamApi';
import { resendVerificationEmail } from "../api/authApi";
import PropTypes from 'prop-types';

const ProfileContainer = ({ user }) => {
    const [team, setTeam] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const team = await getTeamByName(user.team);
            setTeam(team);
        };
        fetchData();
    }, [user.team]);

    const handleResendVerification = async () => {
        try {
            await resendVerificationEmail(user.id);
            alert('Verification email has been resent. Please check your email.');
            navigate('/');
        } catch (error) {
            console.error('Error resending verification email:', error);
            alert('Error resending verification email. Please try again later.');
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
            {!user.approved && (
                <Paper elevation={3} sx={{ p: 3, mb: 3, textAlign: 'center' }}>
                    <Typography variant="h6" color="error" gutterBottom>
                        Your email is not verified!
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Please check your email for the verification link or click the button below to resend the email.
                    </Typography>
                    <Button variant="contained" color="primary" onClick={handleResendVerification}>
                        Resend Verification Email
                    </Button>
                </Paper>
            )}

            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    User Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="body1">
                            <strong>Username:</strong> {user.username}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body1">
                            <strong>Role:</strong> {user.role}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body1">
                            <strong>Coach Name:</strong> {user.coachName}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body1">
                            <strong>Discord Tag:</strong> {user.discordTag}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body1">
                            <strong>Reddit Username:</strong> /u/{user.redditUsername}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body1">
                            <strong>Email:</strong> {user.email}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body1">
                            <strong>Overall Record:</strong> {user.wins}-{user.losses}
                            {user.winPercentage !== undefined && ` | ${user.winPercentage.toFixed(3)}`}
                        </Typography>
                    </Grid>
                </Grid>

                {user.team && (
                    <>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="h5" gutterBottom>
                            Team Information
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="body1">
                                    <strong>College:</strong> {user.team}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body1">
                                    <strong>Conference:</strong> {team.subdivision} | {team.conference}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body1">
                                    <strong>Offensive Playbook:</strong> {team.offensivePlaybook}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body1">
                                    <strong>Defensive Playbook:</strong> {team.defensivePlaybook}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body1">
                                    <strong>Team Record:</strong> {team.currentWins}-{team.currentLosses} (
                                    {team.currentConferenceWins}-{team.currentConferenceLosses})
                                </Typography>
                            </Grid>
                        </Grid>
                    </>
                )}
            </Paper>
        </Box>
    );
};

ProfileContainer.propTypes = {
    user: PropTypes.object.isRequired,
}

export default ProfileContainer;