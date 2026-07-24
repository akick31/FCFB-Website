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
    Autocomplete,
    TextField,
} from '@mui/material';
import { FilterList, Close } from '@mui/icons-material';
import PropTypes from 'prop-types';
import FilterMenu from '../../menu/FilterMenu';
import { useGameFilters } from './hooks/useGameFilters';
import { useGamePagination } from './hooks/useGamePagination';
import { getAllTeams } from '../../../api/teamApi';
import { isRealTeam } from '../../../utils/teamDataUtils';
import { SCOREBOARD_CONSTANTS } from './utils/scoreboardConstants';
import { useTeamsMap } from '../../../hooks/useTeamsMap';
import GameCard from '../cards/GameCard';

const gameKey = (game) => game.gameId || game.game_id || game.id;
const teamOf = (game, side) => game[`${side}Team`] || game[`${side}_team`];

const ScoreboardList = ({
    games,
    loading,
    error,
    currentPage,
    totalPages,
    totalGames,
    onPageChange,
    title = 'Games',
    filters,
    setFilters,
    seasonFilter,
    weekFilter,
    gameTypeFilter,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const teamsMap = useTeamsMap();

    const [allTeams, setAllTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [filteredGames, setFilteredGames] = useState(games);
    const preSearchSizeRef = useRef(null);

    const { filterMenuOpen, handleFilterApply, openFilterMenu, closeFilterMenu } = useGameFilters(filters, setFilters);
    const { rowsPerPage, handleRowsPerPageChange } = useGamePagination(SCOREBOARD_CONSTANTS.DEFAULT_ROWS_PER_PAGE);

    useEffect(() => {
        getAllTeams()
            .then((teams) => setAllTeams(teams.filter((team) => team.active && isRealTeam(team))))
            .catch((err) => console.error('Failed to fetch teams for search:', err));
    }, []);

    useEffect(() => {
        if (!selectedTeam) {
            setFilteredGames(games);
            return;
        }
        setFilteredGames(games.filter((game) => teamOf(game, 'home') === selectedTeam.name || teamOf(game, 'away') === selectedTeam.name));
    }, [selectedTeam, games]);

    const handleSearchChange = (event, team) => {
        setSelectedTeam(team);
        if (!setFilters) return;
        if (team) {
            preSearchSizeRef.current = filters?.size || rowsPerPage;
            setFilters((prev) => ({ ...prev, size: Math.max(totalGames || 0, 500), page: 0 }));
        } else {
            setFilters((prev) => ({ ...prev, size: preSearchSizeRef.current || rowsPerPage, page: 0 }));
            preSearchSizeRef.current = null;
        }
    };

    const handleRowsChange = (event) => {
        const nextSize = handleRowsPerPageChange(event);
        if (selectedTeam) {
            preSearchSizeRef.current = nextSize;
        } else {
            setFilters((prev) => ({ ...prev, size: nextSize, page: 0 }));
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
        return <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>;
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 240 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                        <Typography variant="h3" sx={{ color: 'var(--text)' }}>{title}</Typography>
                        <Autocomplete
                            options={allTeams}
                            getOptionLabel={(option) => option.name || ''}
                            value={selectedTeam}
                            onChange={handleSearchChange}
                            sx={{ minWidth: 200 }}
                            renderInput={(params) => (
                                <TextField {...params} label="Search team" placeholder="Search for a team..." size="small" />
                            )}
                        />
                        {seasonFilter && <Box sx={{ minWidth: 150 }}>{seasonFilter}</Box>}
                        {weekFilter && <Box sx={{ minWidth: 150 }}>{weekFilter}</Box>}
                        {gameTypeFilter && <Box sx={{ minWidth: 160 }}>{gameTypeFilter}</Box>}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        {selectedTeam
                            ? `${filteredGames.length} game${filteredGames.length !== 1 ? 's' : ''} found for ${selectedTeam.name}`
                            : `${totalGames} game${totalGames !== 1 ? 's' : ''} found`}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                    <FormControl size="small" sx={{ minWidth: 110 }}>
                        <InputLabel>Rows</InputLabel>
                        <Select value={rowsPerPage} label="Rows" onChange={handleRowsChange}>
                            {SCOREBOARD_CONSTANTS.ROWS_PER_PAGE_OPTIONS.map((option) => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Fab size="small" color="primary" onClick={openFilterMenu} aria-label="Filters">
                        <FilterList />
                    </Fab>
                </Box>
            </Box>

            {!filteredGames || filteredGames.length === 0 ? (
                <Box sx={{ textAlign: 'center', p: 5, backgroundColor: 'var(--surface)', borderRadius: 'var(--r-lg)', border: '1px solid var(--line)' }}>
                    <Typography variant="h6" color="text.secondary">No games found</Typography>
                </Box>
            ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 2 }}>
                    {filteredGames.map((game) => (
                        <GameCard key={gameKey(game)} game={game} teamsMap={teamsMap} compact />
                    ))}
                </Box>
            )}

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

            <Drawer anchor="right" open={filterMenuOpen} onClose={closeFilterMenu} PaperProps={{ sx: { width: isMobile ? '100%' : 320 } }}>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Filters</Typography>
                    <IconButton onClick={closeFilterMenu} aria-label="Close filters"><Close /></IconButton>
                </Box>
                <FilterMenu onApply={handleFilterApply} category={title.toLowerCase().replace(' ', '')} />
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
    weekFilter: PropTypes.node,
    gameTypeFilter: PropTypes.node,
};

export default ScoreboardList;
