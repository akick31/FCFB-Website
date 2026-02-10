import React, { useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Autocomplete,
    Avatar,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Alert,
    Tooltip,
    Collapse,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    AutoFixHigh as GenerateIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Settings as SettingsIcon,
    WarningAmber as WarningIcon,
} from '@mui/icons-material';
import StyledCard from '../ui/StyledCard';
import { formatConference } from '../../utils/formatText';
import CircularProgress from '@mui/material/CircularProgress';

const TOTAL_WEEKS = 12;
const DEFAULT_CONFERENCE_GAMES = 9;

// Helper to safely read schedule fields
const field = (game, camel, snake) => game[camel] !== undefined ? game[camel] : game[snake];

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
    numConferenceGames,
    onNumConferenceGamesChange,
    protectedRivalries,
    onAddRivalry,
    onRemoveRivalry,
    onUpdateRivalry,
    hasGamesPlayed = false,
}) => {
    const [rulesExpanded, setRulesExpanded] = useState(false);

    // Build a grid: rows = teams, columns = weeks
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

    // Count home/away for a team
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

    return (
        <Box>
            {/* Conference selector + actions */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Conference</InputLabel>
                    <Select
                        value={selectedConference}
                        label="Conference"
                        onChange={(e) => onConferenceChange(e.target.value)}
                    >
                        {adminConferences.map(conf => (
                            <MenuItem key={conf.value} value={conf.value}>
                                {conf.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button
                    variant="contained"
                    startIcon={<GenerateIcon />}
                    onClick={onGenerateSchedule}
                    color="primary"
                    disabled={scheduleLocked || hasGamesPlayed}
                    title={hasGamesPlayed ? 'Cannot auto-generate: games have already been played this season' : scheduleLocked ? 'Schedule is locked' : ''}
                >
                    Auto-Generate Schedule
                </Button>

                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={onAddGameManually}
                    disabled={scheduleLocked}
                >
                    Add Game Manually
                </Button>
            </Box>

            {/* ===== CONFERENCE RULES SECTION (INLINE) ===== */}
            <StyledCard hover={false} sx={{ mb: 3 }}>
                <Box sx={{ p: 2 }}>
                    <Box
                        sx={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            cursor: 'pointer',
                        }}
                        onClick={() => setRulesExpanded(!rulesExpanded)}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SettingsIcon color="primary" fontSize="small" />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                Conference Rules — {formatConference(selectedConference)}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {numConferenceGames} conf games | {TOTAL_WEEKS - numConferenceGames} OOC | {conferenceTeams.length} teams |
                                {' '}{protectedRivalries.filter(r => r.team1 && r.team2).length} rivalries
                            </Typography>
                            {rulesExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </Box>
                    </Box>

                    <Collapse in={rulesExpanded}>
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {conferenceTeams.length <= numConferenceGames + 1 && (
                                <Alert severity="info" sx={{ py: 0.5 }}>
                                    Round robin format — each team plays every other team once.
                                </Alert>
                            )}

                            <TextField
                                label="Conference Games Per Team"
                                type="number"
                                size="small"
                                value={numConferenceGames}
                                onChange={(e) => onNumConferenceGamesChange(parseInt(e.target.value) || DEFAULT_CONFERENCE_GAMES)}
                                inputProps={{ min: 1, max: TOTAL_WEEKS }}
                                helperText={`OOC games: ${TOTAL_WEEKS - numConferenceGames}`}
                                sx={{ maxWidth: 300 }}
                            />

                            <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                        Protected Rivalries
                                    </Typography>
                                    <Button size="small" startIcon={<AddIcon />} onClick={onAddRivalry}>
                                        Add Rivalry
                                    </Button>
                                </Box>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                                    Protected rivalries are always scheduled when auto-generating. They cannot be deleted — only moved across weeks.
                                    The schedule cannot be finalized if any protected rivalry is missing.
                                </Typography>

                                {protectedRivalries.length === 0 && (
                                    <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                                        No protected rivalries set. Click "Add Rivalry" to define guaranteed matchups.
                                    </Typography>
                                )}

                                {protectedRivalries.map((rivalry, index) => {
                                    // Once both teams are set, the rivalry is "locked" and cannot be removed
                                    const isLocked = rivalry.team1 && rivalry.team2;
                                    return (
                                        <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                                            <Autocomplete
                                                options={conferenceTeams}
                                                getOptionLabel={(option) => option.name || ''}
                                                value={conferenceTeams.find(t => t.name === rivalry.team1) || null}
                                                onChange={(_, v) => onUpdateRivalry(index, 'team1', v?.name || '')}
                                                renderInput={(params) => (
                                                    <TextField {...params} label="Team 1" size="small" />
                                                )}
                                                sx={{ flex: 1 }}
                                                isOptionEqualToValue={(option, value) => option.name === value?.name}
                                                disabled={isLocked}
                                            />
                                            <Typography variant="body2" sx={{ mx: 1 }}>vs</Typography>
                                            <Autocomplete
                                                options={conferenceTeams}
                                                getOptionLabel={(option) => option.name || ''}
                                                value={conferenceTeams.find(t => t.name === rivalry.team2) || null}
                                                onChange={(_, v) => onUpdateRivalry(index, 'team2', v?.name || '')}
                                                renderInput={(params) => (
                                                    <TextField {...params} label="Team 2" size="small" />
                                                )}
                                                sx={{ flex: 1 }}
                                                isOptionEqualToValue={(option, value) => option.name === value?.name}
                                                disabled={isLocked}
                                            />
                                            <FormControl size="small" sx={{ minWidth: 100 }}>
                                                <InputLabel>Week</InputLabel>
                                                <Select
                                                    value={rivalry.week || ''}
                                                    label="Week"
                                                    onChange={(e) => onUpdateRivalry(index, 'week', e.target.value || null)}
                                                >
                                                    <MenuItem value="">Any</MenuItem>
                                                    {Array.from({ length: TOTAL_WEEKS }, (_, i) => (
                                                        <MenuItem key={i + 1} value={i + 1}>Wk {i + 1}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                            {isLocked ? (
                                                <Tooltip title="Protected rivalries cannot be deleted, only moved">
                                                    <span>
                                                        <IconButton size="small" disabled>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                            ) : (
                                                <IconButton size="small" color="error" onClick={() => onRemoveRivalry(index)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    </Collapse>
                </Box>
            </StyledCard>

            {/* Conference schedule grid */}
            {confLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <StyledCard hover={false}>
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                            {formatConference(selectedConference)} Conference Schedule
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                            Click on an empty cell to schedule a game for that team and week.
                        </Typography>
                        {(() => {
                            const incompleteTeams = conferenceTeams.filter(t => {
                                const c = getGameCounts(t.name);
                                return c.home + c.away < numConferenceGames;
                            });
                            if (incompleteTeams.length === 0 || conferenceSchedule.length === 0) return null;
                            return (
                                <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 2, py: 0.5 }}>
                                    {incompleteTeams.length} team{incompleteTeams.length > 1 ? 's have' : ' has'} fewer
                                    than {numConferenceGames} conference games scheduled:
                                    {' '}{incompleteTeams.map(t => t.abbreviation || t.name).join(', ')}
                                </Alert>
                            );
                        })()}
                        <TableContainer sx={{ maxHeight: 600 }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700, minWidth: 160, position: 'sticky', left: 0, backgroundColor: 'background.paper', zIndex: 3 }}>
                                            Team
                                        </TableCell>
                                        {Array.from({ length: TOTAL_WEEKS }, (_, i) => (
                                            <TableCell key={i + 1} sx={{ fontWeight: 700, textAlign: 'center', minWidth: 120 }}>
                                                Wk {i + 1}
                                            </TableCell>
                                        ))}
                                        <TableCell sx={{ fontWeight: 700, textAlign: 'center', minWidth: 80 }}>H</TableCell>
                                        <TableCell sx={{ fontWeight: 700, textAlign: 'center', minWidth: 80 }}>A</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {conferenceTeams.map(team => {
                                        const counts = getGameCounts(team.name);
                                        const totalGames = counts.home + counts.away;
                                        const isIncomplete = totalGames < numConferenceGames;
                                        return (
                                            <TableRow
                                                key={team.name}
                                                hover
                                                sx={isIncomplete ? {
                                                    backgroundColor: 'rgba(211, 47, 47, 0.04)',
                                                    '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.08)' },
                                                } : {}}
                                            >
                                                <TableCell sx={{ position: 'sticky', left: 0, backgroundColor: isIncomplete ? 'rgba(211, 47, 47, 0.04)' : 'background.paper', zIndex: 1 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Avatar src={team.logo} sx={{ width: 24, height: 24 }}>
                                                            {team.name?.charAt(0)}
                                                        </Avatar>
                                                        <Typography variant="body2" sx={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                                                            {team.abbreviation || team.name}
                                                        </Typography>
                                                        {isIncomplete && (
                                                            <Tooltip title={`${team.abbreviation || team.name} has ${totalGames}/${numConferenceGames} conference games scheduled`}>
                                                                <WarningIcon sx={{ fontSize: 16, color: 'error.main', ml: 0.5 }} />
                                                            </Tooltip>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                {Array.from({ length: TOTAL_WEEKS }, (_, i) => {
                                                    const weekNum = i + 1;
                                                    const cell = grid[team.name]?.[weekNum];
                                                    return (
                                                        <TableCell key={weekNum} sx={{ textAlign: 'center', p: 0.5 }}>
                                                            {cell ? (
                                                                <Tooltip title={`${cell.isHome ? 'vs' : '@'} ${cell.opponent} — Click to move/delete`}>
                                                                    <Box
                                                                        sx={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            gap: 0.5,
                                                                            cursor: 'pointer',
                                                                            p: 0.5,
                                                                            borderRadius: 1,
                                                                            backgroundColor: cell.isHome
                                                                                ? 'rgba(5, 150, 105, 0.08)'
                                                                                : 'rgba(217, 119, 6, 0.08)',
                                                                            '&:hover': {
                                                                                backgroundColor: cell.isHome
                                                                                    ? 'rgba(5, 150, 105, 0.15)'
                                                                                    : 'rgba(217, 119, 6, 0.15)',
                                                                            }
                                                                        }}
                                                                        onClick={() => onFilledCellClick(cell, weekNum)}
                                                                    >
                                                                        <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.7rem' }}>
                                                                            {cell.isHome ? 'vs' : '@'}
                                                                        </Typography>
                                                                        <Avatar
                                                                            src={teamMap[cell.opponent]?.logo}
                                                                            sx={{ width: 18, height: 18 }}
                                                                        >
                                                                            {cell.opponent?.charAt(0)}
                                                                        </Avatar>
                                                                        <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.65rem', maxWidth: 50, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                            {teamMap[cell.opponent]?.abbreviation || cell.opponent?.substring(0, 4)}
                                                                        </Typography>
                                                                    </Box>
                                                                </Tooltip>
                                                            ) : (() => {
                                                                const isOccupied = teamWeekOccupied.has(`${team.name}|${weekNum}`);
                                                                return isOccupied ? (
                                                                    <Tooltip title={`${team.name} already has a non-conference game in Week ${weekNum}`}>
                                                                        <Box sx={{
                                                                            p: 1, borderRadius: 1,
                                                                            backgroundColor: 'rgba(156,39,176,0.06)',
                                                                            textAlign: 'center',
                                                                        }}>
                                                                            <Typography variant="caption" sx={{ color: 'secondary.main', fontSize: '0.6rem', fontWeight: 500 }}>
                                                                                OOC
                                                                            </Typography>
                                                                        </Box>
                                                                    </Tooltip>
                                                                ) : (
                                                                    <Box
                                                                        onClick={() => !scheduleLocked && onEmptyCellClick(team.name, weekNum)}
                                                                        sx={{
                                                                            cursor: scheduleLocked ? 'default' : 'pointer',
                                                                            p: 1,
                                                                            borderRadius: 1,
                                                                            '&:hover': scheduleLocked ? {} : {
                                                                                backgroundColor: 'rgba(0,0,0,0.04)',
                                                                                outline: '1px dashed',
                                                                                outlineColor: 'primary.main',
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                                                            ---
                                                                        </Typography>
                                                                    </Box>
                                                                );
                                                            })()}
                                                        </TableCell>
                                                    );
                                                })}
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    <Chip label={counts.home} size="small" color={isIncomplete ? 'error' : 'success'} variant="outlined" sx={{ minWidth: 32 }} />
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    <Chip label={counts.away} size="small" color={isIncomplete ? 'error' : 'warning'} variant="outlined" sx={{ minWidth: 32 }} />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </StyledCard>
            )}
        </Box>
    );
};

export default ConferenceScheduleAdminTab;
