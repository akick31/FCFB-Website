import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    useTheme,
    useMediaQuery,
    Pagination,
    CircularProgress,
    Alert,
    IconButton,
    Drawer,
    Fab,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import { FilterList, Close } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import FilterMenu from '../../menu/FilterMenu';
import { getTeamByName } from '../../../api/teamApi';
import { 
    formatScoreboardStatus, 
    getStatusColor, 
    formatScoreboardQuarter, 
    formatDownAndDistance, 
    formatPossession, 
    formatBallLocation, 
    formatWaitingOn,
    formatGameType
} from '../../../utils/gameUtils';

const GameList = ({ 
    games, 
    loading, 
    error, 
    currentPage, 
    totalPages, 
    onPageChange,
    title = "Games",
    filters,
    setFilters
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const [filterMenuOpen, setFilterMenuOpen] = useState(false);
    const [teamsData, setTeamsData] = useState({});
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Check if this is showing past games
    const isPastGames = title === "Past Games" || title === "Scrimmages";

    // Fetch team data for logos
    useEffect(() => {
        const fetchTeamData = async () => {
            if (!games || games.length === 0) return;
            
            const teamNames = new Set();
            games.forEach(game => {
                if (game.awayTeam || game.away_team) teamNames.add(game.awayTeam || game.away_team);
                if (game.homeTeam || game.home_team) teamNames.add(game.homeTeam || game.home_team);
            });

            // Only fetch teams we don't already have
            const teamsToFetch = Array.from(teamNames).filter(teamName => !teamsData[teamName]);
            
            if (teamsToFetch.length === 0) return;

            const teams = {};
            try {
                // Fetch all teams in parallel for better performance
                const teamPromises = teamsToFetch.map(async (teamName) => {
                    try {
                        const response = await getTeamByName(teamName);
                        return { teamName, data: response };
                    } catch (err) {
                        console.warn(`Failed to fetch team data for ${teamName}:`, err);
                        return { teamName, data: null };
                    }
                });

                const results = await Promise.all(teamPromises);
                
                results.forEach(({ teamName, data }) => {
                    if (data) {
                        teams[teamName] = data;
                    }
                });

                if (Object.keys(teams).length > 0) {
                    setTeamsData(prev => ({ ...prev, ...teams }));
                }
            } catch (err) {
                console.error('Error fetching team data:', err);
            }
        };

        fetchTeamData();
    }, [games, teamsData]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        );
    }

    // Don't render until team logos are loaded
    if (Object.keys(teamsData).length === 0 && games.length > 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading team logos...</Typography>
            </Box>
        );
    }

    if (!games || games.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', p: 4 }}>
                <Typography variant="h6" color="text.secondary">
                    No games found
                </Typography>
            </Box>
        );
    }

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handleFilterApply = () => {
        setFilterMenuOpen(false);
    };

    const handleRowClick = (game) => {
        console.log('Row clicked:', game);
        console.log('Game object keys:', Object.keys(game));
        console.log('Game ID field:', game.gameId);
        console.log('Game id field:', game.id);
        console.log('Game _id field:', game._id);
        
        const gameId = game.gameId || game.id || game._id;
        console.log('Final Game ID:', gameId);
        
        if (gameId) {
            console.log('Navigating to:', `/game-details/${gameId}`);
            try {
                navigate(`/game-details/${gameId}`);
                console.log('Navigation called successfully');
            } catch (error) {
                console.error('Navigation error:', error);
            }
        } else {
            console.warn('No game ID found:', game);
            console.warn('Available fields:', Object.keys(game));
        }
    };

    const handleRowsPerPageChange = (event) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        setRowsPerPage(newRowsPerPage);
        setFilters(prev => ({ ...prev, size: newRowsPerPage, page: 0 }));
    };

    return (
        <Box>
            {/* Header with Filter Button and Rows Per Page */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 3 
            }}>
                <Box>
                    <Typography variant="h5" sx={{ 
                        fontWeight: 600, 
                        color: theme.palette.primary.main,
                        mb: 1
                    }}>
                        {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {games.length} game{games.length !== 1 ? 's' : ''} found
                    </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Rows Per Page Selector */}
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Rows</InputLabel>
                        <Select
                            value={rowsPerPage}
                            label="Rows"
                            onChange={handleRowsPerPageChange}
                        >
                            <MenuItem value={5}>5</MenuItem>
                            <MenuItem value={10}>10</MenuItem>
                            <MenuItem value={25}>25</MenuItem>
                            <MenuItem value={50}>50</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Filter Button */}
                    <Fab
                        size="small"
                        color="primary"
                        onClick={() => setFilterMenuOpen(true)}
                        sx={{ boxShadow: theme.shadows[2] }}
                    >
                        <FilterList />
                    </Fab>
                </Box>
            </Box>

            {/* Compact Games List */}
            <Box sx={{ 
                backgroundColor: '#f8f9fa',
                borderRadius: 2,
                border: '1px solid #e9ecef',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                {/* Header Row */}
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: isPastGames ? '2.5fr 1fr 1fr' : '2.5fr 1fr 0.8fr 0.8fr 1.2fr 0.8fr 1fr 1fr 1fr',
                    gap: 1,
                    p: 1.5,
                    backgroundColor: theme.palette.primary.main,
                    color: 'white'
                }}>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>Team Matchup</Typography>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, textAlign: 'center' }}>Score</Typography>
                    {!isPastGames && (
                        <>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, textAlign: 'center' }}>Quarter</Typography>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, textAlign: 'center' }}>Time</Typography>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, textAlign: 'center' }}>Down & Distance</Typography>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, textAlign: 'center' }}>Possession</Typography>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, textAlign: 'center' }}>Ball Location</Typography>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, textAlign: 'center' }}>Waiting On</Typography>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, textAlign: 'center' }}>Status</Typography>
                        </>
                    )}
                    {isPastGames && (
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, textAlign: 'center' }}>Game Type</Typography>
                    )}
                </Box>

                {/* Game Rows */}
                {games.map((game, index) => {
                    const awayTeamName = game.awayTeam || game.away_team;
                    const homeTeamName = game.homeTeam || game.home_team;
                    const awayTeamData = teamsData[awayTeamName];
                    const homeTeamData = teamsData[homeTeamName];
                    const gameStatus = game.game_status;
                    const isOngoing = gameStatus === 'IN_PROGRESS' || 
                                    gameStatus === 'HALFTIME' || 
                                    gameStatus === 'OVERTIME' ||
                                    gameStatus === 'OPENING_KICKOFF';
                    
                    return (
                        <Box
                            key={game.gameId || game.id}
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: isPastGames ? '2.5fr 1fr 1fr' : '2.5fr 1fr 0.8fr 0.8fr 1.2fr 0.8fr 1fr 1fr 1fr',
                                gap: 1,
                                p: 1.5,
                                borderBottom: index < games.length - 1 ? '1px solid #e9ecef' : 'none',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.light + '20'
                                }
                            }}
                            onClick={() => handleRowClick(game)}
                        >
                            {/* Team Matchup Column */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {/* Home Team */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Box sx={{
                                        width: 24,
                                        height: 24,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}>
                                        {homeTeamData?.logo ? (
                                            <img 
                                                src={homeTeamData.logo} 
                                                alt="Home Team"
                                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                            />
                                        ) : (
                                            <Typography sx={{
                                                color: theme.palette.primary.main,
                                                fontSize: '0.75rem',
                                                fontWeight: 600
                                            }}>
                                                {homeTeamName?.charAt(0) || 'H'}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Typography sx={{
                                        color: 'text.primary',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {homeTeamName}
                                    </Typography>
                                </Box>

                                <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', mx: 0.5 }}>vs</Typography>

                                {/* Away Team */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Box sx={{
                                        width: 24,
                                        height: 24,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}>
                                        {awayTeamData?.logo ? (
                                            <img 
                                                src={awayTeamData.logo} 
                                                alt="Away Team"
                                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        />
                                        ) : (
                                            <Typography sx={{
                                                color: theme.palette.primary.main,
                                                fontSize: '0.75rem',
                                                fontWeight: 600
                                            }}>
                                                {awayTeamName?.charAt(0) || 'A'}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Typography sx={{
                                        color: 'text.primary',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {awayTeamName}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Score Column */}
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                gap: 0.5
                            }}>
                                <Typography sx={{
                                    color: 'text.primary',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    minWidth: 20,
                                    textAlign: 'center'
                                }}>
                                    {game.awayScore || game.away_score || 0}
                                </Typography>
                                <Typography sx={{
                                    color: 'text.secondary',
                                    fontSize: '0.8rem'
                                }}>
                                    -
                                </Typography>
                                <Typography sx={{
                                    color: 'text.primary',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    minWidth: 20,
                                    textAlign: 'center'
                                }}>
                                    {game.homeScore || game.home_score || 0}
                                </Typography>
                            </Box>

                            {/* For Past Games: Show Game Type */}
                            {isPastGames && (
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center' 
                                }}>
                                    <Typography sx={{
                                        color: 'text.primary',
                                        fontSize: '0.8rem',
                                        fontWeight: 500
                                    }}>
                                        {formatGameType(game.gameType || game.game_type)}
                                    </Typography>
                                </Box>
                            )}

                            {/* For Live Games: Show all the detailed columns */}
                            {!isPastGames && (
                                <>
                            {/* Quarter Column */}
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center' 
                            }}>
                                <Typography sx={{
                                    color: 'text.primary',
                                    fontSize: '0.8rem',
                                    fontWeight: 500
                                }}>
                                    {isOngoing ? 
                                        formatScoreboardQuarter(game.quarter) : 
                                        'Final'
                                    }
                                </Typography>
                            </Box>

                            {/* Time Column */}
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center' 
                            }}>
                                <Typography sx={{
                                    color: 'text.primary',
                                    fontSize: '0.8rem',
                                    fontWeight: 500
                                }}>
                                    {isOngoing ? 
                                        (game.clock || game.game_clock || '00:00') : 
                                        '--'
                                    }
                                </Typography>
                            </Box>

                            {/* Down & Distance Column */}
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center' 
                            }}>
                                <Typography sx={{
                                    color: 'text.primary',
                                    fontSize: '0.8rem',
                                    fontWeight: 500
                                }}>
                                    {isOngoing && game.down ? 
                                        formatDownAndDistance(game.down, game.yards_to_go || game.yardsToGo || 0) : 
                                        '--'
                                    }
                                </Typography>
                            </Box>

                            {/* Possession Column */}
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center' 
                            }}>
                                {isOngoing && game.possession ? (
                                    <Box sx={{
                                        width: 20,
                                        height: 20,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}>
                                        {game.possession === 'HOME' ? (
                                            homeTeamData?.logo ? (
                                                <img 
                                                    src={homeTeamData.logo} 
                                                    alt="Home Team"
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                />
                                            ) : (
                                                <Typography sx={{
                                                    color: theme.palette.primary.main,
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600
                                                }}>
                                                    H
                                                </Typography>
                                            )
                                        ) : game.possession === 'AWAY' ? (
                                            awayTeamData?.logo ? (
                                                <img 
                                                    src={awayTeamData.logo} 
                                                    alt="Away Team"
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                />
                                            ) : (
                                                <Typography sx={{
                                                    color: theme.palette.primary.main,
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600
                                                }}>
                                                    A
                                                </Typography>
                                            )
                                        ) : null}
                                    </Box>
                                ) : (
                                    <Typography sx={{
                                        color: 'text.primary',
                                        fontSize: '0.8rem',
                                        fontWeight: 500
                                    }}>
                                        --
                                    </Typography>
                                )}
                            </Box>

                            {/* Ball Location Column */}
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center' 
                            }}>
                                {isOngoing && game.ball_location ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        {/* Team Abbreviation and Yard Line */}
                                        <Typography sx={{
                                            color: theme.palette.primary.main,
                                            fontSize: '0.7rem',
                                            fontWeight: 600,
                                            minWidth: '20px',
                                            textAlign: 'center'
                                        }}>
                                            {(() => {
                                                const ballLocation = parseInt(game.ball_location);
                                                const possession = game.possession;
                                                
                                                if (ballLocation === 50) {
                                                    return '50';
                                                }
                                                
                                                if (ballLocation < 50) {
                                                    // Ball is on the home team's side
                                                    if (possession === 'HOME') {
                                                        return (homeTeamData?.abbreviation || homeTeamName?.substring(0, 3) || 'H') + ' ' + ballLocation;
                                                    } else if (possession === 'AWAY') {
                                                        return (awayTeamData?.abbreviation || awayTeamName?.substring(0, 3) || 'A') + ' ' + ballLocation;
                                                    }
                                                }
                                                
                                                if (ballLocation > 50) {
                                                    // Ball is on the away team's side, convert to yards from their end zone
                                                    const convertedYards = 100 - ballLocation;
                                                    if (possession === 'HOME') {
                                                        return (awayTeamData?.abbreviation || awayTeamName?.substring(0, 3) || 'A') + ' ' + convertedYards;
                                                    } else if (possession === 'AWAY') {
                                                        return (homeTeamData?.abbreviation || homeTeamName?.substring(0, 3) || 'H') + ' ' + convertedYards;
                                                    }
                                                }
                                                
                                                return '? ' + ballLocation;
                                            })()}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Typography sx={{
                                        color: 'text.primary',
                                        fontSize: '0.8rem',
                                        fontWeight: 500
                                    }}>
                                        --
                                    </Typography>
                                )}
                            </Box>

                            {/* Waiting On Column */}
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center' 
                            }}>
                                {isOngoing && game.waiting_on ? (
                                    <Box sx={{
                                        width: 20,
                                        height: 20,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}>
                                        {game.waiting_on === 'HOME' ? (
                                            homeTeamData?.logo ? (
                                                <img 
                                                    src={homeTeamData.logo} 
                                                    alt="Home Team"
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                />
                                            ) : (
                                                <Typography sx={{
                                                    color: theme.palette.primary.main,
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600
                                                }}>
                                                    H
                                                </Typography>
                                            )
                                        ) : game.waiting_on === 'AWAY' ? (
                                            awayTeamData?.logo ? (
                                                <img 
                                                    src={awayTeamData.logo} 
                                                    alt="Away Team"
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                />
                                            ) : (
                                                <Typography sx={{
                                                    color: theme.palette.primary.main,
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600
                                                }}>
                                                    A
                                                </Typography>
                                            )
                                        ) : (
                                            <Typography sx={{
                                                color: 'text.primary',
                                                fontSize: '0.7rem',
                                                fontWeight: 500
                                            }}>
                                                {game.waiting_on}
                                            </Typography>
                                        )
                                    }</Box>
                                ) : (
                                    <Typography sx={{
                                        color: 'text.primary',
                                        fontSize: '0.8rem',
                                        fontWeight: 500
                                    }}>
                                        --
                                    </Typography>
                                )}
                            </Box>

                            {/* Game Status Column */}
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center' 
                            }}>
                                <Box sx={{
                                    backgroundColor: getStatusColor(gameStatus),
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: 1,
                                    minWidth: 60
                                }}>
                                    <Typography sx={{
                                        color: 'white',
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        textAlign: 'center',
                                        textTransform: 'uppercase'
                                    }}>
                                        {formatScoreboardStatus(gameStatus)}
                                    </Typography>
                                </Box>
                            </Box>
                            </>
                            )}
                        </Box>
                    );
                })}
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                        count={totalPages}
                        page={currentPage + 1}
                        onChange={(event, page) => onPageChange(page - 1)}
                        color="primary"
                        size={isMobile ? 'small' : 'medium'}
                    />
                </Box>
            )}

            {/* Filter Menu Drawer */}
            <Drawer
                anchor="right"
                open={filterMenuOpen}
                onClose={() => setFilterMenuOpen(false)}
                PaperProps={{
                    sx: { width: isMobile ? '100%' : 320 }
                }}
            >
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">Filters</Typography>
                        <IconButton onClick={() => setFilterMenuOpen(false)}>
                            <Close />
                        </IconButton>
                    </Box>
                </Box>
                <FilterMenu
                    onChange={handleFilterChange}
                    onApply={handleFilterApply}
                    category={title.toLowerCase().replace(' ', '')}
                />
            </Drawer>
        </Box>
    );
};

GameList.propTypes = {
    games: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    error: PropTypes.string,
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    title: PropTypes.string,
    filters: PropTypes.object,
    setFilters: PropTypes.func
};

export default GameList; 