import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const Panel = ({ header, more, children, sx, onClick }) => (
    <Box onClick={onClick} sx={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', overflow: 'hidden', ...sx }}>
        {(header || more) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', px: 2, py: 1.5, borderBottom: '1px solid var(--line-soft)', background: 'var(--surface-2)' }}>
                <Box component="h2" sx={{ m: 0, fontFamily: 'var(--cond)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.01em', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                    {header}
                </Box>
                {more && <Box sx={{ ml: 'auto', fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700 }}>{more}</Box>}
            </Box>
        )}
        {children}
    </Box>
);

Panel.propTypes = {
    header: PropTypes.node,
    more: PropTypes.node,
    children: PropTypes.node,
    sx: PropTypes.object,
    onClick: PropTypes.func,
};

export default Panel;
