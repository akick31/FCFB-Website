import React from 'react';
import { Box } from '@mui/material';
import { UPSET_EDGE } from './historyColumns';

const UpsetLegend = () => (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textTransform: 'none' }}>
        <Box component="span" sx={{ width: 4, height: 14, borderRadius: '2px', background: UPSET_EDGE }} />
        Upset
    </Box>
);

export default UpsetLegend;
