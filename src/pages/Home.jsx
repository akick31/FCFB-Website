import React from 'react';
import { Box, Button, Container, Typography, Grid, Link, useTheme } from '@mui/material';
import {Coffee} from '@mui/icons-material';
import logo from '../assets/graphics/main_logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faPatreon } from '@fortawesome/free-brands-svg-icons';

const HomePage = () => {
    const theme = useTheme();
    return (
        <Box
            sx={theme.root}
        >
            <Container
                maxWidth="lg"
                sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 4,
                    boxShadow: 3,
                    py: 6,
                    px: 4,
                    textAlign: 'center',
                }}
            >
                <Box
                    sx={{
                        mb: 4,
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    <img
                        src={logo}
                        alt="Logo"
                        style={{
                            maxWidth: '100%',
                            height: 'auto',
                            width: 300,
                        }}
                    />
                </Box>
                <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Your Journey Begins Here
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
                    Experience the thrill of college football like never before.
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: '1.2rem',
                        mb: 4,
                    }}
                    href="/get-started" // Adjust this link as per your routes
                >
                    Get Started
                </Button>
                <Grid container spacing={2} justifyContent="center">
                    {/* Discord Button */}
                    <Grid item>
                        <Link
                            href="https://discord.gg/fcfb"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ textDecoration: 'none' }}
                        >
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: '#7289da',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    px: 4,
                                    py: 2,
                                    '&:hover': {
                                        backgroundColor: '#5b6e8c',
                                    },
                                    textTransform: 'none',
                                }}
                            >
                            <FontAwesomeIcon icon={faDiscord} style={{ marginRight: '8px' }} />
                                Join the Discord
                            </Button>
                        </Link>
                    </Grid>
                    {/* Patreon Button */}
                    <Grid item>
                        <Link
                            href="https://www.patreon.com/fakecfb"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ textDecoration: 'none' }}
                        >
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: '#000000',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    px: 4,
                                    py: 2,
                                    '&:hover': {
                                        backgroundColor: '#232323',
                                    },
                                    textTransform: 'none',
                                }}
                            >
                            <FontAwesomeIcon icon={faPatreon} style={{ marginRight: '8px' }} />
                                Support FCFB on Patreon
                            </Button>
                        </Link>
                    </Grid>
                    {/* Buy Me A Coffee Button */}
                    <Grid item>
                        <Link
                            href="https://www.buymeacoffee.com/flying_porygon"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ textDecoration: 'none' }}
                        >
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: '#FFDE02',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    px: 4,
                                    py: 2,
                                    '&:hover': {
                                        backgroundColor: '#f1cf05',
                                    },
                                    textTransform: 'none',
                                }}
                            >
                                <Coffee style={{ marginRight: '8px' }} />
                                Buy Me A Coffee
                            </Button>
                        </Link>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default HomePage;