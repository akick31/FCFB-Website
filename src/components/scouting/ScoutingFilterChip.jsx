import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { chipSx } from './scoutingStyles';
const ScoutingFilterChip = ({ active, onClick, children }) => (
    <Box component="button" type="button" onClick={onClick} sx={chipSx(active)}>
        {children}
    </Box>
);

ScoutingFilterChip.propTypes = {
    active: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
};

export default ScoutingFilterChip;
