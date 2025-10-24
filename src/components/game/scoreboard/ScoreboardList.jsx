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
    totalGames,
    onPageChange,
    title = "Games",
    filters,
    setFilters,
    seasonFilter,
    weekFilter
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    
    // Use custom hooks for better organization
    const { teamsData, loading: teamsLoading } = useTeamData(games);
    const { filterMenuOpen, handleFilterApply, openFilterMenu, closeFilterMenu } = useGameFilters(filters, setFilters);
    const { rowsPerPage, handleRowsPerPageChange } = useGamePagination(SCOREBOARD_CONSTANTS.DEFAULT_ROWS_PER_PAGE);

    // Check if this is showing past games
    const isPastGames = title === "Past Games" || title === "Scrimmages";

    // Get responsive column definitions
    const getGridColumns = () => {
        const size = isSmallScreen ? 'small' : 'large';
        return isPastGames 
            ? SCOREBOARD_CONSTANTS.GRID_COLUMNS.PAST_GAMES[size]
            : SCOREBOARD_CONSTANTS.GRID_COLUMNS.LIVE_GAMES[size];
    };

    // Get responsive minimum widths
    const getMinWidth = () => {
        if (isPastGames) {
            return isSmallScreen ? '450px' : '1500px';
        } else {
            return isSmallScreen ? '705px' : '1605px'; // Adjusted width to cover all columns without extending too far
        }
    };

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

    // Note: We don't return early here anymore - we'll show the header with filters even when no games are found



    const handleRowsPerPageChangeLocal = (event) => {
        const newRowsPerPage = handleRowsPerPageChange(event);
        setFilters(prev => ({ ...prev, size: newRowsPerPage, page: 0 }));
    };

    const handleRowClick = (game) => {
        const gameId = game.game_id;
        
        if (gameId) {
            try {
                navigate(`/game-details/${gameId}`);
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
            {/* Header with Title, Games Count, Season/Week Filters, and Controls */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start', 
                mb: 3 
            }}>
                <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                        <Typography variant="h5" sx={{ 
                            fontWeight: 600, 
                            color: theme.palette.primary.main
                        }}>
                            {title}
                        </Typography>
                        
                        {/* Season and Week Filters - only show if provided */}
                        {seasonFilter && (
                            <Box sx={{ minWidth: 150 }}>
                                {seasonFilter}
                            </Box>
                        )}
                        {weekFilter && (
                            <Box sx={{ minWidth: 150 }}>
                                {weekFilter}
                            </Box>
                        )}
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                        {totalGames} game{totalGames !== 1 ? 's' : ''} found
                    </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
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

            {/* Games List or No Games Message */}
            {(!games || games.length === 0) ? (
                <Box sx={{ 
                    textAlign: 'center', 
                    p: 4,
                    backgroundColor: '#f8f9fa',
                    borderRadius: 2,
                    border: '1px solid #e9ecef'
                }}>
                    <Typography variant="h6" color="text.secondary">
                        No games found
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ 
                    backgroundColor: '#f8f9fa',
                    borderRadius: 2,
                    border: '1px solid #e9ecef',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    overflowX: 'auto', // Enable horizontal scrolling
                    position: 'relative', // For sticky header positioning
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
                    gridTemplateColumns: getGridColumns(),
                    gap: 1,
                    p: 1.5,
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    minWidth: getMinWidth(),
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                    width: 'max-content', // Force header to cover full content width
                    '& > *': {
                        backgroundColor: theme.palette.primary.main, // Ensure each header cell is blue
                    }
                }}>
                    {SCOREBOARD_CONSTANTS.COLUMN_HEADERS[isPastGames ? 'PAST_GAMES' : 'LIVE_GAMES'].map((header, index) => (
                        <Typography key={index} sx={{ 
                            fontSize: '0.875rem', 
                            fontWeight: 600, 
                            textAlign: 'center',
                            backgroundColor: theme.palette.primary.main, // Ensure each header cell is blue
                            minHeight: '100%', // Full height coverage
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
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
                                gridTemplateColumns: getGridColumns(),
                                gap: 1,
                                p: 1.5,
                                borderBottom: index < games.length - 1 ? '1px solid #e9ecef' : 'none',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                                minWidth: getMinWidth(), // Minimum width to prevent squishing
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
                                        width: { xs: 18, sm: 24 },
                                        height: { xs: 18, sm: 24 },
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
                                            fontSize: { xs: '0.7rem', sm: '1rem' },
                                            fontWeight: 600,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {isSmallScreen 
                                                ? (homeTeamData?.short_name || homeTeamData?.abbreviation || '')
                                                : homeTeamName
                                            }
                                        </Typography>
                                        {/* Home Team Ranking */}
                                        {homeTeamData?.coaches_poll_ranking && homeTeamData.coaches_poll_ranking > 0 && (
                                            <Typography sx={{
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
                                        width: { xs: 18, sm: 24 },
                                        height: { xs: 18, sm: 24 },
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
                                            fontSize: { xs: '0.7rem', sm: '1rem' },
                                            fontWeight: 600,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {isSmallScreen 
                                                ? (awayTeamData?.short_name || awayTeamData?.abbreviation || '')
                                                : awayTeamName
                                            }
                                        </Typography>
                                        {/* Away Team Ranking */}
                                        {awayTeamData?.coaches_poll_ranking && awayTeamData.coaches_poll_ranking > 0 && (
                                            <Typography sx={{
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

                            {/* Game Mode Column for Past Games */}
                            {isPastGames && (
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center' 
                                }}>
                                    <Box sx={{
                                        backgroundColor: game.gameMode === 'CHEW' ? theme.palette.error.main : theme.palette.primary.main,
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
                                            {game.gameMode === 'CHEW' ? 'Chew' : 'Normal'}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            {/* Spread Column for Past Games */}
                            {isPastGames && (
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    gap: 0.5
                                }}>
                                    {game.home_vegas_spread !== null && game.home_vegas_spread !== undefined ? (
                                        <>
                                            <Box sx={{
                                                width: 16,
                                                height: 16,
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
                                                        fontSize: '0.6rem',
                                                        fontWeight: 600
                                                    }}>
                                                        {homeTeamName?.charAt(0) || 'H'}
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Typography sx={{
                                                color: 'text.primary',
                                                fontSize: '0.8rem',
                                                fontWeight: 500
                                            }}>
                                                {game.home_vegas_spread > 0 ? '+' : ''}{game.home_vegas_spread}
                                            </Typography>
                                        </>
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

                            {/* Game Mode Column */}
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center' 
                            }}>
                                <Box sx={{
                                    backgroundColor: game.game_mode === 'CHEW' ? theme.palette.error.main : theme.palette.primary.main,
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
                                        {game.game_mode === 'CHEW' ? 'Chew' : 'Normal'}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Spread Column */}
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                gap: 0.5
                            }}>
                                {game.home_vegas_spread !== null && game.home_vegas_spread !== undefined ? (
                                    <>
                                        <Box sx={{
                                            width: 16,
                                            height: 16,
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
                                                    fontSize: '0.6rem',
                                                    fontWeight: 600
                                                }}>
                                                    {homeTeamName?.charAt(0) || 'H'}
                                                </Typography>
                                            )}
                                        </Box>
                                        <Typography sx={{
                                            color: 'text.primary',
                                            fontSize: '0.8rem',
                                            fontWeight: 500
                                        }}>
                                            {game.home_vegas_spread > 0 ? '+' : ''}{game.home_vegas_spread}
                                        </Typography>
                                    </>
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
                            </>
                            )}
                        </Box>
                    );
                })}
                </Box>
            )}

            {/* Pagination - only show when there are games and multiple pages */}
            {games && games.length > 0 && totalPages > 1 && (
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
    totalGames: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    title: PropTypes.string,
    filters: PropTypes.object,
    setFilters: PropTypes.func,
    seasonFilter: PropTypes.node,
    weekFilter: PropTypes.node
};

export default ScoreboardList; 