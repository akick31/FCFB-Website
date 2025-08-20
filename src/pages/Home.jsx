import React from 'react';
import { 
    Box, 
    Button, 
    Container, 
    Typography, 
    Grid, 
    Link, 
    useTheme,
    useMediaQuery
} from '@mui/material';
import { 
    ArrowForward,
    PlayArrow
} from '@mui/icons-material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faPatreon } from '@fortawesome/free-brands-svg-icons';
import { Coffee } from '@mui/icons-material';
import logo from '../assets/graphics/main_logo.png';

const HomePage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Box sx={{ minHeight: '100vh', background: theme.palette.background.default }}>
            {/* Hero Section */}
            <Box
                sx={{
                    background: `linear-gradient(135deg, rgba(0, 66, 96, 0.95) 0%, rgba(30, 90, 122, 0.95) 100%), url(${require('../assets/images/background.jpg')})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                    minHeight: '80vh',
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'url(data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E)',
                        opacity: 0.3,
                    }
                }}
            >
                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                                <Typography
                                    variant="h1"
                                    sx={{
                                        color: 'white',
                                        mb: 3,
                                        fontSize: { xs: '2.5rem', md: '3.5rem' },
                                        fontWeight: 800,
                                        lineHeight: 1.1,
                                        textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                                    }}
                                >
                                    Your Journey to
                                    <Box component="span" sx={{ 
                                        display: 'block', 
                                        color: theme.palette.secondary.main,
                                        textShadow: '0 4px 8px rgba(209, 42, 46, 0.4)'
                                    }}>
                                        Glory Begins
                                    </Box>
                                </Typography>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        mb: 4,
                                        fontWeight: 400,
                                        lineHeight: 1.4,
                                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                    }}
                                >
                                    Experience the thrill of college football simulation with the FCFB community. 
                                    Build your dynasty, compete for championships, and join our active Discord.
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        sx={{
                                            px: 4,
                                            py: 2,
                                            fontSize: '1.1rem',
                                            fontWeight: 600,
                                            background: theme.palette.secondary.main,
                                            '&:hover': {
                                                background: theme.palette.secondary.dark,
                                                transform: 'translateY(-2px)',
                                            },
                                        }}
                                        href="/register"
                                        endIcon={<ArrowForward />}
                                    >
                                        Get Started
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        sx={{
                                            px: 4,
                                            py: 2,
                                            fontSize: '1.1rem',
                                            fontWeight: 600,
                                            color: 'white',
                                            borderColor: 'white',
                                            '&:hover': {
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                borderColor: 'white',
                                                transform: 'translateY(-2px)',
                                            },
                                        }}
                                        href="/scoreboard"
                                        endIcon={<PlayArrow />}
                                    >
                                        View Games
                                    </Button>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Box
                                    component="img"
                                    src={logo}
                                    alt="FCFB Logo"
                                    sx={{
                                        maxWidth: '100%',
                                        height: 'auto',
                                        width: { xs: 250, md: 400 },
                                        filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))',
                                        animation: 'float 6s ease-in-out infinite',
                                        '@keyframes float': {
                                            '0%, 100%': { transform: 'translateY(0px)' },
                                            '50%': { transform: 'translateY(-20px)' },
                                        },
                                    }}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* CTA Section */}
            <Box sx={{ py: { xs: 6, md: 10 }, background: theme.palette.background.dark }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography
                            variant="h2"
                            sx={{
                                mb: 3,
                                fontWeight: 700,
                                color: 'white',
                            }}
                        >
                            Join the FCFB Community
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{
                                color: 'rgba(255, 255, 255, 0.8)',
                                maxWidth: 600,
                                mx: 'auto',
                                fontWeight: 400,
                            }}
                        >
                            Connect with our community and start your journey to college football greatness
                        </Typography>
                    </Box>
                    
                    <Grid container spacing={3} justifyContent="center">
                        <Grid item>
                            <Link
                                href="https://discord.gg/fcfb"
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ textDecoration: 'none' }}
                            >
                                <Button
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        backgroundColor: '#7289da',
                                        color: 'white',
                                        fontWeight: 600,
                                        px: 4,
                                        py: 2,
                                        fontSize: '1.1rem',
                                        '&:hover': {
                                            backgroundColor: '#5b6e8c',
                                            transform: 'translateY(-2px)',
                                        },
                                    }}
                                    startIcon={<FontAwesomeIcon icon={faDiscord} />}
                                >
                                    Join the Discord
                                </Button>
                            </Link>
                        </Grid>
                        <Grid item>
                            <Link
                                href="https://www.patreon.com/fakecfb"
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ textDecoration: 'none' }}
                            >
                                <Button
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        backgroundColor: '#000000',
                                        color: 'white',
                                        fontWeight: 600,
                                        px: 4,
                                        py: 2,
                                        fontSize: '1.1rem',
                                        '&:hover': {
                                            backgroundColor: '#232323',
                                            transform: 'translateY(-2px)',
                                        },
                                    }}
                                    startIcon={<FontAwesomeIcon icon={faPatreon} />}
                                >
                                    Support FCFB
                                </Button>
                            </Link>
                        </Grid>
                        <Grid item>
                            <Link
                                href="https://www.buymeacoffee.com/flying_porygon"
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ textDecoration: 'none' }}
                            >
                                <Button
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        backgroundColor: '#FFDE02',
                                        color: 'white',
                                        fontWeight: 600,
                                        px: 4,
                                        py: 2,
                                        fontSize: '1.1rem',
                                        '&:hover': {
                                            backgroundColor: '#f1cf05',
                                            transform: 'translateY(-2px)',
                                        },
                                    }}
                                    startIcon={<Coffee />}
                                >
                                    Buy Me A Coffee
                                </Button>
                            </Link>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
};

export default HomePage;