import React, { useMemo } from 'react';
import {
    Box,
    Typography,
    Button,
    Autocomplete,
    TextField,
    Avatar,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tooltip,
    CircularProgress,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    SwapHoriz as SwapIcon,
} from '@mui/icons-material';
import StyledCard from '../ui/StyledCard';
import { formatGameType, formatConference } from '../../utils/formatText';
import { field } from '../../utils/fieldHelper';

const TOTAL_WEEKS = 12;
const DEFAULT_OOC_GAMES = 3;

const OOCScheduleAdminTab = ({
    allTeams,
    selectedOOCTeam,
    onOOCTeamChange,
    oocFullSchedule,
    oocLoading,
    scheduleLocked,
    teamMap,
    onAddOOCGame,
    onAddOOCGameForWeek,
    onMoveGame,
    onDeleteGame,
}) => {
    // OOC games only (for counting)
    const oocGamesOnly = useMemo(() =>
        oocFullSchedule.filter(g => field(g, 'gameType', 'game_type') === 'OUT_OF_CONFERENCE'),
        [oocFullSchedule]
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, alignItems: 'center' }}>
                <Autocomplete
                    options={allTeams.filter(t => t.active)}
                    getOptionLabel={(option) => option.name || ''}
                    value={selectedOOCTeam}
                    onChange={(_, newValue) => onOOCTeamChange(newValue)}
                    renderInput={(params) => (
                        <TextField {...params} label="Select Team" variant="outlined" size="small" />
                    )}
                    renderOption={(props, option) => {
                        const { key, ...otherProps } = props;
                        return (
                            <Box component="li" key={key} {...otherProps} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar src={option.logo} sx={{ width: 24, height: 24 }}>{option.name?.charAt(0)}</Avatar>
                                <Typography variant="body2">{option.name}</Typography>
                            </Box>
                        );
                    }}
                    sx={{ minWidth: 300 }}
                    isOptionEqualToValue={(option, value) => option.name === value?.name}
                />
                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={onAddOOCGame}
                    disabled={!selectedOOCTeam || scheduleLocked}
                >
                    Add OOC Game
                </Button>
            </Box>

            {selectedOOCTeam && (
                <StyledCard hover={false}>
                    <Box sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Avatar src={selectedOOCTeam.logo} sx={{ width: 40, height: 40 }}>
                                {selectedOOCTeam.name?.charAt(0)}
                            </Avatar>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                    {selectedOOCTeam.name} — Full Schedule
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Conference: {formatConference(selectedOOCTeam.conference)} | OOC Games: {oocGamesOnly.length}/{DEFAULT_OOC_GAMES}
                                </Typography>
                            </Box>
                        </Box>

                        {oocLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700 }}>Week</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Home/Away</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Opponent</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                                            <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {Array.from({ length: TOTAL_WEEKS }, (_, i) => {
                                            const weekNum = i + 1;
                                            const game = oocFullSchedule.find(g => g.week === weekNum);
                                            if (!game) {
                                                return (
                                                    <TableRow key={weekNum} sx={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>Week {weekNum}</Typography>
                                                        </TableCell>
                                                        <TableCell colSpan={3}>
                                                            <Chip label="OPEN" size="small" variant="outlined" color="info" />
                                                        </TableCell>
                                                        <TableCell sx={{ textAlign: 'center' }}>
                                                            <Tooltip title="Add OOC game for this week">
                                                                <IconButton
                                                                    size="small"
                                                                    color="primary"
                                                                    onClick={() => onAddOOCGameForWeek(weekNum)}
                                                                    disabled={scheduleLocked}
                                                                >
                                                                    <AddIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            }
                                            const home = field(game, 'homeTeam', 'home_team');
                                            const away = field(game, 'awayTeam', 'away_team');
                                            const isHome = home === selectedOOCTeam.name;
                                            const opponent = isHome ? away : home;
                                            const oppData = teamMap[opponent];
                                            const gameType = field(game, 'gameType', 'game_type');
                                            const isOOC = gameType === 'OUT_OF_CONFERENCE';

                                            return (
                                                <TableRow
                                                    key={weekNum}
                                                    hover
                                                    sx={{
                                                        backgroundColor: isOOC ? 'rgba(156, 39, 176, 0.04)' : 'transparent',
                                                    }}
                                                >
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Week {game.week}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={isHome ? 'Home' : 'Away'}
                                                            size="small"
                                                            variant="outlined"
                                                            color={isHome ? 'success' : 'warning'}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Avatar src={oppData?.logo} sx={{ width: 24, height: 24 }}>
                                                                {opponent?.charAt(0)}
                                                            </Avatar>
                                                            <Typography variant="body2">{opponent}</Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={formatGameType(gameType)}
                                                            size="small"
                                                            color={isOOC ? 'secondary' : 'primary'}
                                                            variant={isOOC ? 'filled' : 'outlined'}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>
                                                        {isOOC ? (
                                                            <>
                                                                <Tooltip title="Move game">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => onMoveGame(game)}
                                                                        disabled={scheduleLocked}
                                                                    >
                                                                        <SwapIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Remove game">
                                                                    <IconButton
                                                                        size="small"
                                                                        color="error"
                                                                        onClick={() => onDeleteGame(game.id)}
                                                                        disabled={scheduleLocked}
                                                                    >
                                                                        <DeleteIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </>
                                                        ) : (
                                                            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                                                Conf
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>
                </StyledCard>
            )}
        </Box>
    );
};

export default OOCScheduleAdminTab;
