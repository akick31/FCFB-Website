import React, { useMemo, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import TeamMark from '../ui/TeamMark';
import OpenTeamsDialog from './OpenTeamsDialog';
import { ensureTeam } from '../../hooks/useTeamsMap';
import { field } from '../../utils/fieldHelper';

const REGULAR_WEEKS = Array.from({ length: 12 }, (_, index) => index + 1);

const ConferenceGrid = ({ conferenceTeams, allTeams, schedule, teamsMap, loading, selectedConference }) => {
    const isIndependent = selectedConference === 'FBS_INDEPENDENT';
    const [openDialog, setOpenDialog] = useState(null);

    const scheduledNamesByWeek = useMemo(() => {
        const map = {};
        for (const game of schedule) {
            if (!game.week) continue;
            if (!map[game.week]) map[game.week] = new Set();
            map[game.week].add(game.home_team);
            map[game.week].add(game.away_team);
        }
        return map;
    }, [schedule]);

    const openTeamsForDialog = useMemo(() => {
        if (!openDialog) return [];
        const scheduledNames = scheduledNamesByWeek[openDialog.week] || new Set();
        return allTeams.filter((team) => team.name !== openDialog.teamName && !scheduledNames.has(team.name));
    }, [openDialog, scheduledNamesByWeek, allTeams]);

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
                    isConference: game.game_type === 'CONFERENCE_GAME',
                    isNeutralSite: Boolean(field(game, 'neutralSite', 'neutral_site')),
                };
            });
        }
        return map;
    }, [conferenceTeams, schedule]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>;
    }

    const markFor = (name) => {
        if (!name) return { name };
        if (!teamsMap[name]) ensureTeam(name);
        return teamsMap[name] || { name };
    };

    return (
        <Box sx={{ border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', background: 'var(--surface)' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '16px', p: '12px 16px', fontSize: '0.72rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--line-soft)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '3px', background: 'color-mix(in srgb, var(--brand) 30%, transparent)', border: '1px solid var(--brand)' }} />
                    Conference game
                </Box>
                {!isIndependent && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '3px', background: 'color-mix(in srgb, var(--gold) 30%, transparent)', border: '1px solid var(--gold)' }} />
                        Out of conference
                    </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '3px', background: 'color-mix(in srgb, var(--disc) 45%, transparent)', border: '1px solid var(--disc)' }} />
                    Neutral site
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Box component="span" sx={{ color: 'var(--text-dim)' }}>@</Box>
                    Away
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Box component="b" sx={{ color: 'var(--field)' }}>W</Box>
                    Win
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Box component="b" sx={{ color: 'var(--live)' }}>L</Box>
                    Loss
                </Box>
            </Box>
            <Box sx={{ overflowX: 'auto' }}>
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
                                    <Box component={team.id ? Link : 'div'} to={team.id ? `/team-details/${team.id}` : undefined} sx={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: team.id ? 'pointer' : 'default', textDecoration: 'none', color: 'inherit' }}>
                                        <TeamMark team={markFor(team.name)} size={20} />
                                        <Box component="b" sx={{ fontSize: '0.76rem' }}>{team.abbreviation && team.name.length > 14 ? team.abbreviation : team.name}</Box>
                                    </Box>
                                </td>
                                {REGULAR_WEEKS.map((week) => {
                                    const cell = byTeamWeek[team.name]?.[week];
                                    if (!cell) {
                                        return (
                                            <td key={week}>
                                                <Box
                                                    component="button"
                                                    type="button"
                                                    onClick={() => setOpenDialog({ week, teamName: team.name })}
                                                    title={`View teams open in Week ${week}`}
                                                    sx={{
                                                        font: 'inherit', color: 'var(--text-dim)', background: 'transparent', border: 0, cursor: 'pointer',
                                                        width: '100%', py: '3px', borderRadius: 'var(--r-sm)',
                                                        '&:hover': { background: 'var(--surface-2)', color: 'var(--text-muted)' },
                                                    }}
                                                >
                                                    -
                                                </Box>
                                            </td>
                                        );
                                    }
                                    const win = cell.us > cell.them;
                                    return (
                                        <td key={week}>
                                            <Box
                                                component={cell.gameId ? Link : 'div'}
                                                to={cell.gameId ? `/game-details/${cell.gameId}` : undefined}
                                                title={`${cell.isConference ? 'Conference' : 'Out of conference'}${cell.isNeutralSite ? ', neutral site' : ''} - ${cell.home ? 'vs' : 'at'} ${cell.opp}${cell.finished ? `, ${cell.us}-${cell.them}` : ''}`}
                                                sx={{
                                                    position: 'relative',
                                                    display: 'inline-flex', alignItems: 'center', gap: '3px', justifyContent: 'center',
                                                    cursor: cell.gameId ? 'pointer' : 'default', textDecoration: 'none', color: 'inherit',
                                                    px: '5px', py: '3px', borderRadius: 'var(--r-sm)',
                                                    background: cell.isNeutralSite
                                                        ? 'color-mix(in srgb, var(--disc) 18%, transparent)'
                                                        : cell.isConference ? 'color-mix(in srgb, var(--brand) 12%, transparent)' : isIndependent ? 'transparent' : 'color-mix(in srgb, var(--gold) 12%, transparent)',
                                                    '&:hover': cell.gameId ? { background: cell.isNeutralSite ? 'color-mix(in srgb, var(--disc) 28%, transparent)' : cell.isConference ? 'color-mix(in srgb, var(--brand) 20%, transparent)' : isIndependent ? 'var(--surface-2)' : 'color-mix(in srgb, var(--gold) 20%, transparent)' } : undefined,
                                                }}
                                            >
                                                {cell.isNeutralSite && !isIndependent && (
                                                    <Box sx={{ position: 'absolute', top: '2px', right: '2px', width: 6, height: 6, borderRadius: '50%', background: cell.isConference ? 'var(--brand)' : 'var(--gold)' }} />
                                                )}
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
            <OpenTeamsDialog
                open={Boolean(openDialog)}
                week={openDialog?.week}
                teams={openTeamsForDialog}
                teamsMap={teamsMap}
                onClose={() => setOpenDialog(null)}
            />
        </Box>
    );
};

ConferenceGrid.propTypes = {
    conferenceTeams: PropTypes.array.isRequired,
    allTeams: PropTypes.array.isRequired,
    schedule: PropTypes.array.isRequired,
    teamsMap: PropTypes.object.isRequired,
    loading: PropTypes.bool,
    selectedConference: PropTypes.string,
};

export default ConferenceGrid;
