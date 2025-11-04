import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Button, 
    TextField, 
    Grid, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem,
    Card,
    CardContent,
    Alert,
    CircularProgress,
    Chip,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Autocomplete,
    Pagination
} from '@mui/material';
import { 
    PlayArrow, 
    SportsEsports, 
    Timer, 
    Stop, 
    Edit,
    Refresh
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminNavigationItems } from '../../config/adminNavigation';
import { useNavigate } from 'react-router-dom';
import { 
    startGame, 
    startScrimmage, 
    startOvertimeGame,
    markAllGamesAsChewMode, 
    endAllOngoingGames,
    getFilteredGames
} from '../../api/gameApi';
import { getCurrentSeason, getCurrentWeek } from '../../api/seasonApi';
import { getAllTeams } from '../../api/teamApi';
import StyledTable from '../../components/ui/StyledTable';
import { 
    GAME_TYPES, 
    GAME_STATUSES, 
    GAME_TYPE_DESCRIPTIONS,
    GAME_STATUS_DESCRIPTIONS 
} from '../../constants/gameEnums';


const GameManagement = () => {
    const navigate = useNavigate();
    const [gameData, setGameData] = useState({
        gameType: 'OUT_OF_CONFERENCE',
        season: '',
        week: '',
        homeOffensivePlaybook: 'PRO',
        awayOffensivePlaybook: 'PRO',
        homeDefensivePlaybook: 'FOUR_THREE',
        awayDefensivePlaybook: 'FOUR_THREE'
    });


    const [filteredGames, setFilteredGames] = useState([]);
    const [loading, setLoading] = useState(false);
    const [gamesLoading, setGamesLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    // Filters for ongoing games
    const [filters, setFilters] = useState({
        season: null,
        week: null,
        gameType: null,
        gameStatus: null
    });

    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(50);
    const [totalGames, setTotalGames] = useState(0);
    const [scrimmageDialogOpen, setScrimmageDialogOpen] = useState(false);
    const [scrimmageTeams, setScrimmageTeams] = useState({
        homeTeam: '',
        awayTeam: '',
        scrimmageType: 'Standard'
    });
    const [availableTeams, setAvailableTeams] = useState([]);
    const [startGameDialogOpen, setStartGameDialogOpen] = useState(false);
    const [startGameData, setStartGameData] = useState({
        subdivision: 'FCFB',
        homeTeam: '',
        awayTeam: '',
        tvChannel: 'ABC',
        gameType: 'Out of Conference'
    });

    const navigationItems = adminNavigationItems;





    useEffect(() => {
        const setDefaults = async () => {
            try {
                const [currentSeason, currentWeek] = await Promise.all([
                    getCurrentSeason(),
                    getCurrentWeek()
                ]);
                
                
                setGameData(prev => ({
                    ...prev,
                    season: currentSeason,
                    week: currentWeek
                }));

                setFilters(prev => ({
                    ...prev,
                    season: currentSeason,
                    week: currentWeek
                }));
                
                // Load games once on mount
                setGamesLoading(true);
                try {
                    const response = await getFilteredGames({
                        filters: [],
                        season: currentSeason,
                        week: currentWeek,
                        gameType: null,
                        gameStatus: null,
                        sort: 'MOST_TIME_REMAINING',
                        page: 0,
                        size: pageSize
                    });
                    
                    const allGames = response.content || [];
                    const total = response.totalElements || allGames.length;
                    setTotalGames(total);
                    setFilteredGames(allGames);
                } catch (error) {
                    console.error('Failed to load initial games:', error);
                    setError('Failed to load games');
                } finally {
                    setGamesLoading(false);
                }
            } catch (error) {
                console.error('Failed to fetch current season/week:', error);
                // Set fallback values if API fails (same as Past Games)
                setGameData(prev => ({
                    ...prev,
                    season: 11,
                    week: 1
                }));

                setFilters(prev => ({
                    ...prev,
                    season: 11,
                    week: 1
                }));
                
                // Try to load games with fallback values
                setGamesLoading(true);
                try {
                    const response = await getFilteredGames({
                        filters: [],
                        season: 11,
                        week: 1,
                        gameType: null,
                        gameStatus: null,
                        sort: 'MOST_TIME_REMAINING',
                        page: 0,
                        size: pageSize
                    });
                    
                    const allGames = response.content || [];
                    const total = response.totalElements || allGames.length;
                    setTotalGames(total);
                    setFilteredGames(allGames);
                } catch (gamesError) {
                    console.error('Failed to load games with fallback values:', gamesError);
                    setError('Failed to load games');
                } finally {
                    setGamesLoading(false);
                }
            }
        };
        
        setDefaults();
    }, []);



    useEffect(() => {
        const loadTeams = async () => {
            try {
                const teams = await getAllTeams();
                setAvailableTeams(teams);
            } catch (error) {
                console.error('Failed to load teams:', error);
            }
        };
        
        loadTeams();
    }, []);

    

    const handleNavigationChange = (item) => {
        navigate(item.path);
    };

    // Function to refresh games with current filters (avoids infinite loops)
    const refreshGamesWithCurrentFilters = async () => {
        if (gamesLoading || !filters.season || !filters.week) return;
        
        setGamesLoading(true);
        try {
            const response = await getFilteredGames({
                filters: [],
                season: filters.season,
                week: filters.week,
                gameType: filters.gameType,
                gameStatus: filters.gameStatus,
                sort: 'MOST_TIME_REMAINING',
                page: currentPage,
                size: pageSize
            });
            
            const allGames = response.content || [];
            const total = response.totalElements || allGames.length;
            setTotalGames(total);
            setFilteredGames(allGames);
        } catch (error) {
            console.error('Failed to refresh games with filters:', error);
            setError('Failed to refresh games');
        } finally {
            setGamesLoading(false);
        }
    };



    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value === '' ? null : value
        }));
        setCurrentPage(0); // Reset to first page when filters change
        
        // Refresh games when filters change
        setTimeout(() => {
            refreshGamesWithCurrentFilters();
        }, 50);
    };





    const handleScrimmageSubmit = async () => {
        if (!scrimmageTeams.homeTeam || !scrimmageTeams.awayTeam) {
            setError('Please select both home and away teams');
            return;
        }

        if (scrimmageTeams.homeTeam === scrimmageTeams.awayTeam) {
            setError('Home and away teams must be different');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const startRequest = {
                homeTeam: scrimmageTeams.homeTeam,
                awayTeam: scrimmageTeams.awayTeam,
                gameType: 'SCRIMMAGE',
                season: parseInt(gameData.season),
                week: parseInt(gameData.week),
                homeOffensivePlaybook: gameData.homeOffensivePlaybook,
                awayOffensivePlaybook: gameData.awayOffensivePlaybook,
                homeDefensivePlaybook: gameData.homeDefensivePlaybook,
                awayDefensivePlaybook: gameData.awayDefensivePlaybook
            };

            // Check if this is an overtime scrimmage
            if (scrimmageTeams.scrimmageType === 'Overtime') {
                await startOvertimeGame(startRequest);
                setSuccess('Overtime scrimmage started successfully!');
            } else {
                await startScrimmage(startRequest);
                setSuccess('Standard scrimmage started successfully!');
            }

            setScrimmageTeams({ homeTeam: '', awayTeam: '' });
            setScrimmageDialogOpen(false);
            // No automatic refresh - user can manually refresh if needed
        } catch (error) {
            setError(`Failed to start scrimmage: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleScrimmageCancel = () => {
        setScrimmageTeams({ homeTeam: '', awayTeam: '' });
        setScrimmageDialogOpen(false);
    };



    const handleStartGameCancel = () => {
        setStartGameData({
            subdivision: 'FCFB',
            homeTeam: '',
            awayTeam: '',
            tvChannel: 'ABC',
            gameType: 'Out of Conference'
        });
        setStartGameDialogOpen(false);
    };

    const handleStartGameSubmit = async () => {
        if (!startGameData.homeTeam || !startGameData.awayTeam) {
            setError('Please select both home and away teams');
            return;
        }

        if (startGameData.homeTeam === startGameData.awayTeam) {
            setError('Home and away teams must be different');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const startRequest = {
                subdivision: startGameData.subdivision,
                homeTeam: startGameData.homeTeam,
                awayTeam: startGameData.awayTeam,
                tvChannel: startGameData.tvChannel,
                gameType: startGameData.gameType
            };

            await startGame(startRequest);
            setSuccess('Game started successfully!');
            setStartGameData({
                subdivision: 'FCFB',
                homeTeam: '',
                awayTeam: '',
                tvChannel: 'ABC',
                gameType: 'Out of Conference'
            });
            setStartGameDialogOpen(false);
            // No automatic refresh - user can manually refresh if needed
        } catch (error) {
            setError(`Failed to start game: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllAsChewMode = async () => {
        if (filteredGames.length === 0) {
            setError('No games to mark as chew mode');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await markAllGamesAsChewMode();
            setSuccess('All games marked as chew mode!');
            // No automatic refresh - user can manually refresh if needed
        } catch (error) {
            setError(`Failed to mark games as chew mode: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEndAllGames = async () => {
        if (filteredGames.length === 0) {
            setError('No games to end');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await endAllOngoingGames();
            setSuccess('All games ended successfully!');
            // No automatic refresh - user can manually refresh if needed
        } catch (error) {
            setError(`Failed to end all games: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEditGame = (game) => {
        navigate(`/admin/edit-game/${game.game_id}`);
    };



    const ongoingGameColumns = [
        { id: 'teams', label: 'Teams', width: 200 },
        { id: 'score', label: 'Score', width: 100 },
        { id: 'quarter', label: 'Quarter', width: 80 },
        { id: 'clock', label: 'Clock', width: 80 },
        { id: 'gameType', label: 'Game Type', width: 120 },
        { id: 'gameStatus', label: 'Status', width: 120 },
        { id: 'actions', label: 'Actions', width: 80 }
    ];

    const ongoingGameData = filteredGames.map(game => ({
        ...game,
        teams: `${game.awayTeam || game.away_team} @ ${game.homeTeam || game.home_team}`,
        score: `${game.awayScore || game.away_score || 0} - ${game.homeScore || game.home_score || 0}`,
        quarter: game.quarter || 1,
        clock: game.clock || game.game_clock || '00:00',
        gameType: (
            <Chip
                label={GAME_TYPE_DESCRIPTIONS[game.gameType || game.game_type] || 'Unknown'}
                size="small"
                color="primary"
                variant="outlined"
            />
        ),
        gameStatus: (
            <Chip
                label={GAME_STATUS_DESCRIPTIONS[game.gameStatus || game.game_status] || 'Unknown'}
                size="small"
                color={game.gameStatus === 'IN_PROGRESS' ? 'success' : 'default'}
                variant="outlined"
            />
        ),
        actions: (
            <Tooltip title="Edit Game">
                <IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleEditGame(game);
                    }}
                    sx={{ color: 'primary.main' }}
                >
                    <Edit fontSize="small" />
                </IconButton>
            </Tooltip>
        )
    }));

    return (
        <DashboardLayout
            title="Game Management"
            navigationItems={navigationItems}
            onNavigationChange={handleNavigationChange}
            hideHeader={true}
            textColor="primary.main"
        >
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                    Game Management
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                        {success}
                    </Alert>
                )}
                
                <Grid container spacing={4} sx={{ mb: 4 }}>
                    {/* Create New Game */}
                    <Grid item xs={12} lg={6}>
                        <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                                    Create New Game
                                </Typography>
                                
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={async () => {
                                            try {
                                                const teams = await getAllTeams();
                                                setAvailableTeams(teams);
                                                setStartGameDialogOpen(true);
                                            } catch (error) {
                                                setError(`Failed to load teams: ${error.message}`);
                                            }
                                        }}
                                        disabled={loading}
                                        startIcon={<PlayArrow />}
                                        sx={{ 
                                            backgroundColor: 'primary.main',
                                            color: 'white',
                                            '&:hover': { backgroundColor: 'primary.dark' }
                                        }}
                                    >
                                        {loading ? <CircularProgress size={20} /> : 'Start Game'}
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={async () => {
                                            try {
                                                const teams = await getAllTeams();
                                                setAvailableTeams(teams);
                                                setScrimmageDialogOpen(true);
                                            } catch (error) {
                                                setError(`Failed to load teams: ${error.message}`);
                                            }
                                        }}
                                        disabled={loading}
                                        startIcon={<SportsEsports />}
                                        sx={{ 
                                            backgroundColor: 'primary.main',
                                            color: 'white',
                                            '&:hover': { backgroundColor: 'primary.dark' }
                                        }}
                                    >
                                        {loading ? <CircularProgress size={20} /> : 'Start Scrimmage'}
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={async () => {
                                            try {
                                                const teams = await getAllTeams();
                                                setAvailableTeams(teams);
                                                setScrimmageTeams(prev => ({ ...prev, scrimmageType: 'Overtime' }));
                                                setScrimmageDialogOpen(true);
                                            } catch (error) {
                                                setError(`Failed to load teams: ${error.message}`);
                                            }
                                        }}
                                        disabled={loading}
                                        startIcon={<SportsEsports />}
                                        sx={{ 
                                            backgroundColor: 'primary.main',
                                            color: 'white',
                                            '&:hover': { backgroundColor: 'primary.dark' }
                                        }}
                                    >
                                        {loading ? <CircularProgress size={20} /> : 'Start Overtime Scrimmage'}
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Game Management Actions */}
                    <Grid item xs={12} lg={6}>
                        <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                                    Quick Actions
                                </Typography>
                                
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={async () => {
                                                if (filters.season && filters.week) {
                                                    setGamesLoading(true);
                                                    try {
                                                        const response = await getFilteredGames({
                                                            filters: [],
                                                            season: filters.season,
                                                            week: filters.week,
                                                            gameType: filters.gameType,
                                                            gameStatus: filters.gameStatus,
                                                            sort: 'MOST_TIME_REMAINING',
                                                            page: currentPage,
                                                            size: pageSize
                                                        });
                                                        
                                                        const allGames = response.content || [];
                                                        const total = response.totalElements || allGames.length;
                                                        setTotalGames(total);
                                                        setFilteredGames(allGames);
                                                    } catch (error) {
                                                        console.error('Failed to refresh games:', error);
                                                        setError('Failed to refresh games');
                                                    } finally {
                                                        setGamesLoading(false);
                                                    }
                                                }
                                            }}
                                            disabled={gamesLoading}
                                            startIcon={<Refresh />}
                                            sx={{ 
                                                backgroundColor: 'primary.main',
                                                color: 'white',
                                                '&:hover': { backgroundColor: 'primary.dark' }
                                            }}
                                        >
                                            {gamesLoading ? <CircularProgress size={20} /> : 'Refresh Games'}
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={handleMarkAllAsChewMode}
                                            disabled={loading}
                                            startIcon={<Timer />}
                                            sx={{ 
                                                backgroundColor: 'primary.main',
                                                color: 'white',
                                                '&:hover': { backgroundColor: 'primary.dark' }
                                            }}
                                        >
                                            {loading ? <CircularProgress size={20} /> : 'Put All Games in Chew Mode'}
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={handleEndAllGames}
                                            disabled={loading}
                                            startIcon={<Stop />}
                                            sx={{ 
                                                backgroundColor: 'primary.main',
                                                color: 'white',
                                                '&:hover': { backgroundColor: 'primary.dark' }
                                            }}
                                        >
                                            {loading ? <CircularProgress size={20} /> : 'End All Ongoing Games'}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Games Section */}
                        <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white', mb: 3 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                        Games ({filteredGames.length})
                                    </Typography>
                                </Box>
                                


                        {/* Filters */}
                        <Box sx={{ mb: 3 }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel sx={{ color: 'primary.main' }}>Season</InputLabel>
                                        <Select
                                            value={filters.season || ''}
                                            onChange={(e) => handleFilterChange('season', e.target.value)}
                                            sx={{ 
                                                color: 'primary.main',
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                            }}
                                        >
                                            <MenuItem value="">All Seasons</MenuItem>
                                            <MenuItem value={10}>Season 10</MenuItem>
                                            <MenuItem value={11}>Season 11</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel sx={{ color: 'primary.main' }}>Week</InputLabel>
                                        <Select
                                            value={filters.week || ''}
                                            onChange={(e) => handleFilterChange('week', e.target.value)}
                                            sx={{ 
                                                color: 'primary.main',
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                            }}
                                        >
                                            <MenuItem value="">All Weeks</MenuItem>
                                            {Array.from({ length: 15 }, (_, i) => i + 1).map(week => (
                                                <MenuItem key={week} value={week}>
                                                    Week {week}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel sx={{ color: 'primary.main' }}>Game Type</InputLabel>
                                        <Select
                                            value={filters.gameType || 'ALL'}
                                            onChange={(e) => handleFilterChange('gameType', e.target.value)}
                                            sx={{ 
                                                color: 'primary.main',
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                            }}
                                        >
                                            <MenuItem value="ALL">All Types</MenuItem>
                                            {GAME_TYPES.map(type => (
                                                <MenuItem key={type} value={type}>
                                                    {GAME_TYPE_DESCRIPTIONS[type]}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <FormControl fullWidth>
                                        <InputLabel sx={{ color: 'primary.main' }}>Game Status</InputLabel>
                                        <Select
                                            value={filters.gameStatus || 'ALL'}
                                            onChange={(e) => handleFilterChange('gameStatus', e.target.value)}
                                            sx={{ 
                                                color: 'primary.main',
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                            }}
                                        >
                                            <MenuItem value="ALL">All Statuses</MenuItem>
                                            {GAME_STATUSES.map(status => (
                                                <MenuItem key={status} value={status}>
                                                    {GAME_STATUS_DESCRIPTIONS[status]}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Box>

                        {gamesLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : filteredGames.length === 0 ? (
                            <Box sx={{ textAlign: 'center', p: 4 }}>
                                <Typography variant="h6" color="text.secondary">
                                    No games found
                                </Typography>
                            </Box>
                        ) : (
                            <>
                                <StyledTable
                                    columns={ongoingGameColumns}
                                    data={ongoingGameData}
                                    headerBackground="primary.main"
                                    headerTextColor="white"
                                />
                                
                                {/* Pagination */}
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
                                    <Typography variant="body2" sx={{ color: 'primary.main', mr: 2, alignSelf: 'center' }}>
                                        Showing {Math.min(currentPage * pageSize + 1, totalGames)} to {Math.min((currentPage + 1) * pageSize, totalGames)} of {totalGames} games
                                    </Typography>
                                    {totalGames > pageSize && (
                                        <Pagination
                                            count={Math.ceil(totalGames / pageSize)}
                                            page={currentPage + 1}
                                            onChange={(event, page) => {
                                                setCurrentPage(page - 1);
                                                // No automatic refresh - user can manually refresh if needed
                                            }}
                                            color="primary"
                                            size="large"
                                            sx={{
                                                '& .MuiPaginationItem-root': {
                                                    color: 'primary.main',
                                                    '&.Mui-selected': {
                                                        backgroundColor: 'primary.main',
                                                        color: 'white'
                                                    }
                                                }
                                            }}
                                        />
                                    )}
                                </Box>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Scrimmage Dialog */}
                <Dialog 
                    open={scrimmageDialogOpen} 
                    onClose={handleScrimmageCancel}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle sx={{ color: 'primary.main', fontWeight: 600 }}>
                        Start Scrimmage
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ pt: 2 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <Autocomplete
                                        options={availableTeams}
                                        getOptionLabel={(option) => option.name || ''}
                                        value={availableTeams.find(team => team.name === scrimmageTeams.homeTeam) || null}
                                        onChange={(event, newValue) => {
                                            setScrimmageTeams(prev => ({
                                                ...prev,
                                                homeTeam: newValue ? newValue.name : ''
                                            }));
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Home Team"
                                                fullWidth
                                                sx={{
                                                    '& .MuiInputLabel-root': { color: 'primary.main' },
                                                    '& .MuiOutlinedInput-root': { 
                                                        color: 'primary.main',
                                                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                    }
                                                }}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <Box component="li" {...props}>
                                                <Typography sx={{ color: 'primary.main' }}>
                                                    {option.name}
                                                </Typography>
                                            </Box>
                                        )}
                                        isOptionDisabled={(option) => option.name === scrimmageTeams.awayTeam}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Autocomplete
                                        options={availableTeams}
                                        getOptionLabel={(option) => option.name || ''}
                                        value={availableTeams.find(team => team.name === scrimmageTeams.awayTeam) || null}
                                        onChange={(event, newValue) => {
                                            setScrimmageTeams(prev => ({
                                                ...prev,
                                                awayTeam: newValue ? newValue.name : ''
                                            }));
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Away Team"
                                                fullWidth
                                                sx={{
                                                    '& .MuiInputLabel-root': { color: 'primary.main' },
                                                    '& .MuiOutlinedInput-root': { 
                                                        color: 'primary.main',
                                                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                    }
                                                }}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <Box component="li" {...props}>
                                                <Typography sx={{ color: 'primary.main' }}>
                                                    {option.name}
                                                </Typography>
                                            </Box>
                                        )}
                                        isOptionDisabled={(option) => option.name === scrimmageTeams.homeTeam}
                                    />
                                </Grid>

                            </Grid>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button 
                            onClick={handleScrimmageCancel}
                            sx={{ color: 'primary.main' }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleScrimmageSubmit}
                            variant="contained"
                            disabled={loading || !scrimmageTeams.homeTeam || !scrimmageTeams.awayTeam}
                            sx={{ 
                                backgroundColor: 'primary.main',
                                color: 'white',
                                '&:hover': { backgroundColor: 'primary.dark' }
                            }}
                        >
                            {loading ? <CircularProgress size={20} /> : 'Start Scrimmage'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Start Game Dialog */}
                <Dialog 
                    open={startGameDialogOpen} 
                    onClose={handleStartGameCancel}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle sx={{ color: 'primary.main', fontWeight: 600 }}>
                        Start New Game
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ pt: 2 }}>
                            <Grid container spacing={3}>
                                {/* Game Configuration */}
                                <Grid item xs={12}>
                                    <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, fontWeight: 500 }}>
                                        Game Configuration
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel sx={{ color: 'primary.main' }}>Subdivision</InputLabel>
                                        <Select
                                            value={startGameData.subdivision}
                                            onChange={(e) => setStartGameData(prev => ({
                                                ...prev,
                                                subdivision: e.target.value
                                            }))}
                                            sx={{ 
                                                color: 'primary.main',
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                            }}
                                        >
                                            <MenuItem value="FCFB">FCFB</MenuItem>
                                            <MenuItem value="FBS">FBS</MenuItem>
                                            <MenuItem value="FCS">FCS</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel sx={{ color: 'primary.main' }}>Game Type</InputLabel>
                                        <Select
                                            value={startGameData.gameType}
                                            onChange={(e) => setStartGameData(prev => ({
                                                ...prev,
                                                gameType: e.target.value
                                            }))}
                                            sx={{ 
                                                color: 'primary.main',
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                            }}
                                        >
                                            <MenuItem value="Out of Conference">Out of Conference</MenuItem>
                                            <MenuItem value="Conference Game">Conference Game</MenuItem>
                                            <MenuItem value="Conference Championship">Conference Championship</MenuItem>
                                            <MenuItem value="Bowl Game">Bowl Game</MenuItem>
                                            <MenuItem value="Playoff Game">Playoff Game</MenuItem>
                                            <MenuItem value="National Championship">National Championship</MenuItem>
                                            <MenuItem value="Scrimmage">Scrimmage</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel sx={{ color: 'primary.main' }}>TV Channel</InputLabel>
                                        <Select
                                            value={startGameData.tvChannel}
                                            onChange={(e) => setStartGameData(prev => ({
                                                ...prev,
                                                tvChannel: e.target.value
                                            }))}
                                            sx={{ 
                                                color: 'primary.main',
                                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                            }}
                                        >
                                            <MenuItem value="ABC">ABC</MenuItem>
                                            <MenuItem value="CBS">CBS</MenuItem>
                                            <MenuItem value="ESPN">ESPN</MenuItem>
                                            <MenuItem value="ESPN2">ESPN2</MenuItem>
                                            <MenuItem value="FOX">FOX</MenuItem>
                                            <MenuItem value="FS1">FS1</MenuItem>
                                            <MenuItem value="FS2">FS2</MenuItem>
                                            <MenuItem value="NBC">NBC</MenuItem>
                                            <MenuItem value="ACC Network">ACC Network</MenuItem>
                                            <MenuItem value="Big Ten Network">Big Ten Network</MenuItem>
                                            <MenuItem value="CBS Sports Network">CBS Sports Network</MenuItem>
                                            <MenuItem value="The CW">The CW</MenuItem>
                                            <MenuItem value="ESPNU">ESPNU</MenuItem>
                                            <MenuItem value="ESPN+">ESPN+</MenuItem>
                                            <MenuItem value="SEC Network">SEC Network</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                
                                {/* Team Selection */}
                                <Grid item xs={12}>
                                    <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, fontWeight: 500, mt: 2 }}>
                                        Team Selection
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Autocomplete
                                        options={availableTeams}
                                        getOptionLabel={(option) => option.name || ''}
                                        value={availableTeams.find(team => team.name === startGameData.homeTeam) || null}
                                        onChange={(event, newValue) => {
                                            setStartGameData(prev => ({
                                                ...prev,
                                                homeTeam: newValue ? newValue.name : ''
                                            }));
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Home Team"
                                                fullWidth
                                                sx={{
                                                    '& .MuiInputLabel-root': { color: 'primary.main' },
                                                    '& .MuiOutlinedInput-root': { 
                                                        color: 'primary.main',
                                                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                    }
                                                }}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <Box component="li" {...props}>
                                                <Typography sx={{ color: 'primary.main' }}>
                                                    {option.name}
                                                </Typography>
                                            </Box>
                                        )}
                                        isOptionDisabled={(option) => option.name === startGameData.awayTeam}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Autocomplete
                                        options={availableTeams}
                                        getOptionLabel={(option) => option.name || ''}
                                        value={availableTeams.find(team => team.name === startGameData.awayTeam) || null}
                                        onChange={(event, newValue) => {
                                            setStartGameData(prev => ({
                                                ...prev,
                                                awayTeam: newValue ? newValue.name : ''
                                            }));
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Away Team"
                                                fullWidth
                                                sx={{
                                                    '& .MuiInputLabel-root': { color: 'primary.main' },
                                                    '& .MuiOutlinedInput-root': { 
                                                        color: 'primary.main',
                                                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                    }
                                                }}
                                            />
                                        )}
                                        renderOption={(props, option) => (
                                            <Box component="li" {...props}>
                                                <Typography sx={{ color: 'primary.main' }}>
                                                    {option.name}
                                                </Typography>
                                            </Box>
                                        )}
                                        isOptionDisabled={(option) => option.name === startGameData.awayTeam}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button 
                            onClick={handleStartGameCancel}
                            sx={{ color: 'primary.main' }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleStartGameSubmit}
                            variant="contained"
                            disabled={loading || !startGameData.homeTeam || !startGameData.awayTeam}
                            sx={{ 
                                backgroundColor: 'primary.main',
                                color: 'white',
                                '&:hover': { backgroundColor: 'primary.dark' }
                            }}
                        >
                            {loading ? <CircularProgress size={20} /> : 'Start Game'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </DashboardLayout>
    );
};

export default GameManagement;
