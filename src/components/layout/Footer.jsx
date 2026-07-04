import React from 'react';
import { Box, Typography } from '@mui/material';

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
                © {year} Polyloon Studios. All rights reserved.
            </Typography>
        </Box>
    );
};

export default Footer;
