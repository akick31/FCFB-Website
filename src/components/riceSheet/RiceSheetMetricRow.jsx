import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';

const RiceSheetMetricRow = ({ label, rank, value }) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 40px 64px', alignItems: 'baseline', gap: 1, py: 0.5, fontSize: '0.8rem' }}>
        <Box sx={{ color: 'var(--text-muted)' }}>{label}</Box>
        <Box sx={{ color: 'var(--gold)', fontWeight: 800, fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
            {rank != null ? `#${rank}` : '-'}
        </Box>
        <Box sx={{ fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
            {value != null ? value.toFixed(2) : '-'}
        </Box>
    </Box>
);

RiceSheetMetricRow.propTypes = {
    label: PropTypes.string.isRequired,
    rank: PropTypes.number,
    value: PropTypes.number,
};

export default RiceSheetMetricRow;
