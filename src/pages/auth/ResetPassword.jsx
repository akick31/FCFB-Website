import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { resetPassword } from '../../api/authApi';
import {
    Box,
    Typography,
    Alert,
    Grid,
    TextField,
    useTheme
} from "@mui/material";
import { 
    Lock, 
    Visibility, 
    VisibilityOff
} from "@mui/icons-material";
import { isStrongPassword } from "../../utils/validations";
import StyledCard from "../../components/ui/StyledCard";
import StyledButton from "../../components/ui/StyledButton";

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const ResetPassword = () => {
    const theme = useTheme();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [passwordValid, setPasswordValid] = useState(true);
    const query = useQuery();
    const userId = query.get("userId");
    const token = query.get("token");

    const navigate = useNavigate();

    // Redirect if no userId or token is provided
    if (!userId || !token) {
        navigate('/login');
        return null;
    }

    const handleNewPasswordChange = (e) => {
        const value = e.target.value;
        setNewPassword(value);
        setPasswordValid(isStrongPassword(value)); // Validate password strength
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!passwordValid) {
            setError("Password must be 8-255 characters with at least one special character.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!userId || !token) {
            setError('Invalid reset link. Please use the link from your email.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await resetPassword(token, newPassword);
            navigate('/login');
        } catch (error) {
            setError(error.message || 'Password reset failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Grid container spacing={4} alignItems="center" justifyContent="center" sx={{ 
            minHeight: '80vh',
            pt: { xs: 8, md: 10 } // Add top padding to account for the fixed header
        }}>
            <Grid item xs={12} md={6} lg={5}>
                <StyledCard
                    elevation={8}
                    hover={false}
                    sx={{
                        p: { xs: 3, md: 4 },
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'visible',
                    }}
                >
                    <Box sx={{ 
                        mb: 4,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Box sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: theme.palette.primary.main,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: theme.shadows[4],
                            mb: 2
                        }}>
                            <Lock 
                                sx={{ 
                                    fontSize: 40, 
                                    color: 'white'
                                }} 
                            />
                        </Box>
                    </Box>

                    <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
                        Reset Password
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
                        Enter your new password below to complete the reset process
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ textAlign: 'left' }}>
                        <TextField
                            fullWidth
                            label="New Password"
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={handleNewPasswordChange}
                            error={!passwordValid}
                            helperText={!passwordValid ? "Password must be 8-255 characters with at least one special character" : ""}
                            required
                            InputProps={{
                                startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
                                endAdornment: (
                                    <Box
                                        component="span"
                                        onClick={() => setShowNewPassword((prev) => !prev)}
                                        sx={{
                                            cursor: 'pointer',
                                            color: 'text.secondary',
                                            '&:hover': { color: 'text.primary' },
                                        }}
                                    >
                                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                    </Box>
                                ),
                            }}
                            sx={{ mb: 3 }}
                        />

                        <TextField
                            fullWidth
                            label="Confirm Password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            error={newPassword !== confirmPassword && confirmPassword !== ""}
                            helperText={confirmPassword !== "" && newPassword !== confirmPassword ? "Passwords do not match" : ""}
                            required
                            InputProps={{
                                startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
                                endAdornment: (
                                    <Box
                                        component="span"
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        sx={{
                                            cursor: 'pointer',
                                            color: 'text.secondary',
                                            '&:hover': { color: 'text.primary' },
                                        }}
                                    >
                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                    </Box>
                                ),
                            }}
                            sx={{ mb: 4 }}
                        />

                        <StyledButton
                            type="submit"
                            fullWidth
                            size="large"
                            disabled={loading}
                            sx={{ mb: 3 }}
                        >
                            {loading ? 'Resetting Password...' : 'Reset Password'}
                        </StyledButton>

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                Remember your password?{' '}
                                <Link to="/login" style={{ color: theme.palette.primary.main }}>
                                    Sign in here
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </StyledCard>
            </Grid>

            {/* Right side content for larger screens */}
            <Grid item xs={12} md={6} lg={5} sx={{ display: { xs: 'none', md: 'block' } }}>
                <Box sx={{ textAlign: 'center', p: 4 }}>
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 800,
                            mb: 3,
                            color: theme.palette.primary.main,
                        }}
                    >
                        Secure Your Account
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: 'text.secondary',
                            mb: 4,
                            lineHeight: 1.6,
                        }}
                    >
                        Your security is our priority. Create a strong, unique password to protect 
                        your FCFB account and ensure your data remains safe and secure.
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <StyledButton
                            variant="outlined"
                            size="large"
                            component={Link}
                            to="/login"
                        >
                            Back to Login
                        </StyledButton>
                        <StyledButton
                            variant="contained"
                            size="large"
                            component={Link}
                            to="/registration"
                        >
                            Create Account
                        </StyledButton>
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );
};



export default ResetPassword;