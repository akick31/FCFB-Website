import React, { useState } from 'react';
import { Box, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Code, Coffee, MailOutline } from '@mui/icons-material';
import PropTypes from 'prop-types';
import ContactDialog from './ContactDialog';

const linkSx = { color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 700, '&:hover': { color: 'var(--brand)' } };
const iconLinkSx = { ...linkSx, display: 'inline-flex', alignItems: 'center', gap: 0.5 };

const Footer = ({ user }) => {
    const year = new Date().getFullYear();
    const [contactOpen, setContactOpen] = useState(false);

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
            <Typography
                variant="body2"
                sx={{
                    fontSize: '0.78rem',
                    color: 'var(--text-dim)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                }}
            >
                <Link
                    href="https://www.buymeacoffee.com/flying_porygon"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={iconLinkSx}
                >
                    <Coffee sx={{ fontSize: 15 }} /> Buy Me a Coffee
                </Link>
                <Box component="span" sx={{ color: 'var(--line)' }}>
                    |
                </Box>
                <Link
                    component="button"
                    type="button"
                    onClick={() => setContactOpen(true)}
                    sx={{ ...iconLinkSx, font: 'inherit', fontWeight: 700 }}
                >
                    <MailOutline sx={{ fontSize: 15 }} /> Contact Us
                </Link>
                <Box component="span" sx={{ color: 'var(--line)' }}>
                    |
                </Box>
                <Link component={RouterLink} to="/developers" sx={iconLinkSx}>
                    <Code sx={{ fontSize: 15 }} /> API docs
                </Link>
                <Box component="span" sx={{ color: 'var(--line)' }}>
                    |
                </Box>
                © {year} Polyloon Studios. All rights reserved.
            </Typography>
            <ContactDialog open={contactOpen} onClose={() => setContactOpen(false)} defaultName={user?.username} />
        </Box>
    );
};

Footer.propTypes = {
    user: PropTypes.shape({ username: PropTypes.string }),
};

export default Footer;
