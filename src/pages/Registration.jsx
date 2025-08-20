import React, { useState } from 'react';
import { 
    Box, 
    Grid, 
    Typography, 
    TextField, 
    Alert,
    Link as MuiLink,
    useTheme,
    useMediaQuery,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button
} from '@mui/material';
import { 
    SportsFootball,
    PersonAdd,
    Email,
    LockOutlined,
    Visibility,
    VisibilityOff,
    CheckCircle
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import StyledCard from '../components/ui/StyledCard';
import StyledButton from '../components/ui/StyledButton';

const Registration = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        teamPreference: '',
        experience: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear messages when user starts typing
        if (error) setError('');
        if (success) setSuccess('');
    };

    const handleDiscordOAuth = () => {
        // Redirect to Discord OAuth
        const discordOAuthUrl = 'https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code&scope=identify';
        window.location.href = discordOAuthUrl;
    };

    const validateForm = () => {
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return false;
        }
        if (!formData.email.includes('@')) {
            setError('Please enter a valid email address');
            return false;
        }
        if (formData.username.length < 3) {
            setError('Username must be at least 3 characters long');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Mock registration - replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setSuccess('Registration successful! Please check your email to verify your account.');
            setFormData({
                username: '',
                email: '',
                password: '',
                confirmPassword: '',
                teamPreference: '',
                experience: ''
            });
            
            // Redirect to login after a delay
            setTimeout(() => {
                navigate('/login');
            }, 2000);
            
        } catch (err) {
            setError('An error occurred during registration. Please try again.');
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePasswordVisibility = (field) => {
        if (field === 'password') {
            setShowPassword(!showPassword);
        } else {
            setShowConfirmPassword(!showConfirmPassword);
        }
    };

    const features = [
        'Join the FCFB Discord community',
        'Build and manage your own team',
        'Compete in live games and tournaments',
        'Access detailed statistics and analytics',
        'Connect with other college football fans'
    ];

    return (
        <PageLayout
            title="Join the FCFB League"
            subtitle="Create your account and start your journey to college football greatness"
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
                                background: theme.custom?.gradients?.secondary,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: theme.shadows[8],
                            },
                        }}
                    >
                        <Box sx={{ mt: 2, mb: 4 }}>
                            <PersonAdd 
                                sx={{ 
                                    fontSize: 40, 
                                    color: 'white',
                                    position: 'relative',
                                    zIndex: 1,
                                }} 
                            />
                        </Box>

                        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
                            Create Account
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
                            Start your FCFB journey today
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                                {error}
                            </Alert>
                        )}

                        {success && (
                            <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
                                {success}
                            </Alert>
                        )}

                        {/* Discord OAuth Button */}
                        <Box sx={{ mb: 4 }}>
                            <Button
                                variant="contained"
                                size="large"
                                fullWidth
                                onClick={handleDiscordOAuth}
                                sx={{
                                    backgroundColor: '#7289da',
                                    color: 'white',
                                    fontWeight: 600,
                                    py: 2,
                                    fontSize: '1.1rem',
                                    '&:hover': {
                                        backgroundColor: '#5b6e8c',
                                        transform: 'translateY(-2px)',
                                    },
                                }}
                            >
                                Register with Discord
                            </Button>
                        </Box>

                        <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
                            Or continue with email registration:
                        </Typography>

                        <Box component="form" onSubmit={handleSubmit} sx={{ textAlign: 'left' }}>
                            <TextField
                                fullWidth
                                label="Username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                sx={{ mb: 3 }}
                            />

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

                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel>Team Preference</InputLabel>
                                <Select
                                    name="teamPreference"
                                    value={formData.teamPreference}
                                    onChange={handleChange}
                                    label="Team Preference"
                                >
                                    <MenuItem value="">No Preference</MenuItem>
                                    <MenuItem value="sec">SEC</MenuItem>
                                    <MenuItem value="bigten">Big Ten</MenuItem>
                                    <MenuItem value="acc">ACC</MenuItem>
                                    <MenuItem value="big12">Big 12</MenuItem>
                                    <MenuItem value="pac12">Pac-12</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel>Experience Level</InputLabel>
                                <Select
                                    name="experience"
                                    value={formData.experience}
                                    onChange={handleChange}
                                    label="Experience Level"
                                >
                                    <MenuItem value="beginner">Beginner</MenuItem>
                                    <MenuItem value="intermediate">Intermediate</MenuItem>
                                    <MenuItem value="advanced">Advanced</MenuItem>
                                    <MenuItem value="expert">Expert</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                label="Password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                required
                                InputProps={{
                                    startAdornment: <LockOutlined sx={{ mr: 1, color: 'text.secondary' }} />,
                                    endAdornment: (
                                        <Box
                                            component="span"
                                            onClick={() => handleTogglePasswordVisibility('password')}
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
                                sx={{ mb: 3 }}
                            />

                            <TextField
                                fullWidth
                                label="Confirm Password"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                InputProps={{
                                    startAdornment: <LockOutlined sx={{ mr: 1, color: 'text.secondary' }} />,
                                    endAdornment: (
                                        <Box
                                            component="span"
                                            onClick={() => handleTogglePasswordVisibility('confirmPassword')}
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
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </StyledButton>

                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2">
                                    Already have an account?{' '}
                                    <MuiLink
                                        component={Link}
                                        to="/login"
                                        sx={{
                                            color: 'primary.main',
                                            textDecoration: 'none',
                                            fontWeight: 600,
                                            '&:hover': {
                                                textDecoration: 'underline',
                                            },
                                        }}
                                    >
                                        Sign in here
                                    </MuiLink>
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
                                background: theme.custom?.gradients?.secondary,
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Why Join FCFB?
                        </Typography>
                        
                        <Box sx={{ textAlign: 'left', mb: 4 }}>
                            {features.map((feature, index) => (
                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <CheckCircle 
                                        sx={{ 
                                            color: 'success.main', 
                                            mr: 2, 
                                            fontSize: 20 
                                        }} 
                                    />
                                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                                        {feature}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <StyledButton
                                variant="outlined"
                                size="large"
                                component={Link}
                                to="/scoreboard"
                            >
                                View Live Games
                            </StyledButton>
                            <StyledButton
                                variant="contained"
                                size="large"
                                component={Link}
                                to="/teams"
                            >
                                Browse Teams
                            </StyledButton>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </PageLayout>
    );
};

export default Registration;
