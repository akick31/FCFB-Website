import React, { useMemo } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import TeamMark from '../ui/TeamMark';

const REGULAR_WEEKS = Array.from({ length: 13 }, (_, index) => index + 1);

const ConferenceGrid = ({ conferenceTeams, schedule, teamsMap, loading }) => {
    const navigate = useNavigate();

    const byTeamWeek = useMemo(() => {
        const map = {};
        const teamNames = new Set(conferenceTeams.map((team) => team.name));
        for (const game of schedule) {
            [[game.home_team, game.away_team, true], [game.away_team, game.home_team, false]].forEach(([me, opp, home]) => {
                if (!teamNames.has(me) || !game.week) return;
                if (!map[me]) map[me] = {};
                map[me][game.week] = {
                    opp,
                    home,
                    us: home ? game.home_score : game.away_score,
                    them: home ? game.away_score : game.home_score,
                    finished: game.finished,
                    gameId: game.game_id,
                };
            });
        }
        return map;
    }, [conferenceTeams, schedule]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>;
    }

    const markFor = (name) => teamsMap[name] || { name };

    return (
        <Box sx={{ overflowX: 'auto', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', background: 'var(--surface)' }}>
            <Box
                component="table"
                sx={{
                    borderCollapse: 'collapse',
                    fontSize: '0.74rem',
                    minWidth: 640,
                    width: '100%',
                    '& th, & td': { borderBottom: '1px solid var(--line-soft)', borderRight: '1px solid var(--line-soft)', padding: '6px 8px', textAlign: 'center', whiteSpace: 'nowrap' },
                    '& thead th': { background: 'var(--surface-2)', color: 'var(--text-dim)', fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 800, position: 'sticky', top: 0 },
                    '& .tcol': { position: 'sticky', left: 0, background: 'var(--surface)', textAlign: 'left', zIndex: 1, borderRight: '1px solid var(--line)' },
                    '& thead .tcol': { zIndex: 2, background: 'var(--surface-2)' },
                }}
            >
                <thead>
                    <tr>
                        <th className="tcol">Team</th>
                        {REGULAR_WEEKS.map((week) => <th key={week}>Wk {week}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {conferenceTeams.map((team) => (
                        <tr key={team.id || team.name}>
                            <td className="tcol">
                                <Box onClick={() => team.id && navigate(`/team-details/${team.id}`)} sx={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: team.id ? 'pointer' : 'default' }}>
                                    <TeamMark team={markFor(team.name)} size={20} />
                                    <Box component="b" sx={{ fontSize: '0.76rem' }}>{team.abbreviation && team.name.length > 14 ? team.abbreviation : team.name}</Box>
                                </Box>
                            </td>
                            {REGULAR_WEEKS.map((week) => {
                                const cell = byTeamWeek[team.name]?.[week];
                                if (!cell) return <td key={week} style={{ color: 'var(--text-dim)' }}>-</td>;
                                const win = cell.us > cell.them;
                                return (
                                    <td key={week}>
                                        <Box
                                            onClick={() => cell.gameId && navigate(`/game-details/${cell.gameId}`)}
                                            title={`${cell.home ? 'vs' : 'at'} ${cell.opp}${cell.finished ? `, ${cell.us}-${cell.them}` : ''}`}
                                            sx={{ display: 'inline-flex', alignItems: 'center', gap: '3px', justifyContent: 'center', cursor: cell.gameId ? 'pointer' : 'default' }}
                                        >
                                            {!cell.home && <Box component="span" sx={{ color: 'var(--text-dim)', fontSize: '0.62rem' }}>@</Box>}
                                            <TeamMark team={markFor(cell.opp)} size={18} />
                                            {cell.finished && (
                                                <Box component="b" sx={{ fontSize: '0.62rem', color: win ? 'var(--field)' : 'var(--live)' }}>{win ? 'W' : 'L'}</Box>
                                            )}
                                        </Box>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </Box>
        </Box>
    );
};

ConferenceGrid.propTypes = {
    conferenceTeams: PropTypes.array.isRequired,
    schedule: PropTypes.array.isRequired,
    teamsMap: PropTypes.object.isRequired,
    loading: PropTypes.bool,
};

export default ConferenceGrid;
