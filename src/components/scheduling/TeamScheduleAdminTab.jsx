import React, { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../ui/Panel';
import DataTable from '../ui/DataTable';
import TeamMark from '../ui/TeamMark';
import { formatGameType, formatConference } from '../../utils/formatText';
import { field } from '../../utils/fieldHelper';
import { isRealTeam } from '../../utils/teamDataUtils';
import { getConferenceRules } from '../../api/scheduleApi';

const TOTAL_WEEKS = 12;
const DEFAULT_CONFERENCE_GAMES = 9;

const selectSx = { border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.82rem', cursor: 'pointer', minWidth: 240, '& option': { background: 'var(--surface)', color: 'var(--text)' } };
const ctrlSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '12px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' }, '&:disabled': { opacity: 0.6, cursor: 'default' } };
const pillSx = { display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', px: '8px', py: '3px', borderRadius: 'var(--r-sm)', lineHeight: 1 };
const iconBtnSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', width: 26, height: 26, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.85rem', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' }, '&:disabled': { opacity: 0.6, cursor: 'default' } };

const TeamScheduleAdminTab = ({
    allTeams,
    selectedTeam,
    onTeamChange,
    teamFullSchedule,
    teamLoading,
    scheduleLocked,
    teamMap,
    onAddGameForTeam,
    onAddGameForTeamWeek,
    onMoveGame,
    onDeleteGame,
}) => {
    const oocGamesOnly = useMemo(() =>
        teamFullSchedule.filter(g => field(g, 'gameType', 'game_type') === 'OUT_OF_CONFERENCE'),
        [teamFullSchedule]
    );

    const activeTeams = useMemo(() => allTeams.filter((t) => t.active && isRealTeam(t)).sort((a, b) => a.name.localeCompare(b.name)), [allTeams]);

    const [numConferenceGames, setNumConferenceGames] = useState(DEFAULT_CONFERENCE_GAMES);
    useEffect(() => {
        if (!selectedTeam?.conference) return undefined;
        let active = true;
        getConferenceRules(selectedTeam.conference)
            .then((rules) => { if (active) setNumConferenceGames(rules?.numConferenceGames ?? DEFAULT_CONFERENCE_GAMES); })
            .catch(() => { if (active) setNumConferenceGames(DEFAULT_CONFERENCE_GAMES); });
        return () => { active = false; };
    }, [selectedTeam?.conference]);
    const expectedOocGames = TOTAL_WEEKS - numConferenceGames;

    return (
        <Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '10px', mb: '16px', alignItems: 'center' }}>
                <Box
                    component="select"
                    value={selectedTeam?.name || ''}
                    onChange={(e) => onTeamChange(activeTeams.find((t) => t.name === e.target.value) || null)}
                    sx={selectSx}
                >
                    <option value="">Select team...</option>
                    {activeTeams.map((t) => <option key={t.name} value={t.name}>{t.name}</option>)}
                </Box>
                <Box component="button" type="button" onClick={onAddGameForTeam} disabled={!selectedTeam || scheduleLocked} sx={ctrlSx}>+ Add game</Box>
            </Box>

            {selectedTeam && (
                <Panel header={`${selectedTeam.name}: full schedule`} more={`${formatConference(selectedTeam.conference)} · OOC games ${oocGamesOnly.length}/${expectedOocGames}`}>
                    {teamLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
                    ) : (
                        <DataTable minWidth={560}>
                            <thead>
                                <tr>
                                    <th className="lft stick">Week</th>
                                    <th className="lft">Home/Away</th>
                                    <th className="lft">Opponent</th>
                                    <th className="lft">Type</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: TOTAL_WEEKS }, (_, i) => {
                                    const weekNum = i + 1;
                                    const game = teamFullSchedule.find(g => g.week === weekNum);
                                    if (!game) {
                                        return (
                                            <tr key={weekNum}>
                                                <td className="lft stick">Week {weekNum}</td>
                                                <td className="lft" colSpan={3}>
                                                    <Box component="span" sx={{ ...pillSx, background: 'var(--surface-2)', color: 'var(--brand)' }}>Open</Box>
                                                </td>
                                                <td>
                                                    <Box component="button" type="button" title="Add game for this week" onClick={() => onAddGameForTeamWeek(weekNum)} disabled={scheduleLocked} sx={iconBtnSx}>+</Box>
                                                </td>
                                            </tr>
                                        );
                                    }
                                    const home = field(game, 'homeTeam', 'home_team');
                                    const away = field(game, 'awayTeam', 'away_team');
                                    const isHome = home === selectedTeam.name;
                                    const opponent = isHome ? away : home;
                                    const gameType = field(game, 'gameType', 'game_type');
                                    const isConference = gameType === 'CONFERENCE_GAME';

                                    return (
                                        <tr key={weekNum}>
                                            <td className="lft stick">Week {game.week}</td>
                                            <td className="lft">
                                                <Box component="span" sx={{ ...pillSx, background: 'var(--surface-2)', color: isHome ? 'var(--field)' : 'var(--gold)' }}>{isHome ? 'Home' : 'Away'}</Box>
                                            </td>
                                            <td className="lft">
                                                <Box className="teamcell">
                                                    <TeamMark team={teamMap[opponent] || { name: opponent }} size={20} />
                                                    {opponent}
                                                </Box>
                                            </td>
                                            <td className="lft">
                                                <Box component="span" sx={{ ...pillSx, background: 'var(--surface-2)', color: isConference ? 'var(--brand)' : 'var(--gold)' }}>{formatGameType(gameType)}</Box>
                                            </td>
                                            <td>
                                                <Box sx={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                    <Box component="button" type="button" title="Move game" onClick={() => onMoveGame(game)} disabled={scheduleLocked} sx={iconBtnSx}>&#8646;</Box>
                                                    <Box component="button" type="button" title="Remove game" onClick={() => onDeleteGame(game.id)} disabled={scheduleLocked} sx={{ ...iconBtnSx, color: 'var(--live)' }}>&times;</Box>
                                                </Box>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </DataTable>
                    )}
                </Panel>
            )}
        </Box>
    );
};

TeamScheduleAdminTab.propTypes = {
    allTeams: PropTypes.array.isRequired,
    selectedTeam: PropTypes.object,
    onTeamChange: PropTypes.func.isRequired,
    teamFullSchedule: PropTypes.array.isRequired,
    teamLoading: PropTypes.bool,
    scheduleLocked: PropTypes.bool,
    teamMap: PropTypes.object.isRequired,
    onAddGameForTeam: PropTypes.func.isRequired,
    onAddGameForTeamWeek: PropTypes.func.isRequired,
    onMoveGame: PropTypes.func.isRequired,
    onDeleteGame: PropTypes.func.isRequired,
};

export default TeamScheduleAdminTab;
