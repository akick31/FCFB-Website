import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const PillButton = ({ children, onClick, active = false, sx }) => (
    <Box
        component="button"
        type="button"
        onClick={onClick}
        aria-pressed={active}
        sx={{
            display: 'inline-flex',
            alignItems: 'center',
            height: 38,
            boxSizing: 'border-box',
            border: '1px solid var(--line)',
            background: active ? 'var(--brand-deep)' : 'var(--surface-2)',
            color: active ? '#fff' : 'var(--text-muted)',
            borderRadius: 'var(--r-sm)',
            padding: '0 13px',
            font: 'inherit',
            fontSize: '0.78rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            '&:hover': active ? {} : { borderColor: 'var(--brand)', color: 'var(--text)' },
            '&:focus-visible': { outline: '2px solid var(--brand)', outlineOffset: '1px' },
            ...sx,
        }}
    >
        {children}
    </Box>
);

PillButton.propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func.isRequired,
    active: PropTypes.bool,
    sx: PropTypes.object,
};

export default PillButton;
