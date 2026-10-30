import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const DetailRows = ({ rows, dense = false }) =>
    rows.map(([label, value]) => (
        <Box
            key={label}
            sx={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 1,
                px: 1.75,
                py: dense ? '4px' : 0.75,
                borderBottom: '1px solid var(--line-soft)',
                fontSize: '0.84rem',
                '&:last-of-type': { borderBottom: 'none' },
            }}
        >
            <Box component="span" sx={{ color: 'var(--text-muted)' }}>
                {label}
            </Box>
            <Box component="span" sx={{ fontWeight: 700, textAlign: 'right' }}>
                {value}
            </Box>
        </Box>
    ));

DetailRows.propTypes = {
    rows: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.node)).isRequired,
    dense: PropTypes.bool,
};

export default DetailRows;
