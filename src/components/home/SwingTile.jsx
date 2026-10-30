import React from 'react';
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import StatTile from '../ui/StatTile';
import TeamAbbr from './TeamAbbr';
import { formatClock } from '../../utils/gameDetail';

const SwingTile = ({ swing }) => (
    <StatTile
        compact
        label="Biggest swing"
        value={swing ? `${Math.round(swing.swing * 100)}%` : '-'}
        caption={
            swing && (
                <Box
                    component={Link}
                    to={`/play-details/${swing.play_id}`}
                    sx={{
                        display: 'inline-flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '4px',
                        color: 'inherit',
                        textDecoration: 'none',
                        '&:hover': { color: 'var(--brand)' },
                    }}
                >
                    <Box component="span" sx={{ fontWeight: 800 }}>
                        For
                    </Box>
                    <TeamAbbr name={swing.team} suffix="," />
                    <TeamAbbr name={swing.away_team} suffix={` ${swing.away_score}`} />
                    <TeamAbbr name={swing.home_team} suffix={` ${swing.home_score}`} />
                    <span>
                        Q{swing.quarter} {formatClock(swing.clock)}
                    </span>
                </Box>
            )
        }
    />
);

SwingTile.propTypes = {
    swing: PropTypes.shape({
        play_id: PropTypes.number,
        swing: PropTypes.number,
        team: PropTypes.string,
        home_team: PropTypes.string,
        away_team: PropTypes.string,
        home_score: PropTypes.number,
        away_score: PropTypes.number,
        quarter: PropTypes.number,
        clock: PropTypes.number,
    }),
};

export default SwingTile;
