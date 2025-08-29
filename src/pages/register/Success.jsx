import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { CheckCircle, Email, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const RegistrationSuccess = () => {
    const navigate = useNavigate();

    const handleGoToSignIn = () => {
        navigate('/login');
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    py: 4
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        p: 6,
                        borderRadius: 2,
                        width: '100%',
                        maxWidth: 500
                    }}
                >
                    {/* Success Icon */}
                    <Box sx={{ mb: 3 }}>
                        <CheckCircle
                            sx={{
                                fontSize: 80,
                                color: 'success.main',
                                mb: 2
                            }}
                        />
                    </Box>

                    {/* Success Message */}
                    <Typography
                        variant="h4"
                        component="h1"
                        gutterBottom
                        sx={{
                            fontWeight: 'bold',
                            color: 'primary.main',
                            mb: 2
                        }}
                    >
                        Registration Successful!
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: '1.1rem',
                            lineHeight: 1.6,
                            mb: 4,
                            color: 'text.secondary'
                        }}
                    >
                        Welcome to FCFB! Your account has been created successfully.
                    </Typography>

                    {/* Email Verification Section */}
                    <Box
                        sx={{
                            backgroundColor: 'grey.200',
                            p: 3,
                            borderRadius: 2,
                            mb: 4,
                            border: '1px solid',
                            borderColor: 'info.main'
                        }}
                    >
                        <Email
                            sx={{
                                fontSize: 40,
                                color: 'info.main',
                                mb: 2
                            }}
                        />
                        
                        <Typography
                            variant="h6"
                            gutterBottom
                            sx={{
                                fontWeight: 'bold',
                                color: 'info.dark'
                            }}
                        >
                            Check Your Email
                        </Typography>
                        
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'info.dark',
                                mb: 2
                            }}
                        >
                            We've sent a verification email to your email account.
                        </Typography>
                        
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'info.dark',
                                fontStyle: 'italic'
                            }}
                        >
                            Don't forget to check your spam folder!
                        </Typography>
                    </Box>

                    {/* Next Steps */}
                    <Typography
                        variant="body1"
                        sx={{
                            mb: 4,
                            color: 'text.secondary'
                        }}
                    >
                        Once you verify your email, you'll be able to sign in and start playing!
                    </Typography>

                    {/* Sign In Button */}
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleGoToSignIn}
                        startIcon={<ArrowBack />}
                        sx={{
                            px: 4,
                            py: 1.5,
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            borderRadius: 2
                        }}
                    >
                        Back to Sign In
                    </Button>
                </Paper>
            </Box>
        </Container>
    );
};

export default RegistrationSuccess; 