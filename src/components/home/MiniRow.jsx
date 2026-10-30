import React from 'react';
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const MiniRow = ({ to, dense = false, children }) => (
    <Box
        component={to ? Link : 'div'}
        to={to || undefined}
        sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            px: '14px',
            py: dense ? '3px' : '8px',
            borderBottom: '1px solid var(--line-soft)',
            color: 'inherit',
            textDecoration: 'none',
            cursor: to ? 'pointer' : 'default',
            '&:last-of-type': { borderBottom: 0 },
            '&:hover': to ? { background: 'var(--surface-2)' } : {},
        }}
    >
        {children}
    </Box>
);

MiniRow.propTypes = {
    to: PropTypes.string,
    dense: PropTypes.bool,
    children: PropTypes.node,
};

export default MiniRow;
