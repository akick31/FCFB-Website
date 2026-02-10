import React from 'react';
import { Paper, Typography } from '@mui/material';

const BracketPlaceholder = ({ compact = false }) => (
    <Paper
        elevation={0}
        sx={{
            borderRadius: 1.5,
            border: '2px dashed',
            borderColor: 'divider',
            minWidth: compact ? 160 : 200,
            maxWidth: compact ? 200 : 260,
            p: compact ? 0.5 : 1,
            textAlign: 'center',
            opacity: 0.5,
        }}
    >
        <Typography variant="caption" color="text.secondary">
            TBD
        </Typography>
    </Paper>
);

export default BracketPlaceholder;
