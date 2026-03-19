import React from 'react';
import {
    Box,
    Typography,
    Avatar,
    Chip,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Autocomplete,
    TextField,
    CircularProgress,
    useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { formatGameType } from '../../utils/formatText';
import { field } from '../../utils/fieldHelper';

const GAME_TYPE_CHIP_COLORS = {
    CONFERENCE_GAME: 'primary',
    OUT_OF_CONFERENCE: 'secondary',
    CONFERENCE_CHAMPIONSHIP: 'warning',
    PLAYOFFS: 'error',
    NATIONAL_CHAMPIONSHIP: 'error',
    BOWL: 'info',
    SCRIMMAGE: 'default',
};

const TeamScheduleTable = ({
    teams = [],
    selectedTeam,
    onTeamChange,
    schedule = [],
    season,
    teamMap = {},
    loading = false,
}) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const getOpponentName = (game) => {
        if (!selectedTeam) return '';
        const home = field(game, 'homeTeam', 'home_team');
        const away = field(game, 'awayTeam', 'away_team');
        return home === selectedTeam.name ? away : home;
    };

    const isHomeGame = (game) => {
        const home = field(game, 'homeTeam', 'home_team');
        return home === selectedTeam?.name;
    };

    const getGameResult = (game) => {
        const finished = field(game, 'finished', 'finished');
        const started = field(game, 'started', 'started');
        const homeScore = field(game, 'homeScore', 'home_score');
        const awayScore = field(game, 'awayScore', 'away_score');
        const home = field(game, 'homeTeam', 'home_team');

        if (finished && homeScore != null && awayScore != null) {
            const isHome = home === selectedTeam?.name;
            const teamScore = isHome ? homeScore : awayScore;
            const oppScore = isHome ? awayScore : homeScore;
            const won = teamScore > oppScore;
            const tied = teamScore === oppScore;
            return {
                label: tied ? `T ${teamScore}-${oppScore}` : `${won ? 'W' : 'L'} ${teamScore}-${oppScore}`,
                color: tied ? 'default' : (won ? 'success' : 'error'),
                variant: 'filled',
            };
        }
        if (finished) {
            return { label: 'Final', color: 'default', variant: 'filled' };
        }
        if (started && homeScore != null && awayScore != null) {
            const isHome = home === selectedTeam?.name;
            const teamScore = isHome ? homeScore : awayScore;
            const oppScore = isHome ? awayScore : homeScore;
            return {
                label: `${teamScore}-${oppScore}`,
                color: 'success',
                variant: 'outlined',
            };
        }
        if (started) {
            return { label: 'In Progress', color: 'success', variant: 'outlined' };
        }
        return { label: 'Upcoming', color: 'info', variant: 'outlined' };
    };

    const isGameClickable = (game) => {
        const gameId = field(game, 'gameId', 'game_id');
        const started = field(game, 'started', 'started');
        return gameId && started;
    };

    const handleGameClick = (e, game) => {
        const gameId = field(game, 'gameId', 'game_id');
        if (gameId) {
            if (e.metaKey || e.ctrlKey || e.shiftKey) return;
            e.preventDefault();
            navigate(`/game-details/${gameId}`);
        }
    };

    return (
        <>
            {/* Team Search Dropdown */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                <Autocomplete
                    options={teams.filter(t => t.active)}
                    getOptionLabel={(option) => option.name || ''}
                    value={selectedTeam}
                    onChange={(_, newValue) => onTeamChange(newValue)}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Search for a team..."
                            variant="outlined"
                        />
                    )}
                    renderOption={(props, option) => {
                        const { key, ...otherProps } = props;
                        return (
                            <Box
                                component="li"
                                key={key}
                                {...otherProps}
                                sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
                            >
                                <Avatar
                                    src={option.logo}
                                    alt={option.name}
                                    sx={{ width: 28, height: 28 }}
                                >
                                    {option.name?.charAt(0)}
                                </Avatar>
                                <Typography>{option.name}</Typography>
                            </Box>
                        );
                    }}
                    sx={{ width: { xs: '100%', sm: 400 } }}
                    isOptionEqualToValue={(option, value) => option.name === value?.name}
                />
            </Box>

            {/* Selected Team Header */}
            {selectedTeam && (
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    mb: 4,
                    p: 3,
                    borderRadius: 3,
                    backgroundColor: 'background.paper',
                    boxShadow: theme.shadows[2],
                }}>
                    <Avatar
                        src={selectedTeam.logo}
                        alt={selectedTeam.name}
                        sx={{ width: 64, height: 64 }}
                    >
                        {selectedTeam.name?.charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {selectedTeam.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Season {season} Schedule
                            {selectedTeam.current_wins !== undefined &&
                                ` — ${selectedTeam.current_wins}-${selectedTeam.current_losses}`
                            }
                        </Typography>
                    </Box>
                </Box>
            )}

            {/* Schedule Table */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress size={40} />
                </Box>
            ) : selectedTeam && schedule.length > 0 ? (
                <TableContainer
                    component={Paper}
                    sx={{
                        borderRadius: 3,
                        boxShadow: theme.shadows[3],
                        overflow: 'hidden',
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: 'primary.main' }}>
                                <TableCell sx={{ color: 'white', fontWeight: 700, width: 80 }}>Week</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Opponent</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 700, width: 100, textAlign: 'center' }}>Home/Away</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 700, width: 180 }}>Game Type</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 700, width: 140, textAlign: 'center' }}>Result</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {schedule.map((game, index) => {
                                const opponentName = getOpponentName(game);
                                const opponentData = teamMap[opponentName];
                                const home = isHomeGame(game);
                                const result = getGameResult(game);
                                const gameType = field(game, 'gameType', 'game_type');
                                const clickable = isGameClickable(game);

                                return (
                                    <TableRow
                                        key={game.id || index}
                                        component={clickable ? 'a' : 'tr'}
                                        href={clickable ? `/game-details/${field(game, 'gameId', 'game_id')}` : undefined}
                                        onClick={(e) => {
                                            if (!clickable) return;
                                            if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                                            e.preventDefault();
                                            handleGameClick(e, game);
                                        }}
                                        sx={{
                                            '&:nth-of-type(odd)': { backgroundColor: 'rgba(0,0,0,0.02)' },
                                            '&:hover': {
                                                backgroundColor: clickable ? 'rgba(25, 118, 210, 0.08)' : 'rgba(0,0,0,0.04)',
                                            },
                                            cursor: clickable ? 'pointer' : 'default',
                                            transition: 'background-color 0.2s',
                                            textDecoration: 'none',
                                            color: 'inherit',
                                            display: 'table-row',
                                        }}
                                    >
                                        <TableCell>
                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                {game.week}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                {/* Postseason Game Logo */}
                                                {(gameType === 'BOWL' || gameType === 'PLAYOFFS' || gameType === 'CONFERENCE_CHAMPIONSHIP' || gameType === 'NATIONAL_CHAMPIONSHIP') &&
                                                  field(game, 'postseasonGameLogo', 'postseason_game_logo') && (
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>
                                                        <Avatar
                                                            src={(() => { const logo = field(game, 'postseasonGameLogo', 'postseason_game_logo'); return logo.startsWith('http') ? logo : `${process.env.REACT_APP_API_URL || 'http://localhost:1313'}/images/${logo}`; })()}
                                                            sx={{ width: 40, height: 40 }}
                                                            variant="rounded"
                                                        />
                                                    </Box>
                                                )}
                                                <Box
                                                    component={opponentData?.id ? 'a' : 'div'}
                                                    href={opponentData?.id ? `/team-details/${opponentData.id}` : undefined}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1.5,
                                                        cursor: opponentData?.id ? 'pointer' : 'default',
                                                        textDecoration: 'none',
                                                        color: 'inherit',
                                                        '&:hover': opponentData?.id ? {
                                                            textDecoration: 'underline',
                                                            opacity: 0.8,
                                                        } : {},
                                                    }}
                                                    onClick={(e) => {
                                                        if (opponentData?.id) {
                                                            e.stopPropagation();
                                                            if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                                                            e.preventDefault();
                                                            navigate(`/team-details/${opponentData.id}`);
                                                        }
                                                    }}
                                                >
                                                    <Avatar
                                                        src={opponentData?.logo}
                                                        alt={opponentName}
                                                        sx={{ width: 32, height: 32 }}
                                                    >
                                                        {opponentName?.charAt(0)}
                                                    </Avatar>
                                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                        {opponentName || 'TBD'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: 'center' }}>
                                            <Chip
                                                label={home ? 'Home' : 'Away'}
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    fontWeight: 600,
                                                    borderColor: home ? 'success.main' : 'warning.main',
                                                    color: home ? 'success.main' : 'warning.main',
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={formatGameType(gameType)}
                                                size="small"
                                                color={GAME_TYPE_CHIP_COLORS[gameType] || 'default'}
                                                variant="filled"
                                            />
                                        </TableCell>
                                        <TableCell sx={{ textAlign: 'center' }}>
                                            <Chip
                                                label={result.label}
                                                size="small"
                                                color={result.color}
                                                variant={result.variant}
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : selectedTeam ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h6" color="text.secondary">
                        No schedule found for {selectedTeam.name} in Season {season}.
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h6" color="text.secondary">
                        Select a team above to view their schedule.
                    </Typography>
                </Box>
            )}
        </>
    );
};

export default TeamScheduleTable;
