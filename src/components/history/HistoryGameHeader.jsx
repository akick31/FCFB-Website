import React from 'react';
import { Box } from '@mui/material';
import { historyColumnsSx, wideOnlySx } from './historyColumns';

const headerSx = {
    ...historyColumnsSx,
    py: '6px',
    borderBottom: '1px solid var(--line-soft)',
    color: 'var(--text-dim)',
    fontSize: '0.62rem',
    fontWeight: 800,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
};

const HistoryGameHeader = () => (
    <Box sx={headerSx}>
        <span>Home</span>
        <span>Away</span>
        <span>Score</span>
        <Box component="span" sx={wideOnlySx}>
            Line
        </Box>
    </Box>
);

export default HistoryGameHeader;
