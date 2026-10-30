import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const StadiumHeaderCard = ({ controls, children, actions }) => (
    <Box
        sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'flex-end' },
            gap: '12px',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-md, 10px)',
            background: 'var(--surface)',
            p: '8px 12px',
        }}
    >
        {controls && <Box sx={{ flexShrink: 0, width: { md: 320 } }}>{controls}</Box>}
        {controls && children && (
            <Box
                sx={{
                    display: { xs: 'none', md: 'block' },
                    alignSelf: 'stretch',
                    width: '1px',
                    background: 'var(--line)',
                }}
            />
        )}
        {children && <Box sx={{ flex: 1, minWidth: 0, alignSelf: { md: 'center' } }}>{children}</Box>}
        {actions && <Box sx={{ display: 'flex', gap: '8px', flexShrink: 0 }}>{actions}</Box>}
    </Box>
);

StadiumHeaderCard.propTypes = {
    controls: PropTypes.node,
    children: PropTypes.node,
    actions: PropTypes.node,
};

export default StadiumHeaderCard;
