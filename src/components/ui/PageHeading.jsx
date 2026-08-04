import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const PageHeading = ({ eyebrow, title, leading, children }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: '18px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {leading}
            <Box>
                {eyebrow && (
                    <Box sx={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800, color: 'var(--text-dim)', mb: '6px' }}>
                        {eyebrow}
                    </Box>
                )}
                <Box component="h1" sx={{ m: 0, fontFamily: 'var(--cond)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.01em', fontSize: '1.7rem', lineHeight: 1, color: 'var(--text)' }}>
                    {title}
                </Box>
            </Box>
        </Box>
        {children && (
            <Box sx={{ display: 'flex', gap: '9px', alignItems: 'center', flexWrap: 'wrap' }}>
                {children}
            </Box>
        )}
    </Box>
);

PageHeading.propTypes = {
    eyebrow: PropTypes.node,
    title: PropTypes.node.isRequired,
    leading: PropTypes.node,
    children: PropTypes.node,
};

export default PageHeading;
