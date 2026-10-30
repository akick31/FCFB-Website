import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const FactList = ({ items, sx }) => (
    <Box
        component="span"
        sx={{ display: 'inline-flex', flexWrap: 'wrap', columnGap: '14px', rowGap: '2px', minWidth: 0, ...sx }}
    >
        {items.filter(Boolean).map((item) => (
            <Box component="span" key={item} sx={{ whiteSpace: 'nowrap' }}>
                {item}
            </Box>
        ))}
    </Box>
);

FactList.propTypes = {
    items: PropTypes.arrayOf(PropTypes.string).isRequired,
    sx: PropTypes.object,
};

export default FactList;
