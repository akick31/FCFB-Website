import React from 'react';
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import TeamName from '../../ui/TeamName';
import { isGameOngoing } from '../scoreboard/utils/scoreboardFormatters';
import { formatScoreboardQuarter } from '../../../utils/gameUtils';

const statusOf = (game, ongoing) => {
    if (ongoing) {
        return `${formatScoreboardQuarter(game.quarter)} ${game.clock || ''}`.trim();
    }
    return game.game_type === 'NATIONAL_CHAMPIONSHIP' ? 'Championship' : 'Final';
};

const SideRow = ({ name, rank, score, strong, possession }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, fontWeight: strong ? 800 : 500 }}>
        <Box sx={{ width: 18, fontSize: '0.66rem', color: 'var(--text-dim)', textAlign: 'right', flexShrink: 0 }}>
            {rank > 0 && rank <= 25 ? rank : ''}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex' }}>
            <TeamName name={name} size={18} sx={{ fontSize: '0.82rem' }} />
        </Box>
        {possession && (
            <Box
                aria-label="Has the ball"
                sx={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }}
            />
        )}
        <Box sx={{ width: 26, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontSize: '0.9rem' }}>
            {score ?? 0}
        </Box>
    </Box>
);

SideRow.propTypes = {
    name: PropTypes.string,
    rank: PropTypes.number,
    score: PropTypes.number,
    strong: PropTypes.bool,
    possession: PropTypes.bool,
};

const CompactGameTile = ({ game }) => {
    const ongoing = isGameOngoing(game.game_status);
    return (
        <Box
            component={Link}
            to={`/game-details/${game.game_id}`}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                p: '8px 10px',
                background: 'var(--surface)',
                border: '1px solid',
                borderColor: ongoing ? 'color-mix(in srgb, var(--live) 42%, var(--line))' : 'var(--line)',
                borderRadius: 'var(--r-sm)',
                color: 'inherit',
                textDecoration: 'none',
                minWidth: 0,
                '&:hover': { borderColor: 'color-mix(in srgb, var(--brand) 55%, var(--line))' },
            }}
        >
            <Box
                sx={{
                    fontSize: '0.64rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: ongoing ? 'var(--live)' : 'var(--text-dim)',
                }}
            >
                {statusOf(game, ongoing)}
            </Box>
            <SideRow
                name={game.away_team}
                rank={game.away_team_rank}
                score={game.away_score}
                strong={ongoing || game.away_score > game.home_score}
                possession={ongoing && game.possession === 'AWAY'}
            />
            <SideRow
                name={game.home_team}
                rank={game.home_team_rank}
                score={game.home_score}
                strong={ongoing || game.home_score > game.away_score}
                possession={ongoing && game.possession === 'HOME'}
            />
        </Box>
    );
};

CompactGameTile.propTypes = {
    game: PropTypes.object.isRequired,
};

export default CompactGameTile;
