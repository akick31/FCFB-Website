import React from 'react';
import { Box, Typography } from '@mui/material';
import { EventBusy } from '@mui/icons-material';

const OffseasonNotice = () => (
    <Box sx={{
        textAlign: 'center',
        p: 6,
        backgroundColor: '#f8f9fa',
        borderRadius: 2,
        border: '1px solid #e9ecef'
    }}>
        <EventBusy sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
            We're in the offseason right now
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Games will show up here again once the next season kicks off. Check out Scrimmages in the meantime.
        </Typography>
    </Box>
);

export default OffseasonNotice;
