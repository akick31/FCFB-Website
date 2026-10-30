import React from 'react';
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import TeamAbbr from './TeamAbbr';

const rankPrefix = (rank) => (rank ? `#${rank} ` : '');

const UpsetLine = ({ upset, full = false, plain = false, showLine = false }) => (
    <Box
        component={plain ? 'span' : Link}
        to={plain ? undefined : `/game-details/${upset.game_id}`}
        sx={{
            display: 'inline-flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: full ? 'flex-start' : 'center',
            gap: '4px',
            color: 'inherit',
            textDecoration: 'none',
            '&:hover': { color: 'var(--brand)' },
        }}
    >
        <TeamAbbr name={upset.winner} prefix={rankPrefix(upset.winner_rank)} />
        <span>over</span>
        <TeamAbbr
            name={upset.loser}
            prefix={rankPrefix(upset.loser_rank)}
            suffix={full && upset.score ? `, ${upset.score}` : ''}
        />
        {(full || showLine) && upset.points > 0 && <span>(+{upset.points})</span>}
    </Box>
);

UpsetLine.propTypes = {
    upset: PropTypes.shape({
        game_id: PropTypes.number.isRequired,
        winner: PropTypes.string.isRequired,
        loser: PropTypes.string.isRequired,
        winner_rank: PropTypes.number,
        loser_rank: PropTypes.number,
        points: PropTypes.number,
        score: PropTypes.string,
    }).isRequired,
    full: PropTypes.bool,
    plain: PropTypes.bool,
    showLine: PropTypes.bool,
};

export default UpsetLine;
