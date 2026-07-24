import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Panel from '../ui/Panel';
import TeamMark from '../ui/TeamMark';

const markFor = (teamsMap, name) => teamsMap[name] || { name };

const TeamSchedule = ({ teamName, schedule, season, teamsMap, loading }) => {
    const navigate = useNavigate();

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>;
    }

    return (
        <Panel header={<><TeamMark team={markFor(teamsMap, teamName)} size={22} />{teamName}</>} more={`Season ${season}`}>
            {schedule.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', color: 'var(--text-muted)' }}>No games scheduled.</Box>
            ) : schedule.map((game) => {
                const isHome = game.home_team === teamName;
                const opponent = isHome ? game.away_team : game.home_team;
                const us = isHome ? game.home_score : game.away_score;
                const them = isHome ? game.away_score : game.home_score;
                const win = us > them;
                return (
                    <Box
                        key={game.game_id || game.id}
                        sx={{ display: 'grid', gridTemplateColumns: '46px 1fr auto', alignItems: 'center', gap: '10px', px: 1.75, py: 1, borderBottom: '1px solid var(--line-soft)', fontSize: '0.82rem', '&:last-of-type': { borderBottom: 'none' } }}
                    >
                        <Box sx={{ color: 'var(--text-dim)', fontWeight: 800, fontSize: '0.66rem' }}>WK {game.week}</Box>
                        <Box
                            onClick={() => game.game_id && navigate(`/game-details/${game.game_id}`)}
                            sx={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, cursor: game.game_id ? 'pointer' : 'default', minWidth: 0 }}
                        >
                            <Box component="span" sx={{ color: 'var(--text-dim)' }}>{isHome ? 'vs' : 'at'}</Box>
                            <TeamMark team={markFor(teamsMap, opponent)} size={20} />
                            <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opponent}</Box>
                        </Box>
                        <Box sx={{ fontWeight: 800, fontFamily: 'var(--cond)', color: game.finished ? (win ? 'var(--field)' : 'var(--live)') : 'var(--text-dim)' }}>
                            {game.finished ? `${win ? 'W' : 'L'} ${us}-${them}` : '—'}
                        </Box>
                    </Box>
                );
            })}
        </Panel>
    );
};

TeamSchedule.propTypes = {
    teamName: PropTypes.string,
    schedule: PropTypes.array.isRequired,
    season: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    teamsMap: PropTypes.object.isRequired,
    loading: PropTypes.bool,
};

export default TeamSchedule;
