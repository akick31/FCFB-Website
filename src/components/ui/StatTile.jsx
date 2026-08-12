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

const StatTile = ({ label, value, caption, compact = false }) => (
    <Box sx={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r)', px: compact ? '10px' : '15px', py: compact ? '10px' : '14px', textAlign: compact ? 'center' : 'left' }}>
        <Box component="small" sx={{ color: 'var(--text-dim)', fontSize: compact ? '0.56rem' : '0.62rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800, display: 'block' }}>
            {label}
        </Box>
        <Box component="b" sx={{ fontFamily: 'var(--cond)', fontWeight: 800, fontSize: compact ? '1.2rem' : '1.7rem', display: 'block', mt: '4px', color: 'var(--text)' }}>
            {value ?? '-'}
        </Box>
        {caption && <Box sx={{ color: 'var(--text-muted)', fontSize: compact ? '0.64rem' : '0.74rem', mt: '2px' }}>{caption}</Box>}
    </Box>
);

StatTile.propTypes = {
    label: PropTypes.node.isRequired,
    value: PropTypes.node,
    caption: PropTypes.node,
    compact: PropTypes.bool,
};

export default StatTile;
