import React from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress } from '@mui/material';

const COLUMNS = '28px 1fr 40px 56px';

const OpponentList = ({ loading, opponents }) => {
    if (loading) {
        return (
            <Box sx={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress size={20} />
            </Box>
        );
    }
    if (!opponents.length) {
        return (
            <Box sx={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                No games scheduled yet.
            </Box>
        );
    }
    return (
        <Box sx={{ height: 240, overflowY: 'auto' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: COLUMNS, gap: 0.75, fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', pb: 0.5, borderBottom: '1px solid var(--line-soft)' }}>
                <span>Wk</span>
                <span>Opponent</span>
                <span style={{ textAlign: 'right' }}>Rank</span>
                <span style={{ textAlign: 'right' }}>Result</span>
            </Box>
            {opponents.map((opponent) => (
                <Box
                    key={`${opponent.week}-${opponent.name}`}
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: COLUMNS,
                        gap: 0.75,
                        alignItems: 'center',
                        fontSize: '0.76rem',
                        py: 0.4,
                        opacity: opponent.played ? 1 : 0.55,
                    }}
                >
                    <Box sx={{ color: 'var(--text-dim)' }}>{opponent.week}</Box>
                    <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opponent.name}</Box>
                    <Box sx={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
                        {opponent.rank != null ? `#${opponent.rank}` : '-'}
                    </Box>
                    <Box
                        sx={{
                            fontWeight: opponent.played ? 700 : 400,
                            fontVariantNumeric: 'tabular-nums',
                            textAlign: 'right',
                            color: opponent.won === true ? 'var(--field)' : opponent.won === false ? 'var(--live)' : 'inherit',
                        }}
                    >
                        {opponent.played ? opponent.score : '-'}
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

OpponentList.propTypes = {
    loading: PropTypes.bool.isRequired,
    opponents: PropTypes.arrayOf(PropTypes.shape({
        week: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        rank: PropTypes.number,
        played: PropTypes.bool.isRequired,
        won: PropTypes.bool,
        score: PropTypes.string,
    })).isRequired,
};

export default OpponentList;
