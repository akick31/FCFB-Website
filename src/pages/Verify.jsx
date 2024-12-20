import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resendVerificationEmail, verifyEmail } from "../api/authApi";
import { CircularProgress, Box, Typography, Button, Paper } from '@mui/material';

const Verify = ({ userId, token }) => {
    const [loading, setLoading] = useState(true);
    const [verificationSuccess, setVerificationSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await verifyEmail(token);
                if (response.status !== 200) {
                    setVerificationSuccess(false);
                } else {
                    setVerificationSuccess(true);
                }
            } catch (error) {
                setVerificationSuccess(false);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    const handleResendVerification = async () => {
        try {
            await resendVerificationEmail(userId);
            alert('Verification email has been resent. Please check your email.');
            navigate('/');
        } catch (error) {
            console.error('Error resending verification email:', error);
            alert('Error resending verification email. Please try again later.');
        }
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 2 }}>
            <Paper elevation={3} sx={{ maxWidth: 400, p: 4, textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom>
                    Verifying Email...
                </Typography>
                {loading ? (
                    <CircularProgress color="primary" />
                ) : verificationSuccess ? (
                    <>
                        <Typography variant="body1" color="success.main" gutterBottom>
                            Email verified successfully!
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/login')}
                            sx={{ mt: 2 }}
                        >
                            Login
                        </Button>
                    </>
                ) : (
                    <>
                        <Typography variant="body1" color="error.main" gutterBottom>
                            Failed to verify email.
                        </Typography>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleResendVerification}
                            sx={{ mt: 2 }}
                        >
                            Resend Verification Email
                        </Button>
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default Verify;