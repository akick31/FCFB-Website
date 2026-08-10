import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Coffee } from '@mui/icons-material';

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <Box
            component="footer"
            sx={{
                py: '18px',
                px: 2,
                textAlign: 'center',
                background: 'var(--surface)',
                borderTop: '1px solid var(--line)',
                color: 'var(--text-dim)',
            }}
        >
            <Typography variant="body2" sx={{ fontSize: '0.78rem', color: 'var(--text-dim)', display: 'inline-flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link
                    href="https://www.buymeacoffee.com/flying_porygon"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 0.5, '&:hover': { color: 'var(--brand)' } }}
                >
                    <Coffee sx={{ fontSize: 15 }} /> Buy Me a Coffee
                </Link>
                <Box component="span" sx={{ color: 'var(--line)' }}>|</Box>
                <Link
                    component={RouterLink}
                    to="/developers"
                    sx={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 700, '&:hover': { color: 'var(--brand)' } }}
                >
                    API docs
                </Link>
                <Box component="span" sx={{ color: 'var(--line)' }}>|</Box>
                © {year} Polyloon Studios. All rights reserved.
            </Typography>
        </Box>
    );
};

export default Footer;
