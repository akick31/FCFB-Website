import React from 'react';
import { Box, Typography } from '@mui/material';
import logo from "../../assets/graphics/wordmark.png";

const LogoAndTitle = () => (
    <Box display="flex" alignItems="center" gap={2}>
        <img
            src={logo}
            alt="FCFB Logo"
            style={{
                height: 40,
                width: "auto",
                marginBottom: 1.8,
            }}
        />
    </Box>
);

export default LogoAndTitle;