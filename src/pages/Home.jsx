import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import logo from '../assets/graphics/main_logo.png'; // Import your logo image here

const HomePage = () => {
    return (
        <Container
            maxWidth="lg"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                textAlign: 'center',
                bgcolor: 'background.default',
                py: 4
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
                        width: 300
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
                }}
                href="/get-started" // Adjust this link as per your routes
            >
                Get Started
            </Button>
        </Container>
    );
};

export default HomePage;