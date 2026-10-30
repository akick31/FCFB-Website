import React from 'react';
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';

const ScoreboardLink = () => (
    <Box
        component={Link}
        to="/scoreboard"
        sx={{
            fontSize: '0.74rem',
            fontWeight: 700,
            color: 'var(--brand)',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
        }}
    >
        Full scoreboard ›
    </Box>
);

export default ScoreboardLink;
