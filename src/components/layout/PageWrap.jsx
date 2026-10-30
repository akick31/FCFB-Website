import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const PageWrap = ({ children, maxWidth = 1200 }) => (
    <Box data-page-wrap sx={{ width: '100%', maxWidth, mx: 'auto', px: '18px', pt: '18px', pb: '32px' }}>
        {children}
    </Box>
);

PageWrap.propTypes = {
    children: PropTypes.node.isRequired,
    maxWidth: PropTypes.number,
};

export default PageWrap;
