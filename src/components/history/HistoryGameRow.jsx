import React from 'react';
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import TeamName from '../ui/TeamName';
import { historyColumnsSx, UPSET_EDGE, UPSET_TINT, wideOnlySx } from './historyColumns';
import { useTeamsMap } from '../../hooks/useTeamsMap';

const Team = ({ name, rank, won }) => (
    <Box
        sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            minWidth: 0,
            fontWeight: won ? 800 : 600,
            color: won ? 'var(--text)' : 'var(--text-muted)',
        }}
    >
        {rank && <Box sx={{ color: 'var(--gold)', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0 }}>#{rank}</Box>}
        <TeamName name={name} size={20} />
    </Box>
);

Team.propTypes = { name: PropTypes.string.isRequired, rank: PropTypes.number, won: PropTypes.bool };

const lineText = (game, teamsMap) => {
    if (game.postseason_name) {
        return game.postseason_name;
    }
    if (!game.home_spread) {
        return '-';
    }
    const favorite = game.home_spread < 0 ? game.home_team : game.away_team;
    return `${teamsMap[favorite]?.abbreviation || favorite} -${Math.abs(game.home_spread)}`;
};

const HistoryGameRow = ({ game, upset }) => {
    const teamsMap = useTeamsMap();
    const homeWon = game.home_score > game.away_score;
    return (
        <Box
            component={Link}
            to={`/game-details/${game.game_id}`}
            sx={{
                ...historyColumnsSx,
                py: '7px',
                fontSize: '0.84rem',
                color: 'inherit',
                textDecoration: 'none',
                borderBottom: '1px solid var(--line-soft)',
                boxShadow: upset ? `inset 3px 0 0 ${UPSET_EDGE}` : 'none',
                background: upset ? UPSET_TINT : 'transparent',
                '&:hover': { background: 'var(--surface-2)' },
            }}
        >
            <Team name={game.home_team} rank={game.home_rank} won={homeWon} />
            <Team name={game.away_team} rank={game.away_rank} won={!homeWon} />
            <Box sx={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                {game.home_score}-{game.away_score}
                {game.overtime && (
                    <Box component="span" sx={{ ml: '4px', color: 'var(--text-dim)', fontSize: '0.68rem' }}>
                        OT
                    </Box>
                )}
            </Box>
            <Box
                sx={{
                    ...wideOnlySx,
                    minWidth: 0,
                    color: 'var(--text-dim)',
                    fontSize: '0.74rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}
            >
                {lineText(game, teamsMap)}
            </Box>
        </Box>
    );
};

HistoryGameRow.propTypes = { game: PropTypes.object.isRequired, upset: PropTypes.bool };

export default HistoryGameRow;
