import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const BannerFacts = ({ facts }) => (
    <Box
        component="dl"
        sx={{
            zIndex: 1,
            m: 0,
            mr: { md: '96px' },
            display: 'grid',
            gridTemplateColumns: 'auto minmax(0, 1fr)',
            columnGap: '14px',
            rowGap: '3px',
            alignItems: 'baseline',
            color: '#fff',
            fontSize: '0.82rem',
            minWidth: 0,
            flex: '0 1 340px',
            '& a': { color: 'inherit' },
        }}
    >
        {facts.filter(Boolean).map(({ label, value }) => (
            <React.Fragment key={label}>
                <Box
                    component="dt"
                    sx={{
                        opacity: 0.7,
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                    }}
                >
                    {label}
                </Box>
                <Box component="dd" sx={{ m: 0, fontWeight: 600, minWidth: 0 }}>
                    {value}
                </Box>
            </React.Fragment>
        ))}
    </Box>
);

BannerFacts.propTypes = {
    facts: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string.isRequired, value: PropTypes.node })).isRequired,
};

export default BannerFacts;
