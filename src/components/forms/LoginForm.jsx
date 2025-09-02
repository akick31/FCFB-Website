import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Box, Grid, Typography, Alert, TextField, useTheme
} from "@mui/material";
import { 
    SportsFootball, Email, Lock, Visibility, VisibilityOff 
} from "@mui/icons-material";
import { login } from "../../api/authApi";
import { checkIfUserIsAdmin } from "../../utils/utils";
import StyledCard from "../ui/StyledCard";
import StyledButton from "../ui/StyledButton";
import ForgotPasswordForm from "./ForgotPasswordForm";
import PropTypes from "prop-types";

const LoginForm = ({ setIsAuthenticated, setUser, setIsAdmin }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const loginSuccess = await login(
                formData.email,
                formData.password,
                setIsAuthenticated,
                setUser
            );

            if (loginSuccess) {
                setIsAdmin(checkIfUserIsAdmin());
                navigate("/");
            } else {
                setError("Invalid username/email or password");
            }
        } catch (err) {
            setError('An error occurred during login. Please try again.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleForgotPasswordClick = () => {
        setForgotPasswordOpen(true);
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
                            <SportsFootball 
                                sx={{ 
                                    fontSize: 40, 
                                    color: 'white'
                                }} 
                            />
                        </Box>
                    </Box>

                    <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
                        Sign In
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
                        Access your FCFB dashboard and manage your team
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ textAlign: 'left' }}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            InputProps={{
                                startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                            }}
                            sx={{ mb: 3 }}
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            required
                            InputProps={{
                                startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />,
                                endAdornment: (
                                    <Box
                                        component="span"
                                        onClick={handleTogglePasswordVisibility}
                                        sx={{
                                            cursor: 'pointer',
                                            color: 'text.secondary',
                                            '&:hover': { color: 'text.primary' },
                                        }}
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
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
                            {loading ? 'Signing In...' : 'Sign In'}
                        </StyledButton>

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                Don't have an account?{' '}
                                <Link to="/register" style={{ color: theme.palette.primary.main }}>
                                    Sign up here
                                </Link>
                            </Typography>
                            
                            <Typography
                                component="span"
                                onClick={handleForgotPasswordClick}
                                sx={{
                                    color: theme.palette.text.secondary,
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    '&:hover': {
                                        color: theme.palette.primary.main,
                                    },
                                }}
                            >
                                Forgot your password?
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
                        Join the FCFB Community
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: 'text.secondary',
                            mb: 4,
                            lineHeight: 1.6,
                        }}
                    >
                        Experience the thrill of college football simulation with the FCFB community. 
                        Build your dynasty, compete for championships, and be part of something special.
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <StyledButton
                            variant="outlined"
                            size="large"
                            component={Link}
                            to="/register"
                        >
                            Create Account
                        </StyledButton>
                        <StyledButton
                            variant="contained"
                            size="large"
                            component={Link}
                            to="/scoreboard"
                        >
                            View Games
                        </StyledButton>
                    </Box>
                </Box>
            </Grid>

            {/* Forgot Password Dialog */}
            <ForgotPasswordForm 
                open={forgotPasswordOpen}
                onClose={() => setForgotPasswordOpen(false)}
            />
        </Grid>
    );
};

LoginForm.propTypes = {
    setIsAuthenticated: PropTypes.func.isRequired,
    setUser: PropTypes.func.isRequired,
    setIsAdmin: PropTypes.func.isRequired,
};

export default LoginForm;