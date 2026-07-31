import React, { useState, useMemo } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../ui/Panel';
import TeamMark from '../ui/TeamMark';
import { formatConference } from '../../utils/formatText';
import { field } from '../../utils/fieldHelper';

const TOTAL_WEEKS = 12;
const DEFAULT_CONFERENCE_GAMES = 9;

const selectSx = { border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', py: '7px', font: 'inherit', fontSize: '0.82rem', cursor: 'pointer', '& option': { background: 'var(--surface)', color: 'var(--text)' } };
const inputSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', py: '7px', font: 'inherit', fontSize: '0.82rem' };
const btnPrimarySx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '14px', py: '9px', font: 'inherit', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', '&:disabled': { opacity: 0.6, cursor: 'default' } };
const ctrlSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '12px', py: '8px', font: 'inherit', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' }, '&:disabled': { opacity: 0.6, cursor: 'default' } };
const removeBtnSx = { border: 0, background: 'transparent', color: 'var(--live)', cursor: 'pointer', fontSize: '0.9rem', px: '6px' };
const pillSx = { display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.05em', px: '7px', py: '3px', borderRadius: 'var(--r-sm)', lineHeight: 1 };

const ConferenceScheduleAdminTab = ({
    selectedConference,
    onConferenceChange,
    adminConferences,
    conferenceSchedule,
    conferenceTeams,
    confLoading,
    scheduleLocked,
    teamMap,
    teamWeekOccupied = new Set(),
    onAddGameManually,
    onGenerateSchedule,
    onEmptyCellClick,
    onFilledCellClick,
    onGameDrop,
    numConferenceGames,
    onNumConferenceGamesChange,
    protectedRivalries,
    onAddRivalry,
    onRemoveRivalry,
    onUpdateRivalry,
    hasGamesPlayed = false,
    onSaveConferenceRules,
}) => {
    const [rulesExpanded, setRulesExpanded] = useState(false);
    const [savingRules, setSavingRules] = useState(false);
    const [dragSource, setDragSource] = useState(null);

    const grid = useMemo(() => {
        const g = {};
        conferenceTeams.forEach(team => {
            g[team.name] = {};
            for (let w = 1; w <= TOTAL_WEEKS; w++) {
                g[team.name][w] = null;
            }
        });

        conferenceSchedule.forEach(game => {
            const week = game.week;
            const home = field(game, 'homeTeam', 'home_team');
            const away = field(game, 'awayTeam', 'away_team');
            const teamNames = conferenceTeams.map(t => t.name);

            if (teamNames.includes(home)) {
                g[home] = g[home] || {};
                g[home][week] = { ...game, opponent: away, isHome: true };
            }
            if (teamNames.includes(away)) {
                g[away] = g[away] || {};
                g[away][week] = { ...game, opponent: home, isHome: false };
            }
        });

        return g;
    }, [conferenceTeams, conferenceSchedule]);

    const getGameCounts = (teamName) => {
        let home = 0, away = 0;
        conferenceSchedule.forEach(game => {
            const h = field(game, 'homeTeam', 'home_team');
            const a = field(game, 'awayTeam', 'away_team');
            if (h === teamName) home++;
            if (a === teamName) away++;
        });
        return { home, away };
    };

    const incompleteTeams = conferenceTeams.filter(t => {
        const c = getGameCounts(t.name);
        return c.home + c.away < numConferenceGames;
    });

    return (
        <Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '10px', mb: '16px', alignItems: 'center' }}>
                <Box component="select" value={selectedConference} onChange={(e) => onConferenceChange(e.target.value)} sx={selectSx}>
                    {adminConferences.map(conf => <option key={conf.code} value={conf.code}>{conf.label}</option>)}
                </Box>
                <Box
                    component="button" type="button" onClick={onGenerateSchedule}
                    disabled={scheduleLocked || hasGamesPlayed}
                    title={hasGamesPlayed ? 'Cannot auto-generate: games have already been played this season' : scheduleLocked ? 'Schedule is locked' : ''}
                    sx={btnPrimarySx}
                >
                    ⚙ Auto-generate schedule
                </Box>
                <Box component="button" type="button" onClick={onAddGameManually} disabled={scheduleLocked} sx={ctrlSx}>+ Add game manually</Box>
            </Box>

            <Panel sx={{ mb: '16px' }}>
                <Box
                    onClick={() => setRulesExpanded(!rulesExpanded)}
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '14px 16px', cursor: 'pointer', flexWrap: 'wrap', gap: '8px' }}
                >
                    <Box sx={{ fontWeight: 700, fontSize: '0.88rem' }}>Conference rules: {formatConference(selectedConference)}</Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Box sx={{ color: 'var(--text-dim)', fontSize: '0.76rem' }}>
                            {numConferenceGames} conf games &middot; {TOTAL_WEEKS - numConferenceGames} OOC &middot; {conferenceTeams.length} teams &middot; {protectedRivalries.filter(r => r.team1 && r.team2).length} rivalries
                        </Box>
                        <Box component="span" sx={{ color: 'var(--text-dim)' }}>{rulesExpanded ? '▲' : '▼'}</Box>
                    </Box>
                </Box>

                {rulesExpanded && (
                    <Box sx={{ p: '0 16px 16px', borderTop: '1px solid var(--line-soft)', pt: '16px' }}>
                        {conferenceTeams.length <= numConferenceGames + 1 && (
                            <Alert severity="info" sx={{ mb: '14px', py: 0.5 }}>Round robin format: each team plays every other team once.</Alert>
                        )}

                        <Box sx={{ mb: '18px', maxWidth: 260 }}>
                            <Box sx={{ display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: 'var(--text-dim)', mb: '5px' }}>Conference games per team</Box>
                            <Box component="input" type="number" min={1} max={TOTAL_WEEKS} value={numConferenceGames} onChange={(e) => onNumConferenceGamesChange(parseInt(e.target.value, 10) || DEFAULT_CONFERENCE_GAMES)} sx={{ ...inputSx, width: '100%' }} />
                            <Box sx={{ mt: '4px', fontSize: '0.72rem', color: 'var(--text-dim)' }}>OOC games: {TOTAL_WEEKS - numConferenceGames}</Box>
                        </Box>

                        <Box sx={{ borderTop: '1px solid var(--line-soft)', pt: '16px' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '6px' }}>
                                <Box sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Protected rivalries</Box>
                                <Box component="button" type="button" onClick={onAddRivalry} sx={ctrlSx}>+ Add rivalry</Box>
                            </Box>
                            <Box sx={{ color: 'var(--text-dim)', fontSize: '0.76rem', mb: '12px' }}>
                                Protected rivalries are always scheduled when auto-generating. The schedule cannot be finalized if any protected rivalry is missing.
                            </Box>

                            {protectedRivalries.length === 0 && (
                                <Box sx={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontStyle: 'italic', mb: '12px' }}>
                                    No protected rivalries set. Click &quot;Add rivalry&quot; to define guaranteed matchups.
                                </Box>
                            )}

                            {protectedRivalries.map((rivalry, index) => {
                                const isLocked = rivalry.team1 && rivalry.team2;
                                return (
                                    <Box key={index} sx={{ display: 'flex', gap: '8px', mb: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <Box component="select" value={rivalry.team1 || ''} onChange={(e) => onUpdateRivalry(index, 'team1', e.target.value)} disabled={isLocked} sx={{ ...selectSx, flex: '1 1 160px' }}>
                                            <option value="">Team 1</option>
                                            {conferenceTeams.map((t) => <option key={t.name} value={t.name}>{t.name}</option>)}
                                        </Box>
                                        <Box sx={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>vs</Box>
                                        <Box component="select" value={rivalry.team2 || ''} onChange={(e) => onUpdateRivalry(index, 'team2', e.target.value)} disabled={isLocked} sx={{ ...selectSx, flex: '1 1 160px' }}>
                                            <option value="">Team 2</option>
                                            {conferenceTeams.map((t) => <option key={t.name} value={t.name}>{t.name}</option>)}
                                        </Box>
                                        <Box component="select" value={rivalry.week || ''} onChange={(e) => onUpdateRivalry(index, 'week', e.target.value ? Number(e.target.value) : null)} sx={{ ...selectSx, minWidth: 90 }}>
                                            <option value="">Any week</option>
                                            {Array.from({ length: TOTAL_WEEKS }, (_, i) => <option key={i + 1} value={i + 1}>Wk {i + 1}</option>)}
                                        </Box>
                                        <Box component="button" type="button" onClick={() => onRemoveRivalry(index)} sx={removeBtnSx}>&times;</Box>
                                    </Box>
                                );
                            })}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: '14px' }}>
                                <Box
                                    component="button" type="button"
                                    onClick={async () => {
                                        if (!onSaveConferenceRules) return;
                                        setSavingRules(true);
                                        try {
                                            await onSaveConferenceRules(selectedConference, numConferenceGames, protectedRivalries);
                                        } catch (err) {
                                            console.error('Error saving conference rules:', err);
                                        } finally {
                                            setSavingRules(false);
                                        }
                                    }}
                                    disabled={savingRules || scheduleLocked}
                                    sx={btnPrimarySx}
                                >
                                    {savingRules ? 'Saving...' : 'Save conference rules'}
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                )}
            </Panel>

            {confLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
            ) : (
                <Panel header={`${formatConference(selectedConference)} conference schedule`} more="Click an empty cell to schedule a game">
                    {incompleteTeams.length > 0 && conferenceSchedule.length > 0 && (
                        <Box sx={{ p: '12px 16px 0' }}>
                            <Alert severity="warning" sx={{ py: 0.5 }}>
                                {incompleteTeams.length} team{incompleteTeams.length > 1 ? 's have' : ' has'} fewer than {numConferenceGames} conference games scheduled: {incompleteTeams.map(t => t.abbreviation || t.name).join(', ')}
                            </Alert>
                        </Box>
                    )}
                    <Box sx={{ overflowX: 'auto', p: '16px' }}>
                        <Box
                            component="table"
                            sx={{
                                borderCollapse: 'collapse', fontSize: '0.76rem', minWidth: 900, width: '100%',
                                '& th, & td': { borderBottom: '1px solid var(--line-soft)', borderRight: '1px solid var(--line-soft)', padding: '6px 8px', textAlign: 'center', whiteSpace: 'nowrap' },
                                '& thead th': { background: 'var(--surface-2)', color: 'var(--text-dim)', fontSize: '0.62rem', textTransform: 'uppercase', fontWeight: 800, position: 'sticky', top: 0 },
                                '& .tcol': { position: 'sticky', left: 0, background: 'var(--surface)', textAlign: 'left', zIndex: 1, borderRight: '1px solid var(--line)' },
                                '& thead .tcol': { zIndex: 2, background: 'var(--surface-2)' },
                            }}
                        >
                            <thead>
                                <tr>
                                    <th className="tcol">Team</th>
                                    {Array.from({ length: TOTAL_WEEKS }, (_, i) => <th key={i + 1}>Wk {i + 1}</th>)}
                                    <th>H</th>
                                    <th>A</th>
                                </tr>
                            </thead>
                            <tbody>
                                {conferenceTeams.map(team => {
                                    const counts = getGameCounts(team.name);
                                    const totalGames = counts.home + counts.away;
                                    const isIncomplete = totalGames < numConferenceGames;
                                    return (
                                        <tr key={team.name} style={isIncomplete ? { background: 'color-mix(in srgb, var(--live) 6%, transparent)' } : undefined}>
                                            <td className="tcol">
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                                                    <TeamMark team={teamMap[team.name] || team} size={20} />
                                                    <Box component="b" sx={{ fontSize: '0.78rem' }}>{team.abbreviation || team.name}</Box>
                                                    {isIncomplete && <Box component="span" title={`${team.abbreviation || team.name} has ${totalGames}/${numConferenceGames} conference games scheduled`} sx={{ color: 'var(--live)', fontSize: '0.7rem' }}>⚠</Box>}
                                                </Box>
                                            </td>
                                            {Array.from({ length: TOTAL_WEEKS }, (_, i) => {
                                                const weekNum = i + 1;
                                                const cell = grid[team.name]?.[weekNum];
                                                if (cell) {
                                                    return (
                                                        <td key={weekNum}>
                                                            <Box
                                                                draggable={!scheduleLocked}
                                                                onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; setDragSource({ team: team.name, week: weekNum, cell }); }}
                                                                onDragEnd={() => setDragSource(null)}
                                                                onClick={() => onFilledCellClick(cell, weekNum)}
                                                                title={`${cell.isHome ? 'vs' : '@'} ${cell.opponent} (click to move/delete, or drag to another week)`}
                                                                sx={{
                                                                    display: 'inline-flex', alignItems: 'center', gap: '4px', justifyContent: 'center',
                                                                    cursor: scheduleLocked ? 'pointer' : 'grab', px: '6px', py: '4px', borderRadius: 'var(--r-sm)',
                                                                    background: cell.isHome ? 'color-mix(in srgb, var(--field) 12%, transparent)' : 'color-mix(in srgb, var(--gold) 12%, transparent)',
                                                                    '&:hover': { background: cell.isHome ? 'color-mix(in srgb, var(--field) 20%, transparent)' : 'color-mix(in srgb, var(--gold) 20%, transparent)' },
                                                                }}
                                                            >
                                                                <Box component="span" sx={{ fontSize: '0.62rem', color: 'var(--text-dim)' }}>{cell.isHome ? 'vs' : '@'}</Box>
                                                                <TeamMark team={teamMap[cell.opponent] || { name: cell.opponent }} size={16} />
                                                                <Box component="span" sx={{ fontSize: '0.62rem', maxWidth: 50, overflow: 'hidden', textOverflow: 'ellipsis' }}>{teamMap[cell.opponent]?.abbreviation || cell.opponent?.substring(0, 4)}</Box>
                                                            </Box>
                                                        </td>
                                                    );
                                                }
                                                const isOccupied = teamWeekOccupied.has(`${team.name}|${weekNum}`);
                                                if (isOccupied) {
                                                    return (
                                                        <td key={weekNum} title={`${team.name} already has a non-conference game in Week ${weekNum}`}>
                                                            <Box component="span" sx={{ ...pillSx, background: 'var(--surface-2)', color: 'var(--gold)' }}>OOC</Box>
                                                        </td>
                                                    );
                                                }
                                                const isDropTarget = !scheduleLocked && dragSource && dragSource.team === team.name && dragSource.week !== weekNum;
                                                return (
                                                    <td key={weekNum}>
                                                        <Box
                                                            onClick={() => !scheduleLocked && onEmptyCellClick(team.name, weekNum)}
                                                            onDragOver={(e) => { if (isDropTarget) e.preventDefault(); }}
                                                            onDrop={(e) => { if (!isDropTarget) return; e.preventDefault(); onGameDrop(dragSource.cell, weekNum); setDragSource(null); }}
                                                            sx={{
                                                                cursor: scheduleLocked ? 'default' : 'pointer', py: '6px', borderRadius: 'var(--r-sm)',
                                                                outline: isDropTarget ? '2px dashed var(--field)' : 'none',
                                                                background: isDropTarget ? 'color-mix(in srgb, var(--field) 12%, transparent)' : 'transparent',
                                                                color: 'var(--text-dim)',
                                                                '&:hover': scheduleLocked ? {} : { background: isDropTarget ? 'color-mix(in srgb, var(--field) 20%, transparent)' : 'var(--surface-2)' },
                                                            }}
                                                        >
                                                            &mdash;
                                                        </Box>
                                                    </td>
                                                );
                                            })}
                                            <td>
                                                <Box component="span" sx={{ ...pillSx, background: 'var(--surface-2)', color: isIncomplete ? 'var(--live)' : 'var(--field)' }}>{counts.home}</Box>
                                            </td>
                                            <td>
                                                <Box component="span" sx={{ ...pillSx, background: 'var(--surface-2)', color: isIncomplete ? 'var(--live)' : 'var(--gold)' }}>{counts.away}</Box>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Box>
                    </Box>
                </Panel>
            )}
        </Box>
    );
};

ConferenceScheduleAdminTab.propTypes = {
    selectedConference: PropTypes.string.isRequired,
    onConferenceChange: PropTypes.func.isRequired,
    adminConferences: PropTypes.array.isRequired,
    conferenceSchedule: PropTypes.array.isRequired,
    conferenceTeams: PropTypes.array.isRequired,
    confLoading: PropTypes.bool,
    scheduleLocked: PropTypes.bool,
    teamMap: PropTypes.object.isRequired,
    teamWeekOccupied: PropTypes.instanceOf(Set),
    onAddGameManually: PropTypes.func.isRequired,
    onGenerateSchedule: PropTypes.func.isRequired,
    onEmptyCellClick: PropTypes.func.isRequired,
    onFilledCellClick: PropTypes.func.isRequired,
    onGameDrop: PropTypes.func.isRequired,
    numConferenceGames: PropTypes.number.isRequired,
    onNumConferenceGamesChange: PropTypes.func.isRequired,
    protectedRivalries: PropTypes.array.isRequired,
    onAddRivalry: PropTypes.func.isRequired,
    onRemoveRivalry: PropTypes.func.isRequired,
    onUpdateRivalry: PropTypes.func.isRequired,
    hasGamesPlayed: PropTypes.bool,
    onSaveConferenceRules: PropTypes.func,
};

export default ConferenceScheduleAdminTab;
