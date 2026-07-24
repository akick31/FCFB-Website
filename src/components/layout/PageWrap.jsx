import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const PageWrap = ({ children }) => (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: '18px', pt: '22px', pb: '70px' }}>
        {children}
    </Box>
);

PageWrap.propTypes = {
    children: PropTypes.node.isRequired,
};

export default PageWrap;
