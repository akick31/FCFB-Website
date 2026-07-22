import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import TeamMark from '../../ui/TeamMark';
import StatusPill from '../../ui/StatusPill';
import GameTypeLabel from './GameTypeLabel';
import { isGameOngoing } from '../scoreboard/utils/scoreboardFormatters';
import { ensureTeam } from '../../../hooks/useTeamsMap';

const SideRow = ({ team, name, score, dim }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.84rem', color: dim ? 'var(--text-dim)' : 'var(--text)' }}>
        <TeamMark team={team || { abbreviation: name }} size={20} />
        <Box component="span" sx={{ fontWeight: 700, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team?.name || name}</Box>
        <Box component="span" sx={{ fontFamily: 'var(--cond)', fontWeight: 800, fontSize: '1.05rem', width: 28, textAlign: 'right' }}>{score}</Box>
    </Box>
);

SideRow.propTypes = { team: PropTypes.object, name: PropTypes.string, score: PropTypes.number, dim: PropTypes.bool };

const CompactGameRow = ({ game, teamsMap }) => {
    const navigate = useNavigate();
    const home = teamsMap[game.home_team];
    const away = teamsMap[game.away_team];
    useEffect(() => {
        if (!home) ensureTeam(game.home_team);
        if (!away) ensureTeam(game.away_team);
    }, [game.home_team, game.away_team, home, away]);

    const ongoing = isGameOngoing(game.game_status);
    const homeWon = game.home_score > game.away_score;

    return (
        <Box
            onClick={() => navigate(`/game-details/${game.game_id}`)}
            sx={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: 1.75,
                alignItems: 'center',
                px: 1.75,
                py: 1.1,
                borderBottom: '1px solid var(--line-soft)',
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'var(--surface-2)' },
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, minWidth: 0 }}>
                <SideRow team={away} name={game.away_team} score={game.away_score} dim={homeWon} />
                <SideRow team={home} name={game.home_team} score={game.home_score} dim={!homeWon} />
            </Box>
            <Box sx={{ display: { xs: 'none', sm: 'flex' } }}><GameTypeLabel game={game} homeTeam={home} /></Box>
            {ongoing ? <StatusPill variant="live">Live</StatusPill> : <StatusPill variant="final">Final</StatusPill>}
        </Box>
    );
};

CompactGameRow.propTypes = {
    game: PropTypes.object.isRequired,
    teamsMap: PropTypes.object.isRequired,
};

export default CompactGameRow;
