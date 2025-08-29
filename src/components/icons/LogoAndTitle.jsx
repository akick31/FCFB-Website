import React from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import logo from "../../assets/graphics/wordmark.png";

const LogoAndTitle = () => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    
    return (
        <Box display="flex" alignItems="center" gap={2}>
            <img
                src={logo}
                alt="FCFB Logo"
                style={{
                    height: isSmallScreen ? 32 : 40,
                    width: "auto",
                    marginBottom: isSmallScreen ? 1.2 : 1.8,
                    marginLeft: isSmallScreen ? 16.8 : 0
                }}
            />
        </Box>
    );
};

export default LogoAndTitle;