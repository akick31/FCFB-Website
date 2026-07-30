import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import { Coffee } from '@mui/icons-material';

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <Box
            component="footer"
            sx={{
                py: 2,
                px: 2,
                textAlign: 'center',
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
            }}
        >
            <Typography variant="body2">
                <Link
                    href="https://www.buymeacoffee.com/flying_porygon"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ color: 'inherit', textDecoration: 'underline', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 0.5, verticalAlign: 'middle' }}
                >
                    <Coffee sx={{ fontSize: 16 }} /> Buy Me a Coffee
                </Link>
                {'  |  '}© {year} Polyloon Studios. All rights reserved.
            </Typography>
        </Box>
    );
};

export default Footer;
