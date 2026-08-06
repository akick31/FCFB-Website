import React, { useState, useMemo } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { WarningAmber } from '@mui/icons-material';
import PropTypes from 'prop-types';
import Panel from '../ui/Panel';
import TeamMark from '../ui/TeamMark';
import ConferenceRulesEditor from './ConferenceRulesEditor';
import { formatConference } from '../../utils/formatText';
import { field } from '../../utils/fieldHelper';

const TOTAL_WEEKS = 12;

const selectSx = { border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.82rem', cursor: 'pointer', '& option': { background: 'var(--surface)', color: 'var(--text)' } };
const btnPrimarySx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '14px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', '&:disabled': { opacity: 0.6, cursor: 'default' } };
const ctrlSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '12px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' }, '&:disabled': { opacity: 0.6, cursor: 'default' } };
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
    allSeasonSchedule = [],
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
    divisions,
    onAddDivision,
    onRemoveDivision,
    onUpdateDivision,
    hasGamesPlayed = false,
    onSaveConferenceRules,
}) => {
    const [rulesExpanded, setRulesExpanded] = useState(false);
    const [dragSource, setDragSource] = useState(null);

    const grid = useMemo(() => {
        const g = {};
        const teamNames = conferenceTeams.map(t => t.name);
        conferenceTeams.forEach(team => {
            g[team.name] = {};
            for (let w = 1; w <= TOTAL_WEEKS; w++) {
                g[team.name][w] = null;
            }
        });

        conferenceSchedule.forEach(game => {
            const week = game.week;
            if (!week) return;
            const home = field(game, 'homeTeam', 'home_team');
            const away = field(game, 'awayTeam', 'away_team');

            if (teamNames.includes(home)) {
                g[home][week] = { ...game, opponent: away, isHome: true, gameType: 'CONFERENCE_GAME' };
            }
            if (teamNames.includes(away)) {
                g[away][week] = { ...game, opponent: home, isHome: false, gameType: 'CONFERENCE_GAME' };
            }
        });

        allSeasonSchedule.forEach(game => {
            const week = game.week;
            if (!week || week > TOTAL_WEEKS) return;
            const home = field(game, 'homeTeam', 'home_team');
            const away = field(game, 'awayTeam', 'away_team');
            const gameType = field(game, 'gameType', 'game_type');

            if (teamNames.includes(home) && g[home][week] == null) {
                g[home][week] = { ...game, opponent: away, isHome: true, gameType };
            }
            if (teamNames.includes(away) && g[away][week] == null) {
                g[away][week] = { ...game, opponent: home, isHome: false, gameType };
            }
        });

        return g;
    }, [conferenceTeams, conferenceSchedule, allSeasonSchedule]);

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
                    Auto-generate schedule
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
                        <ConferenceRulesEditor
                            conference={selectedConference}
                            conferenceTeams={conferenceTeams}
                            numConferenceGames={numConferenceGames}
                            protectedRivalries={protectedRivalries}
                            divisions={divisions}
                            onNumConferenceGamesChange={onNumConferenceGamesChange}
                            onAddRivalry={onAddRivalry}
                            onRemoveRivalry={onRemoveRivalry}
                            onUpdateRivalry={onUpdateRivalry}
                            onAddDivision={onAddDivision}
                            onRemoveDivision={onRemoveDivision}
                            onUpdateDivision={onUpdateDivision}
                            onSave={onSaveConferenceRules}
                            disabled={scheduleLocked}
                        />
                    </Box>
                )}
            </Panel>

            {confLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
            ) : (
                <Panel header={`${formatConference(selectedConference)} conference schedule`} more="Click an empty cell to schedule a game">
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '16px', px: '16px', pt: '12px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '3px', background: 'color-mix(in srgb, var(--brand) 30%, transparent)', border: '1px solid var(--brand)' }} />
                            Conference game
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '3px', background: 'color-mix(in srgb, var(--gold) 30%, transparent)', border: '1px solid var(--gold)' }} />
                            Out of conference
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Box component="span" sx={{ color: 'var(--text-dim)' }}>vs</Box>
                            Home
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Box component="span" sx={{ color: 'var(--text-dim)' }}>@</Box>
                            Away
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <WarningAmber sx={{ color: 'var(--live)', fontSize: '0.85rem' }} />
                            Fewer than {numConferenceGames} conference games scheduled
                        </Box>
                    </Box>
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
                                                    <TeamMark team={teamMap[team.name] || { name: team.name, abbreviation: team.abbreviation }} size={20} />
                                                    <Box component="b" sx={{ fontSize: '0.78rem' }}>{team.abbreviation || team.name}</Box>
                                                    {isIncomplete && <WarningAmber titleAccess={`${team.abbreviation || team.name} has ${totalGames}/${numConferenceGames} conference games scheduled`} sx={{ color: 'var(--live)', fontSize: '0.85rem' }} />}
                                                </Box>
                                            </td>
                                            {Array.from({ length: TOTAL_WEEKS }, (_, i) => {
                                                const weekNum = i + 1;
                                                const cell = grid[team.name]?.[weekNum];
                                                if (cell) {
                                                    const isConference = cell.gameType === 'CONFERENCE_GAME';
                                                    return (
                                                        <td key={weekNum}>
                                                            <Box
                                                                draggable={!scheduleLocked}
                                                                onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; setDragSource({ team: team.name, week: weekNum, cell }); }}
                                                                onDragEnd={() => setDragSource(null)}
                                                                onClick={() => onFilledCellClick(cell, weekNum)}
                                                                title={`${isConference ? 'Conference' : 'Out of conference'} - ${cell.isHome ? 'vs' : '@'} ${cell.opponent} (click to move/delete, or drag to another week)`}
                                                                sx={{
                                                                    display: 'inline-flex', alignItems: 'center', gap: '4px', justifyContent: 'center',
                                                                    cursor: scheduleLocked ? 'pointer' : 'grab', px: '6px', py: '4px', borderRadius: 'var(--r-sm)',
                                                                    background: isConference ? 'color-mix(in srgb, var(--brand) 12%, transparent)' : 'color-mix(in srgb, var(--gold) 12%, transparent)',
                                                                    '&:hover': { background: isConference ? 'color-mix(in srgb, var(--brand) 20%, transparent)' : 'color-mix(in srgb, var(--gold) 20%, transparent)' },
                                                                }}
                                                            >
                                                                <Box component="span" sx={{ fontSize: '0.62rem', color: 'var(--text-dim)' }}>{cell.isHome ? 'vs' : '@'}</Box>
                                                                <TeamMark team={teamMap[cell.opponent] || { name: cell.opponent }} size={16} />
                                                                <Box component="span" sx={{ fontSize: '0.62rem', maxWidth: 50, overflow: 'hidden', textOverflow: 'ellipsis' }}>{teamMap[cell.opponent]?.abbreviation || cell.opponent?.substring(0, 4)}</Box>
                                                            </Box>
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
    allSeasonSchedule: PropTypes.array,
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
    divisions: PropTypes.array.isRequired,
    onAddDivision: PropTypes.func.isRequired,
    onRemoveDivision: PropTypes.func.isRequired,
    onUpdateDivision: PropTypes.func.isRequired,
    hasGamesPlayed: PropTypes.bool,
    onSaveConferenceRules: PropTypes.func,
};

export default ConferenceScheduleAdminTab;
