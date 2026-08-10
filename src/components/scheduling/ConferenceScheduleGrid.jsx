import React, { useMemo, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { WarningAmber } from '@mui/icons-material';
import PropTypes from 'prop-types';
import Panel from '../ui/Panel';
import TeamMark from '../ui/TeamMark';
import { formatConference } from '../../utils/formatText';
import { field } from '../../utils/fieldHelper';

const TOTAL_WEEKS = 12;

const pillSx = { display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.05em', px: '7px', py: '3px', borderRadius: 'var(--r-sm)', lineHeight: 1 };

const ConferenceScheduleGrid = ({
    selectedConference,
    conferenceSchedule,
    conferenceTeams,
    allSeasonSchedule = [],
    confLoading,
    scheduleLocked,
    teamMap,
    teamWeekOccupiedAll,
    numConferenceGames,
    onEmptyCellClick,
    onFilledCellClick,
    onGameDrop,
}) => {
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

    if (confLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>;
    }

    return (
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
                    <Box sx={{ width: 12, height: 12, borderRadius: '3px', background: 'transparent', border: '2px solid var(--disc)' }} />
                    Neutral site
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
                                            const isNeutralSite = Boolean(field(cell, 'neutralSite', 'neutral_site'));
                                            return (
                                                <td key={weekNum}>
                                                    <Box
                                                        draggable={!scheduleLocked}
                                                        onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; setDragSource({ team: team.name, week: weekNum, cell }); }}
                                                        onDragEnd={() => setDragSource(null)}
                                                        onClick={() => onFilledCellClick(cell, weekNum)}
                                                        title={`${isConference ? 'Conference' : 'Out of conference'}${isNeutralSite ? ', neutral site' : ''} - ${cell.isHome ? 'vs' : '@'} ${cell.opponent} (click to move/delete, or drag to another week)`}
                                                        sx={{
                                                            display: 'inline-flex', alignItems: 'center', gap: '4px', justifyContent: 'center',
                                                            cursor: scheduleLocked ? 'pointer' : 'grab', px: '6px', py: '4px', borderRadius: 'var(--r-sm)',
                                                            border: isNeutralSite ? '2px solid var(--disc)' : '2px solid transparent',
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
                                        const opponentOccupied = isDropTarget && teamWeekOccupiedAll?.has(`${dragSource.cell.opponent}|${weekNum}`);
                                        const isValidDrop = isDropTarget && !opponentOccupied;
                                        const dropColor = isValidDrop ? 'var(--field)' : 'var(--live)';
                                        return (
                                            <td key={weekNum}>
                                                <Box
                                                    onClick={() => !scheduleLocked && onEmptyCellClick(team.name, weekNum)}
                                                    onDragOver={(e) => { if (isValidDrop) e.preventDefault(); }}
                                                    onDrop={(e) => { if (!isValidDrop) return; e.preventDefault(); onGameDrop(dragSource.cell, weekNum); setDragSource(null); }}
                                                    title={opponentOccupied ? `${dragSource.cell.opponent} already has a game scheduled in Week ${weekNum}` : undefined}
                                                    sx={{
                                                        cursor: scheduleLocked ? 'default' : isDropTarget && !isValidDrop ? 'not-allowed' : 'pointer', py: '6px', borderRadius: 'var(--r-sm)',
                                                        outline: isDropTarget ? `2px dashed ${dropColor}` : 'none',
                                                        background: isDropTarget ? `color-mix(in srgb, ${dropColor} 12%, transparent)` : 'transparent',
                                                        color: 'var(--text-dim)',
                                                        '&:hover': scheduleLocked ? {} : { background: isDropTarget ? `color-mix(in srgb, ${dropColor} 20%, transparent)` : 'var(--surface-2)' },
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
    );
};

ConferenceScheduleGrid.propTypes = {
    selectedConference: PropTypes.string.isRequired,
    conferenceSchedule: PropTypes.array.isRequired,
    conferenceTeams: PropTypes.array.isRequired,
    allSeasonSchedule: PropTypes.array,
    confLoading: PropTypes.bool,
    scheduleLocked: PropTypes.bool,
    teamMap: PropTypes.object.isRequired,
    teamWeekOccupiedAll: PropTypes.instanceOf(Set),
    numConferenceGames: PropTypes.number.isRequired,
    onEmptyCellClick: PropTypes.func.isRequired,
    onFilledCellClick: PropTypes.func.isRequired,
    onGameDrop: PropTypes.func.isRequired,
};

export default ConferenceScheduleGrid;
