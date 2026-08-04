import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

export const TileGrid = ({ minTile = 160, children, sx }) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${minTile}px, 1fr))`, gap: '12px', ...sx }}>
        {children}
    </Box>
);

TileGrid.propTypes = {
    minTile: PropTypes.number,
    children: PropTypes.node,
    sx: PropTypes.object,
};

const StatTile = ({ label, value, caption }) => (
    <Box sx={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r)', px: '15px', py: '14px' }}>
        <Box component="small" sx={{ color: 'var(--text-dim)', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800, display: 'block' }}>
            {label}
        </Box>
        <Box component="b" sx={{ fontFamily: 'var(--cond)', fontWeight: 800, fontSize: '1.7rem', display: 'block', mt: '4px', color: 'var(--text)' }}>
            {value ?? '-'}
        </Box>
        {caption && <Box sx={{ color: 'var(--text-muted)', fontSize: '0.74rem', mt: '2px' }}>{caption}</Box>}
    </Box>
);

StatTile.propTypes = {
    label: PropTypes.node.isRequired,
    value: PropTypes.node,
    caption: PropTypes.node,
};

export default StatTile;
