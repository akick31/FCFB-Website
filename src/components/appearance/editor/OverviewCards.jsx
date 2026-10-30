import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const OverviewCards = ({ ends }) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: '18px', p: '12px 14px' }}>
        {ends.map((end) => (
            <Box key={end.title}>
                <Box
                    sx={{
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--text-dim)',
                        mb: '6px',
                    }}
                >
                    {end.title}
                </Box>
                {end.rows.map(([label, value]) => (
                    <Box
                        key={label}
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '12px',
                            py: '6px',
                            borderBottom: '1px solid var(--line-soft)',
                            fontSize: '0.82rem',
                        }}
                    >
                        <Box sx={{ color: 'var(--text-muted)' }}>{label}</Box>
                        <Box sx={{ fontWeight: 700, textAlign: 'right' }}>{value}</Box>
                    </Box>
                ))}
            </Box>
        ))}
    </Box>
);

OverviewCards.propTypes = {
    ends: PropTypes.arrayOf(
        PropTypes.shape({ title: PropTypes.string.isRequired, rows: PropTypes.arrayOf(PropTypes.array).isRequired })
    ).isRequired,
};

export default OverviewCards;
