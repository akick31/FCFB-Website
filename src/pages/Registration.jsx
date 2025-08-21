import React, { useState } from 'react';
import { 
    Box, 
    Grid, 
    Typography, 
    Alert,
    Link as MuiLink,
    useTheme,
    useMediaQuery,
    Button
} from '@mui/material';
import { 
    PersonAdd,
    CheckCircle
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import StyledCard from '../components/ui/StyledCard';
import StyledButton from '../components/ui/StyledButton';

const Registration = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleDiscordOAuth = () => {
        setLoading(true);
        // Redirect to Discord OAuth
        const clientId = process.env.REACT_APP_CLIENT_ID;
        const redirectUri = process.env.REACT_APP_BASE_URL;
        
        if (!clientId) {
            setError('Discord OAuth not configured. Please contact an administrator.');
            setLoading(false);
            return;
        }
        
        const discordOAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify`;
        window.location.href = discordOAuthUrl;
    };

    const features = [
        'Join a Discord community of college football fans',
        'Guess numbers to call plays in realistic games',
        'Experience full seasons with weekly polls, bowl games, and playoffs',
        'Fill that football void when the season ends'
    ];

    return (
        <PageLayout
            title="Join the FCFB League"
            subtitle="Create your account and start your journey to college football greatness"
            background="background.default"
            showHeader={false}
            fullWidth={true}
        >
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
                                background: theme.palette.secondary.main,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: theme.shadows[4],
                                mb: 2
                            }}>
                                <PersonAdd 
                                    sx={{ 
                                        fontSize: 40, 
                                        color: 'white'
                                    }} 
                                />
                            </Box>
                        </Box>

                        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
                            Create Account
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
                            Join the FCFB community with your Discord account
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
                                disabled={loading}
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
                                {loading ? 'Connecting to Discord...' : 'Register with Discord'}
                            </Button>
                        </Box>

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
                                color: theme.palette.secondary.main,
                            }}
                        >
                            Why Play Fake College Football?
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
