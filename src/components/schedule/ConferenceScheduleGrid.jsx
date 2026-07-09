import React, { useMemo } from 'react';
import {
    Box,
    Typography,
    Avatar,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { formatConference } from '../../utils/formatText';
import { conferences } from '../constants/conferences';
import { field } from '../../utils/fieldHelper';

const TOTAL_WEEKS = 12;

const ConferenceScheduleGrid = ({
    selectedConference,
    onConferenceChange,
    conferenceTeams = [],
    conferenceSchedule = [],
    allSeasonSchedule = [],
    teamMap = {},
    loading = false,
}) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const conferenceGameKeys = useMemo(() => {
        const keys = new Set();
        conferenceSchedule.forEach(game => {
            const home = field(game, 'homeTeam', 'home_team');
            const away = field(game, 'awayTeam', 'away_team');
            const week = game.week;
            if (home && away && week) {
                keys.add(`${home}|${away}|${week}`);
                keys.add(`${away}|${home}|${week}`);
            }
        });
        return keys;
    }, [conferenceSchedule]);

    const confGrid = useMemo(() => {
        const grid = {};
        const teamNames = conferenceTeams.map(t => t.name);
        
        conferenceTeams.forEach(team => {
            grid[team.name] = {};
            for (let w = 1; w <= TOTAL_WEEKS; w++) {
                grid[team.name][w] = null;
            }
        });

        conferenceSchedule.forEach(game => {
            const week = game.week;
            const home = field(game, 'homeTeam', 'home_team');
            const away = field(game, 'awayTeam', 'away_team');

            if (teamNames.includes(home)) {
                grid[home] = grid[home] || {};
                grid[home][week] = {
                    ...game,
                    opponent: away,
                    isHome: true,
                    isConferenceGame: true,
                };
            }
            if (teamNames.includes(away)) {
                grid[away] = grid[away] || {};
                grid[away][week] = {
                    ...game,
                    opponent: home,
                    isHome: false,
                    isConferenceGame: true,
                };
            }
        });

        allSeasonSchedule.forEach(game => {
            const week = game.week;
            const home = field(game, 'homeTeam', 'home_team');
            const away = field(game, 'awayTeam', 'away_team');
            const gameKey = `${home}|${away}|${week}`;

            if (conferenceGameKeys.has(gameKey)) {
                return;
            }

            if (teamNames.includes(home) && !teamNames.includes(away)) {
                grid[home] = grid[home] || {};
                if (!grid[home][week]) {
                    grid[home][week] = {
                        ...game,
                        opponent: away,
                        isHome: true,
                        isConferenceGame: false,
                    };
                }
            }
            if (teamNames.includes(away) && !teamNames.includes(home)) {
                grid[away] = grid[away] || {};
                if (!grid[away][week]) {
                    grid[away][week] = {
                        ...game,
                        opponent: home,
                        isHome: false,
                        isConferenceGame: false,
                    };
                }
            }
        });

        return grid;
    }, [conferenceTeams, conferenceSchedule, allSeasonSchedule, conferenceGameKeys]);

    const getGameCounts = (teamName) => {
        let wins = 0, losses = 0;
        conferenceSchedule.forEach(game => {
            const h = field(game, 'homeTeam', 'home_team');
            const a = field(game, 'awayTeam', 'away_team');
            const finished = field(game, 'finished', 'finished');
            const homeScore = field(game, 'homeScore', 'home_score');
            const awayScore = field(game, 'awayScore', 'away_score');
            
            if (finished && homeScore != null && awayScore != null) {
                if (h === teamName) {
                    if (homeScore > awayScore) wins++;
                    else if (homeScore < awayScore) losses++;
                } else if (a === teamName) {
                    if (awayScore > homeScore) wins++;
                    else if (awayScore < homeScore) losses++;
                }
            }
        });
        return { wins, losses };
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <FormControl size="medium" sx={{ minWidth: 220 }}>
                    <InputLabel>Conference</InputLabel>
                    <Select
                        value={selectedConference}
                        label="Conference"
                        onChange={(e) => onConferenceChange(e.target.value)}
                    >
                        {[...conferences].sort((a, b) => a.label.localeCompare(b.label)).map(conf => (
                            <MenuItem key={conf.value} value={conf.value}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {conf.logo && (
                                        <Avatar src={conf.logo} sx={{ width: 20, height: 20 }} variant="rounded" />
                                    )}
                                    {conf.label}
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 3 }}>
                {(() => {
                    const conf = conferences.find(c => c.value === selectedConference);
                    return conf?.logo ? (
                        <Avatar src={conf.logo} sx={{ width: 36, height: 36 }} variant="rounded" />
                    ) : null;
                })()}
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {formatConference(selectedConference)} Conference Schedule
                </Typography>
            </Box>

            {selectedConference === 'FBS_INDEPENDENT' && (
                <Alert severity="info" sx={{ mb: 3, mx: 'auto', maxWidth: 600 }}>
                    FBS Independent teams have no conference games. All games are out-of-conference.
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress size={40} />
                </Box>
            ) : conferenceTeams.length > 0 && selectedConference !== 'FBS_INDEPENDENT' ? (
                <TableContainer
                    component={Paper}
                    sx={{
                        borderRadius: 1,
                        boxShadow: theme.shadows[3],
                        overflow: 'auto',
                        maxHeight: 700,
                        width: '100%',
                    }}
                >
                    <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
                        <colgroup>
                            <col style={{ width: '110px', minWidth: '100px' }} />
                            {Array.from({ length: TOTAL_WEEKS }, (_, i) => (
                                <col key={i} style={{ minWidth: '72px' }} />
                            ))}
                            <col style={{ width: '36px', minWidth: '32px' }} />
                            <col style={{ width: '36px', minWidth: '32px' }} />
                        </colgroup>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{
                                    fontWeight: 700,
                                    position: 'sticky', left: 0,
                                    backgroundColor: 'primary.main', color: 'white', zIndex: 3,
                                    py: 0.5, px: 0.75, fontSize: '0.7rem',
                                }}>
                                    Team
                                </TableCell>
                                {Array.from({ length: TOTAL_WEEKS }, (_, i) => (
                                    <TableCell key={i + 1} sx={{
                                        fontWeight: 700, textAlign: 'center',
                                        backgroundColor: 'primary.main', color: 'white',
                                        py: 0.5, px: 0.25, fontSize: '0.65rem',
                                    }}>
                                        {i + 1}
                                    </TableCell>
                                ))}
                                <TableCell sx={{
                                    fontWeight: 700, textAlign: 'center',
                                    backgroundColor: 'primary.main', color: 'white',
                                    py: 0.5, px: 0.25, fontSize: '0.65rem',
                                }}>W</TableCell>
                                <TableCell sx={{
                                    fontWeight: 700, textAlign: 'center',
                                    backgroundColor: 'primary.main', color: 'white',
                                    py: 0.5, px: 0.25, fontSize: '0.65rem',
                                }}>L</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {conferenceTeams.map(team => {
                                const counts = getGameCounts(team.name);
                                return (
                                    <TableRow key={team.name} hover sx={{ height: 36 }}>
                                        <TableCell sx={{
                                            position: 'sticky', left: 0,
                                            backgroundColor: 'background.paper', zIndex: 1,
                                            py: 0.25, px: 0.5,
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <Avatar src={team.logo} sx={{ width: 20, height: 20, flexShrink: 0 }}>
                                                    {team.name?.charAt(0)}
                                                </Avatar>
                                                <Typography variant="caption" sx={{
                                                    fontWeight: 600, whiteSpace: 'nowrap', fontSize: '0.65rem',
                                                    overflow: 'hidden', textOverflow: 'ellipsis',
                                                }}>
                                                    {team.abbreviation || team.name?.substring(0, 6)}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        {Array.from({ length: TOTAL_WEEKS }, (_, i) => {
                                            const weekNum = i + 1;
                                            const cell = confGrid[team.name]?.[weekNum];
                                            const finished = cell ? field(cell, 'finished', 'finished') : false;
                                            const homeScore = cell ? field(cell, 'homeScore', 'home_score') : null;
                                            const awayScore = cell ? field(cell, 'awayScore', 'away_score') : null;
                                            const hasScore = finished && homeScore != null && awayScore != null;
                                            const cellGameId = cell ? field(cell, 'gameId', 'game_id') : null;
                                            const cellStarted = cell ? field(cell, 'started', 'started') : false;
                                            const cellClickable = cellGameId && cellStarted;

                                            let scoreLabel = '';
                                            let wonGame = null;
                                            if (hasScore) {
                                                const teamScore = cell.isHome ? homeScore : awayScore;
                                                const oppScore = cell.isHome ? awayScore : homeScore;
                                                wonGame = teamScore > oppScore;
                                                scoreLabel = `${teamScore}-${oppScore}`;
                                            }

                                            return (
                                                <TableCell key={weekNum} sx={{ textAlign: 'center', p: 0.25 }}>
                                                    {cell ? (
                                                        <Box
                                                            component={cellClickable ? 'a' : 'div'}
                                                            href={cellClickable ? `/game-details/${cellGameId}` : undefined}
                                                            onClick={(e) => { if (cellClickable) { if (!e.metaKey && !e.ctrlKey && !e.shiftKey) { e.preventDefault(); navigate(`/game-details/${cellGameId}`); } } }}
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: 0.25,
                                                                py: 0.25,
                                                                px: 0.25,
                                                                borderRadius: 0.5,
                                                                textDecoration: 'none', color: 'inherit',
                                                                cursor: cellClickable ? 'pointer' : 'default',
                                                                backgroundColor: hasScore
                                                                    ? (wonGame ? 'rgba(5, 150, 105, 0.1)' : 'rgba(220, 38, 38, 0.08)')
                                                                    : (cell.isConferenceGame
                                                                        ? (cell.isHome
                                                                            ? 'rgba(5, 150, 105, 0.06)'
                                                                            : 'rgba(217, 119, 6, 0.06)')
                                                                        : 'rgba(156, 163, 175, 0.08)'),
                                                                border: cell.isConferenceGame ? 'none' : '1px dashed rgba(156, 163, 175, 0.4)',
                                                                '&:hover': cellClickable ? {
                                                                    backgroundColor: 'rgba(25, 118, 210, 0.12)',
                                                                } : {},
                                                            }}
                                                        >
                                                            <Avatar
                                                                src={teamMap[cell.opponent]?.logo}
                                                                sx={{ width: 16, height: 16, flexShrink: 0 }}
                                                            >
                                                                {cell.opponent?.charAt(0)}
                                                            </Avatar>
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
                                                                <Typography variant="caption" sx={{
                                                                    fontWeight: 500, fontSize: '0.55rem', lineHeight: 1.2,
                                                                    overflow: 'hidden', textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap', maxWidth: '100%',
                                                                    color: cell.isConferenceGame ? 'inherit' : 'text.secondary',
                                                                }}>
                                                                    {cell.isHome ? 'v' : '@'}{' '}
                                                                    {teamMap[cell.opponent]?.abbreviation || cell.opponent?.substring(0, 3)}
                                                                    {!cell.isConferenceGame && ' (OOC)'}
                                                                </Typography>
                                                                {hasScore && (
                                                                    <Typography variant="caption" sx={{
                                                                        fontSize: '0.5rem', fontWeight: 700, lineHeight: 1.1,
                                                                        color: wonGame ? 'success.main' : 'error.main',
                                                                    }}>
                                                                        {wonGame ? 'W' : 'L'} {scoreLabel}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    ) : (
                                                        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.6rem' }}>
                                                            -
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell sx={{ textAlign: 'center', py: 0.25, px: 0.25 }}>
                                            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.6rem', color: 'success.main' }}>
                                                {counts.wins}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: 'center', py: 0.25, px: 0.25 }}>
                                            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.6rem', color: 'error.main' }}>
                                                {counts.losses}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : selectedConference === 'FBS_INDEPENDENT' ? (
                <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                    <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: theme.shadows[3] }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                                    <TableCell sx={{ color: 'white', fontWeight: 700 }}>Team</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 700, textAlign: 'center' }}>Record</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {conferenceTeams.map(team => (
                                    <TableRow key={team.name} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar src={team.logo} sx={{ width: 28, height: 28 }}>
                                                    {team.name?.charAt(0)}
                                                </Avatar>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {team.name}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: 'center' }}>
                                            <Typography variant="body2">
                                                {team.current_wins ?? 0}-{team.current_losses ?? 0}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h6" color="text.secondary">
                        No teams found in {formatConference(selectedConference)}.
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default ConferenceScheduleGrid;
