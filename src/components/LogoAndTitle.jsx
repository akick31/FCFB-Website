import React from 'react';
import { Box, Typography } from '@mui/material';
import logo from "../assets/graphics/trophy.png";

const LogoAndTitle = () => (
    <Box display="flex" alignItems="center" gap={2}>
        <img
            src={logo}
            alt="FCFB Logo"
            style={{
                height: 40,
                width: "auto",
            }}
        />
        <Typography
            variant="h6"
            sx={{
                fontWeight: 600,
                color: "white", // Text color white
                display: { xs: "none", sm: "block" }
            }}
        >
            Fake College Football
        </Typography>
    </Box>
);

export default LogoAndTitle;