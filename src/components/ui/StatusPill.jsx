import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const VARIANTS = {
    live: { backgroundColor: 'var(--live)', color: '#fff' },
    final: { backgroundColor: 'var(--text-dim)', color: 'var(--surface)' },
    championship: { backgroundColor: 'var(--gold)', color: '#2a1c00' },
    close: { backgroundColor: 'var(--gold)', color: '#2a1c00' },
    ot: { backgroundColor: 'transparent', color: 'var(--gold)', border: '1px solid var(--gold)' },
    chew: { backgroundColor: 'transparent', color: 'var(--live)', border: '1px solid var(--live)' },
    upset: { backgroundColor: 'transparent', color: 'var(--gold)', border: '1px solid var(--gold)' },
    redzone: { backgroundColor: 'rgba(239,62,54,.15)', color: 'var(--live)' },
    open: { backgroundColor: 'transparent', color: 'var(--field)', border: '1px solid color-mix(in srgb, var(--field) 55%, var(--line))' },
    ghost: { backgroundColor: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--line)' },
};

const StatusPill = ({ variant = 'ghost', children, sx }) => (
    <Box
        component="span"
        sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.6,
            fontSize: '0.62rem',
            fontWeight: 800,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            lineHeight: 1,
            px: 1,
            py: 0.4,
            borderRadius: 'var(--r-sm)',
            whiteSpace: 'nowrap',
            ...VARIANTS[variant],
            ...sx,
        }}
    >
        {children}
    </Box>
);

StatusPill.propTypes = {
    variant: PropTypes.oneOf(Object.keys(VARIANTS)),
    children: PropTypes.node.isRequired,
    sx: PropTypes.object,
};

export default StatusPill;
