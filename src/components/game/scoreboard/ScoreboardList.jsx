import React from 'react';
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
import { useTeamData } from './hooks/useTeamData';
import { useGameFilters } from './hooks/useGameFilters';
import { useGamePagination } from './hooks/useGamePagination';
import { 
    formatBallLocationWithTeam,
    formatPossessionWithLogo,
    formatWaitingOnWithLogo,
    getGameStatusInfo,
    isGameOngoing
} from './utils/scoreboardFormatters';
import { 
    formatScoreboardQuarter, 
    formatDownAndDistance, 
    formatGameType
} from '../../../utils/gameUtils';
import { SCOREBOARD_CONSTANTS } from './utils/scoreboardConstants';

const ScoreboardList = ({ 
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
    
    // Use custom hooks for better organization
    const { teamsData, loading: teamsLoading } = useTeamData(games);
    const { filterMenuOpen, handleFilterChange, handleFilterApply, openFilterMenu, closeFilterMenu } = useGameFilters(filters, setFilters);
    const { rowsPerPage, handleRowsPerPageChange } = useGamePagination(SCOREBOARD_CONSTANTS.DEFAULT_ROWS_PER_PAGE);

    // Check if this is showing past games
    const isPastGames = title === "Past Games" || title === "Scrimmages";

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
    if (teamsLoading && games.length > 0) {
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



    const handleRowsPerPageChangeLocal = (event) => {
        const newRowsPerPage = handleRowsPerPageChange(event);
        setFilters(prev => ({ ...prev, size: newRowsPerPage, page: 0 }));
    };

    const handleRowClick = (game) => {
        const gameId = game.game_id;
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
                            onChange={handleRowsPerPageChangeLocal}
                        >
                            {SCOREBOARD_CONSTANTS.ROWS_PER_PAGE_OPTIONS.map(option => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Filter Button */}
                    <Fab
                        size="small"
                        color="primary"
                        onClick={openFilterMenu}
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
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                overflowX: 'auto', // Enable horizontal scrolling
                '&::-webkit-scrollbar': { 
                    height: '8px',
                    backgroundColor: '#f1f1f1'
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#c1c1c1',
                    borderRadius: '4px'
                },
                '&::-webkit-scrollbar-thumb:hover': {
                    backgroundColor: '#a8a8a8'
                }
            }}>
                {/* Header Row */}
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: isPastGames ? SCOREBOARD_CONSTANTS.GRID_COLUMNS.PAST_GAMES : SCOREBOARD_CONSTANTS.GRID_COLUMNS.LIVE_GAMES,
                    gap: 1,
                    p: 1.5,
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    minWidth: isPastGames ? '400px' : '800px' // Match the minimum width of game rows
                }}>
                    {SCOREBOARD_CONSTANTS.COLUMN_HEADERS[isPastGames ? 'PAST_GAMES' : 'LIVE_GAMES'].map((header, index) => (
                        <Typography key={index} sx={{ fontSize: '0.875rem', fontWeight: 600, textAlign: 'center' }}>
                            {header}
                        </Typography>
                    ))}
                </Box>

                {/* Game Rows */}
                {games.map((game, index) => {
                    const awayTeamName = game.awayTeam || game.away_team;
                    const homeTeamName = game.homeTeam || game.home_team;
                    const awayTeamData = teamsData[awayTeamName];
                    const homeTeamData = teamsData[homeTeamName];
                    const gameStatus = game.game_status;
                    const isOngoing = isGameOngoing(gameStatus);
                    
                    return (
                        <Box
                            key={game.gameId || game.id}
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: isPastGames ? SCOREBOARD_CONSTANTS.GRID_COLUMNS.PAST_GAMES : SCOREBOARD_CONSTANTS.GRID_COLUMNS.LIVE_GAMES,
                                gap: 1,
                                p: 1.5,
                                borderBottom: index < games.length - 1 ? '1px solid #e9ecef' : 'none',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                                minWidth: isPastGames ? '400px' : '800px', // Minimum width to prevent squishing
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
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
                                        {/* Home Team Ranking */}
                                        {homeTeamData?.coaches_poll_ranking && homeTeamData.coaches_poll_ranking > 0 && (
                                            <Typography sx={{
                                                color: 'warning.main',
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                                backgroundColor: 'warning.light',
                                                color: 'warning.contrastText',
                                                px: 0.5,
                                                py: 0.1,
                                                borderRadius: 1,
                                                minWidth: 16,
                                                textAlign: 'center'
                                            }}>
                                                #{homeTeamData.coaches_poll_ranking}
                                            </Typography>
                                        )}
                                    </Box>
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
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
                                        {/* Away Team Ranking */}
                                        {awayTeamData?.coaches_poll_ranking && awayTeamData.coaches_poll_ranking > 0 && (
                                            <Typography sx={{
                                                color: 'warning.main',
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                                backgroundColor: 'warning.light',
                                                color: 'warning.contrastText',
                                                px: 0.5,
                                                py: 0.1,
                                                borderRadius: 1,
                                                minWidth: 16,
                                                textAlign: 'center'
                                            }}>
                                                #{awayTeamData.coaches_poll_ranking}
                                            </Typography>
                                            )}
                                    </Box>
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
                                    {game.homeScore || game.home_score || 0}
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
                                    {game.awayScore || game.away_score || 0}
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
                                    (() => {
                                        const logoUrl = formatPossessionWithLogo(game.possession, homeTeamData, awayTeamData);
                                        if (logoUrl && logoUrl !== 'H' && logoUrl !== 'A') {
                                            return (
                                                <Box sx={{
                                                    width: 20,
                                                    height: 20,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    overflow: 'hidden'
                                                }}>
                                                    <img 
                                                        src={logoUrl} 
                                                        alt="Team Logo"
                                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                    />
                                                </Box>
                                            );
                                        } else {
                                            return (
                                                <Typography sx={{
                                                    color: theme.palette.primary.main,
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600
                                                }}>
                                                    {logoUrl}
                                                </Typography>
                                            );
                                        }
                                    })()
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
                                <Typography sx={{
                                    color: 'text.primary',
                                    fontSize: '0.8rem',
                                    fontWeight: 500
                                }}>
                                    {isOngoing ? 
                                        formatBallLocationWithTeam(
                                            game.ball_location, 
                                            game.possession, 
                                            homeTeamName, 
                                            awayTeamName, 
                                            homeTeamData, 
                                            awayTeamData
                                        ) : 
                                        '--'
                                    }
                                </Typography>
                            </Box>

                            {/* Waiting On Column */}
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center' 
                            }}>
                                {isOngoing && game.waiting_on ? (
                                    (() => {
                                        const logoUrl = formatWaitingOnWithLogo(game.waiting_on, homeTeamName, awayTeamName, homeTeamData, awayTeamData);
                                        if (logoUrl && logoUrl !== 'H' && logoUrl !== 'A') {
                                            return (
                                                <Box sx={{
                                                    width: 20,
                                                    height: 20,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    overflow: 'hidden'
                                                }}>
                                                    <img 
                                                        src={logoUrl} 
                                                        alt="Team Logo"
                                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                    />
                                                </Box>
                                            );
                                        } else {
                                            return (
                                                <Typography sx={{
                                                    color: theme.palette.primary.main,
                                                    fontSize: '0.7rem',
                                                    fontWeight: 600
                                                }}>
                                                    {logoUrl}
                                                </Typography>
                                            );
                                        }
                                    })()
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
                                    backgroundColor: getGameStatusInfo(gameStatus).color,
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
                                        {getGameStatusInfo(gameStatus).status}
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
                onClose={closeFilterMenu}
                PaperProps={{
                    sx: { width: isMobile ? '100%' : 320 }
                }}
            >
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">Filters</Typography>
                        <IconButton onClick={closeFilterMenu}>
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

ScoreboardList.propTypes = {
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

export default ScoreboardList; 