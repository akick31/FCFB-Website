import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';

const RiceSheetMetricRow = ({ metrics }) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${metrics.length}, minmax(0, 1fr))`, gap: 1, py: 0.5 }}>
        {metrics.map(({ label, rank, value }) => (
            <Box key={label} sx={{ textAlign: 'center', minWidth: 0 }}>
                <Box sx={{ fontSize: '0.62rem', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.02em' }}>
                    {label}
                </Box>
                <Box sx={{ fontSize: '0.78rem', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <Box component="span" sx={{ color: 'var(--gold)', fontWeight: 800 }}>{rank != null ? `#${rank}` : '-'}</Box>
                    {' '}
                    {value != null ? value.toFixed(2) : '-'}
                </Box>
            </Box>
        ))}
    </Box>
);

RiceSheetMetricRow.propTypes = {
    metrics: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string.isRequired,
        rank: PropTypes.number,
        value: PropTypes.number,
    })).isRequired,
};

export default RiceSheetMetricRow;
