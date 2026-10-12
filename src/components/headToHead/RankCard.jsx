import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { ordinal } from '../../utils/leagueRankings';

const RankCard = ({ label, value, rank, totalEntities, accent }) => (
    <Box
        sx={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderTop: `3px solid ${accent}`,
            borderRadius: 'var(--r)',
            p: '14px',
            textAlign: 'center',
        }}
    >
        <Box
            sx={{
                fontSize: '0.6rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-dim)',
            }}
        >
            {label}
        </Box>
        {value != null && <Box sx={{ fontSize: '0.7rem', color: 'var(--text-muted)', mt: '2px' }}>{value}</Box>}
        <Box
            sx={{
                fontFamily: 'var(--cond)',
                fontWeight: 800,
                fontSize: '2.1rem',
                lineHeight: 1,
                mt: '6px',
                color: 'var(--text)',
            }}
        >
            {ordinal(rank)}
        </Box>
        <Box sx={{ fontSize: '0.66rem', color: 'var(--text-dim)', mt: '2px' }}>of {totalEntities}</Box>
    </Box>
);

RankCard.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.node,
    rank: PropTypes.number,
    totalEntities: PropTypes.number.isRequired,
    accent: PropTypes.string.isRequired,
};

export default RankCard;
