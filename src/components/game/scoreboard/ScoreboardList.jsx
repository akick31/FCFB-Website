import React, { useState, useEffect, useRef } from 'react';
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
    InputLabel,
    Avatar,
    Autocomplete,
    TextField
} from '@mui/material';
import { FilterList, Close } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import FilterMenu from '../../menu/FilterMenu';
import { useTeamData } from './hooks/useTeamData';
import { useGameFilters } from './hooks/useGameFilters';
import { useGamePagination } from './hooks/useGamePagination';
import { getAllTeams } from '../../../api/teamApi';
import { SCOREBOARD_CONSTANTS } from './utils/scoreboardConstants';
import LiveGameCard from './LiveGameCard';
// getAllOngoingGames no longer used; team search now works via filter size expansion

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
    
    // Team search state
    const [allTeams, setAllTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [filteredGames, setFilteredGames] = useState(games);
    // Track the page size before a team search expands it so we can restore it on clear
    const preSearchSizeRef = useRef(null);
    
    // Use custom hooks for better organization
    const { teamsData, loading: teamsLoading } = useTeamData(filteredGames);
    const { filterMenuOpen, handleFilterApply, openFilterMenu, closeFilterMenu } = useGameFilters(filters, setFilters);
    const { rowsPerPage, handleRowsPerPageChange } = useGamePagination(SCOREBOARD_CONSTANTS.DEFAULT_ROWS_PER_PAGE);
    
    // Fetch all teams for search
    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const teams = await getAllTeams();
                setAllTeams(teams.filter(t => t.active));
            } catch (err) {
                console.error('Failed to fetch teams for search:', err);
            }
        };
        fetchTeams();
    }, []);

    // Filter games by selected team
    useEffect(() => {
        if (!selectedTeam) {
            setFilteredGames(games);
        } else {
            const teamName = selectedTeam.name;
            const filtered = games.filter(game => {
                const homeTeam = game.homeTeam || game.home_team;
                const awayTeam = game.awayTeam || game.away_team;
                return homeTeam === teamName || awayTeam === teamName;
            });
            setFilteredGames(filtered);
        }
    }, [selectedTeam, games]);


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
    if (teamsLoading && filteredGames.length > 0) {
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
        if (title === 'Live Games' && selectedTeam) {
            // While searching by team, save the new preference for when search is cleared
            preSearchSizeRef.current = newRowsPerPage;
        } else {
            setFilters(prev => ({ ...prev, size: newRowsPerPage, page: 0 }));
        }
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
                        
                        {/* Team Search */}
                        <Box sx={{ minWidth: 200 }}>
                            <Autocomplete
                                options={allTeams}
                                getOptionLabel={(option) => option.name || ''}
                                value={selectedTeam}
                                onChange={(event, newValue) => {
                                    setSelectedTeam(newValue);
                                    // For Live Games, expand fetch size so search spans all games,
                                    // not just those on the current page
                                    if (title === 'Live Games' && setFilters) {
                                        if (newValue) {
                                            preSearchSizeRef.current = filters?.size || rowsPerPage;
                                            setFilters(prev => ({ ...prev, size: Math.max(totalGames || 0, 500), page: 0 }));
                                        } else {
                                            setFilters(prev => ({ ...prev, size: preSearchSizeRef.current || rowsPerPage, page: 0 }));
                                            preSearchSizeRef.current = null;
                                        }
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Search Team"
                                        placeholder="Search for a team..."
                                        size="small"
                                    />
                                )}
                                renderOption={(props, option) => {
                                    const { key, ...otherProps } = props;
                                    return (
                                        <Box component="li" key={key} {...otherProps} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {option.logo && (
                                                <Avatar
                                                    src={option.logo}
                                                    alt={option.name}
                                                    sx={{ width: 24, height: 24 }}
                                                />
                                            )}
                                            <span>{option.name}</span>
                                        </Box>
                                    );
                                }}
                                clearOnEscape
                                clearText="Clear"
                            />
                        </Box>
                        
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
                        {selectedTeam 
                            ? `${filteredGames.length} game${filteredGames.length !== 1 ? 's' : ''} found for ${selectedTeam.name}`
                            : `${totalGames} game${totalGames !== 1 ? 's' : ''} found`
                        }
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
            {(!filteredGames || filteredGames.length === 0) ? (
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
                /* ═══ ALL GAMES: Card-based layout ═══ */
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: 'repeat(2, 1fr)',
                        xl: 'repeat(3, 1fr)',
                    },
                    gap: 2,
                }}>
                    {filteredGames.map((game) => {
                        const awayTeamName = game.awayTeam || game.away_team;
                        const homeTeamName = game.homeTeam || game.home_team;
                        const awayTeamData = teamsData[awayTeamName];
                        const homeTeamData = teamsData[homeTeamName];
                        return (
                            <LiveGameCard
                                key={game.gameId || game.game_id || game.id}
                                game={game}
                                homeTeamData={homeTeamData}
                                awayTeamData={awayTeamData}
                            />
                        );
                    })}
                </Box>
            )}

            {/* Pagination - only show when there are games and multiple pages,
                and when we're not in a team-specific search */}
            {!selectedTeam && filteredGames && filteredGames.length > 0 && totalPages > 1 && (
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