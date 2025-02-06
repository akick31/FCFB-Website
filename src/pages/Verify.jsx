import React, { useEffect, useState } from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import { resendVerificationEmail, verifyEmail } from "../api/authApi";
import {
    CircularProgress,
    Box,
    Typography,
    Button,
    useTheme,
    Card,
    CardHeader,
    CardContent,
    Alert
} from '@mui/material';
import PropTypes from 'prop-types';
import {Person} from "@mui/icons-material";

const Verify = ({ userId }) => {
    const theme = useTheme();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [verificationSuccess, setVerificationSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const params = new URLSearchParams(location.search);
                const token = params.get("token");
                const response = await verifyEmail(token);
                if (response === true) {
                    setVerificationSuccess(true);
                } else {
                    setVerificationSuccess(false);
                }
            } catch (error) {
                setVerificationSuccess(false);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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
        <Box sx={theme.root}>
            <Card sx={theme.formCard}>
                <CardHeader
                    title={
                        <Box textAlign="center" sx={{mb: -5}}>
                            <Person fontSize="large" sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
                            <Typography variant="h4" fontWeight={700} color="text.primary">
                                User Verification
                            </Typography>
                        </Box>
                    }
                />
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    {loading ? (
                        <CircularProgress color="primary" />
                    ) : verificationSuccess ? (
                        <>
                            <Alert severity="success" sx={{ mt: 2 }}>Successfully verified user!</Alert>
                            <Button
                                variant="contained"
                                backgroundColor="#004260"
                                onClick={() => navigate('/login')}
                                sx={{
                                    display: 'flex',
                                    mt: 2,
                                    py: 1.5,
                                    backgroundColor: theme.primary,
                                    borderRadius: 2,
                                    fontWeight: 700,
                                    fontSize: 16
                                }}
                            >
                                Login
                            </Button>
                        </>
                    ) : (
                        <>
                            <Alert severity="error" sx={{ mt: 2 }}>Failed to verify email. Please try again.</Alert>
                            <Button
                                variant="contained"
                                backgroundColor="#004260"
                                onClick={handleResendVerification}
                                sx={{
                                    display: 'flex',
                                    mt: 2,
                                    py: 1.5,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: theme.primary,
                                    borderRadius: 2,
                                    fontWeight: 700,
                                    fontSize: 16
                                }}
                            >
                                Resend Verification Email
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

Verify.propTypes = {
    userId: PropTypes.string.isRequired,
    token: PropTypes.string.isRequired,
};

export default Verify;