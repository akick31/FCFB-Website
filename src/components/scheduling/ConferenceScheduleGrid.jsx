import React, { useMemo, useState } from 'react';
import { Box, CircularProgress, useMediaQuery } from '@mui/material';
import { WarningAmber } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { camelOrSnakeField } from '../../utils/fieldHelper';
import Panel from '../ui/Panel';
import TeamMark from '../ui/TeamMark';
import TeamSelect from '../ui/TeamSelect';
import ScheduleGameCell from './grid/ScheduleGameCell';
import ScheduleOpenCell from './grid/ScheduleOpenCell';
import ScheduleLegend from './grid/ScheduleLegend';
import TeamWeekList from './grid/TeamWeekList';
import { buildScheduleGrid, conferenceGameCounts, weekNumbers } from './grid/scheduleGrid';

const countPillSx = {
    display: 'inline-block',
    minWidth: 22,
    fontSize: '0.66rem',
    fontWeight: 800,
    px: '5px',
    py: '3px',
    borderRadius: 'var(--r-sm)',
    background: 'var(--surface-2)',
};

const tableSx = {
    width: '100%',
    tableLayout: 'fixed',
    borderCollapse: 'collapse',
    fontSize: '0.76rem',
    '& th, & td': {
        borderBottom: '1px solid var(--line-soft)',
        p: '2px 3px',
        textAlign: 'center',
    },
    '& thead th': {
        position: 'sticky',
        top: 0,
        zIndex: 2,
        background: 'var(--surface-2)',
        color: 'var(--text-dim)',
        fontSize: '0.62rem',
        fontWeight: 800,
        textTransform: 'uppercase',
        py: '5px',
    },
    '& .tcol': { width: 96, textAlign: 'left', pl: '10px', borderRight: '1px solid var(--line)' },
    '& .count': { width: 38 },
};

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
    const phone = useMediaQuery('(max-width:900px)');
    const [dragSource, setDragSource] = useState(null);
    const [phoneTeam, setPhoneTeam] = useState('');
    const independent = selectedConference === 'FBS_INDEPENDENT';

    const grid = useMemo(
        () => buildScheduleGrid(conferenceTeams, conferenceSchedule, allSeasonSchedule),
        [conferenceTeams, conferenceSchedule, allSeasonSchedule]
    );
    const counts = useMemo(() => conferenceGameCounts(conferenceSchedule), [conferenceSchedule]);
    const totalFor = (name) => (counts[name]?.home || 0) + (counts[name]?.away || 0);
    const teamNames = new Set(conferenceTeams.map((team) => team.name));
    const scheduleIsForTheseTeams = conferenceSchedule.some(
        (game) =>
            teamNames.has(camelOrSnakeField(game, 'homeTeam', 'home_team')) ||
            teamNames.has(camelOrSnakeField(game, 'awayTeam', 'away_team'))
    );
    const isShort = (name) => scheduleIsForTheseTeams && totalFor(name) < numConferenceGames;
    const incompleteTeams = conferenceTeams.filter((team) => isShort(team.name));

    const dropStateFor = (teamName, week) => {
        if (scheduleLocked || !dragSource || dragSource.team !== teamName || dragSource.week === week) {
            return 'none';
        }
        return teamWeekOccupiedAll?.has(`${dragSource.cell.opponent}|${week}`) ? 'invalid' : 'valid';
    };

    if (confLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    const shownTeam = phoneTeam || conferenceTeams[0]?.name || '';
    const abbreviationOf = (team) => teamMap[team.name]?.abbreviation || team.abbreviation || team.name;

    return (
        <Panel>
            <Box sx={{ p: '3px 12px', borderBottom: '1px solid var(--line-soft)' }}>
                <ScheduleLegend independent={independent} numConferenceGames={numConferenceGames} />
            </Box>
            {incompleteTeams.length > 0 && conferenceSchedule.length > 0 && (
                <Box sx={{ p: '6px 14px', fontSize: '0.74rem', color: 'var(--live)', fontWeight: 700 }}>
                    Short on conference games: {incompleteTeams.map(abbreviationOf).join(', ')}
                </Box>
            )}
            {phone ? (
                <>
                    <Box sx={{ px: '14px', pb: '10px' }}>
                        <TeamSelect
                            value={shownTeam}
                            onChange={setPhoneTeam}
                            teams={conferenceTeams.map((team) => team.name)}
                            ariaLabel="Team"
                        />
                    </Box>
                    {shownTeam && (
                        <TeamWeekList
                            weeks={grid[shownTeam] || {}}
                            independent={independent}
                            locked={scheduleLocked}
                            onGameClick={onFilledCellClick}
                            onOpenClick={(week) => onEmptyCellClick(shownTeam, week)}
                        />
                    )}
                </>
            ) : (
                <Box component="table" sx={tableSx}>
                    <thead>
                        <tr>
                            <th className="tcol">Team</th>
                            {weekNumbers.map((week) => (
                                <th key={week}>Wk {week}</th>
                            ))}
                            <th className="count" title="Conference home games">
                                H
                            </th>
                            <th className="count" title="Conference away games">
                                A
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {conferenceTeams.map((team) => {
                            const total = totalFor(team.name);
                            const short = isShort(team.name);
                            return (
                                <tr
                                    key={team.name}
                                    style={
                                        short
                                            ? { background: 'color-mix(in srgb, var(--live) 6%, transparent)' }
                                            : undefined
                                    }
                                >
                                    <td className="tcol">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <TeamMark team={{ name: team.name }} size={20} decorative />
                                            <Box component="b" sx={{ fontSize: '0.76rem' }} title={team.name}>
                                                {abbreviationOf(team)}
                                            </Box>
                                            {short && (
                                                <WarningAmber
                                                    titleAccess={`${team.name} has ${total}/${numConferenceGames} conference games`}
                                                    sx={{ color: 'var(--live)', fontSize: '0.85rem' }}
                                                />
                                            )}
                                        </Box>
                                    </td>
                                    {weekNumbers.map((week) => {
                                        const cell = grid[team.name]?.[week];
                                        const dropState = dropStateFor(team.name, week);
                                        return (
                                            <td key={week}>
                                                {cell ? (
                                                    <ScheduleGameCell
                                                        cell={cell}
                                                        independent={independent}
                                                        locked={scheduleLocked}
                                                        onClick={() => onFilledCellClick(cell, week)}
                                                        onDragStart={() =>
                                                            setDragSource({ team: team.name, week, cell })
                                                        }
                                                        onDragEnd={() => setDragSource(null)}
                                                    />
                                                ) : (
                                                    <ScheduleOpenCell
                                                        locked={scheduleLocked}
                                                        dropState={dropState}
                                                        blockedReason={
                                                            dropState === 'invalid'
                                                                ? `${dragSource.cell.opponent} already plays in week ${week}`
                                                                : undefined
                                                        }
                                                        onClick={() => onEmptyCellClick(team.name, week)}
                                                        onDrop={() => {
                                                            onGameDrop(dragSource.cell, week);
                                                            setDragSource(null);
                                                        }}
                                                    />
                                                )}
                                            </td>
                                        );
                                    })}
                                    <td className="count">
                                        <Box
                                            component="span"
                                            sx={{ ...countPillSx, color: short ? 'var(--live)' : 'var(--field)' }}
                                        >
                                            {counts[team.name]?.home || 0}
                                        </Box>
                                    </td>
                                    <td className="count">
                                        <Box
                                            component="span"
                                            sx={{ ...countPillSx, color: short ? 'var(--live)' : 'var(--gold)' }}
                                        >
                                            {counts[team.name]?.away || 0}
                                        </Box>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Box>
            )}
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
