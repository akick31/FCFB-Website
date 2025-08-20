import React, { useState } from 'react';
import { 
    Box, 
    Grid, 
    Typography, 
    TextField, 
    Alert,
    Link as MuiLink,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { 
    SportsFootball,
    Email, 
    Lock, 
    Visibility,
    VisibilityOff,
    CheckCircle
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import StyledCard from '../components/ui/StyledCard';
import StyledButton from '../components/ui/StyledButton';
import { login } from '../api/authApi';

const Login = ({ setIsAuthenticated, setUser, setIsAdmin }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
            const response = await login(formData.email, formData.password);
            if (response.success) {
                setIsAuthenticated(true);
                setUser(response.user);
                if (response.user.role === 'admin') {
                    setIsAdmin(true);
                }
                navigate('/');
            } else {
                setError(response.message || 'Login failed');
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

    return (
        <PageLayout
            title="Welcome Back"
            subtitle="Sign in to your FCFB account to continue your journey"
            background="background.default"
            showHeader={false}
        >
            <Grid container spacing={4} alignItems="center" justifyContent="center" sx={{ minHeight: '80vh' }}>
                <Grid item xs={12} md={6} lg={5}>
                    <StyledCard
                        elevation={8}
                        sx={{
                            p: { xs: 3, md: 4 },
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'visible',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: -20,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                background: theme.custom?.gradients?.primary,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: theme.shadows[8],
                            },
                        }}
                    >
                        <Box sx={{ mt: 2, mb: 4 }}>
                            <SportsFootball 
                                sx={{ 
                                    fontSize: 40, 
                                    color: 'white',
                                    position: 'relative',
                                    zIndex: 1,
                                }} 
                            />
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
                                    <MuiLink
                                        component={Link}
                                        to="/register"
                                        sx={{
                                            color: 'primary.main',
                                            textDecoration: 'none',
                                            fontWeight: 600,
                                            '&:hover': {
                                                textDecoration: 'underline',
                                            },
                                        }}
                                    >
                                        Sign up here
                                    </MuiLink>
                                </Typography>
                                
                                <MuiLink
                                    component={Link}
                                    to="/reset-password"
                                    sx={{
                                        color: 'text.secondary',
                                        textDecoration: 'none',
                                        fontSize: '0.875rem',
                                        '&:hover': {
                                            color: 'primary.main',
                                            textDecoration: 'underline',
                                        },
                                    }}
                                >
                                    Forgot your password?
                                </MuiLink>
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
                                background: theme.custom?.gradients?.primary,
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
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
            </Grid>
        </PageLayout>
    );
};

export default Login;