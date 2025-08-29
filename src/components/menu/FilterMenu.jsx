import React, { useState, useEffect } from 'react';
import {
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography,
    Divider,
    Chip
} from '@mui/material';
import ConferenceDropdown from "../dropdown/ConferenceDropdown";
import GameTypeDropdown from "../dropdown/GameTypeDropdown";
import GameStatusDropdown from "../dropdown/GameStatusDropdown";


const FilterMenu = ({ onApply, category }) => {
    console.log('FilterMenu category:', category);
    const availableFilters = {
        livegames: ['conference', 'gameType', 'gameStatus', 'rankedGame', 'sort'],
        pastgames: ['conference', 'gameType', 'rankedGame', 'sort'],
        scrimmages: ['conference', 'gameStatus', 'rankedGame', 'sort'],
    }[category] || [];
    console.log('Available filters:', availableFilters);

    const getSavedFilters = () => {
        console.log(category);
        const saved = sessionStorage.getItem(`filters_${category}`);
        if (!saved) {
            return {
                filters: [],
                sort: 'CLOSEST_TO_END',
                conference: null,
                gameType: null,
                gameStatus: null,
                rankedGame: null,
                page: 0,
                size: 10,
            };
        }

        const parsed = JSON.parse(saved);
        let { filters, gameStatus, gameType } = parsed;

        // Extract gameStatus and gameType from filters if present
        if (filters && Array.isArray(filters)) {
            gameStatus = filters.find(f => ["PREGAME", "OPENING_KICKOFF", "IN_PROGRESS", "OVERTIME"].includes(f)) || null;
            gameType = filters.find(f => ["OUT_OF_CONFERENCE", "CONFERENCE_GAME", "CONFERENCE_CHAMPIONSHIP", "PLAYOFFS", "NATIONAL_CHAMPIONSHIP", "BOWL"].includes(f)) || null;

            // Remove extracted values from filters
            filters = filters.filter(f => f !== gameStatus && f !== gameType);
        }

        return {
            ...parsed,
            filters,
            gameStatus,
            gameType,
        };
    };

    const [pendingFilters, setPendingFilters] = useState(getSavedFilters);

    useEffect(() => {
        sessionStorage.setItem(`filters_${category}`, JSON.stringify(pendingFilters));
    }, [pendingFilters, category]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            sessionStorage.removeItem(`filters_${category}`);
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [category]);

    // Handle dropdown changes
    const handleChange = (field) => (event) => {
        let newValue = event.target.value;
        if (newValue === "") newValue = null; // Convert "All" to null

        setPendingFilters(prev => ({
            ...prev,
            [field]: newValue,
        }));
    };

    const handleApply = () => {
        console.log('Applying filters:', pendingFilters);
        onApply(pendingFilters);
    };

    const handleReset = () => {
        const resetFilters = {
            filters: [],
            sort: 'CLOSEST_TO_END',
            conference: null,
            gameType: null,
            gameStatus: null,
            rankedGame: null,
            page: 0,
            size: 10,
        };
        setPendingFilters(resetFilters);
        onApply(resetFilters);
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (pendingFilters.conference) count++;
        if (pendingFilters.gameType) count++;
        if (pendingFilters.gameStatus) count++;
        if (pendingFilters.rankedGame) count++;
        if (pendingFilters.filters.length > 0) count++;
        return count;
    };

    return (
        <Box sx={{ p: 3, minWidth: 320 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Filter Games
                </Typography>
                <Chip 
                    label={`${getActiveFiltersCount()} active`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                />
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
                    Sort Options
                </Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                        value={pendingFilters.sort || 'CLOSEST_TO_END'}
                        label="Sort By"
                        onChange={handleChange('sort')}
                    >
                        <MenuItem value="CLOSEST_TO_END">Closest to End</MenuItem>
                        <MenuItem value="MOST_TIME_REMAINING">Most Time Remaining</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
                    Game Filters
                </Typography>
                
                {/* Conference Filter */}
                {availableFilters.includes('conference') && (
                    <Box sx={{ mb: 2 }}>
                        <ConferenceDropdown
                            value={pendingFilters.conference}
                            onChange={handleChange('conference')}
                            label="Conference"
                        />
                    </Box>
                )}

                {/* Game Type Filter */}
                {availableFilters.includes('gameType') && (
                    <Box sx={{ mb: 2 }}>
                        <GameTypeDropdown
                            value={pendingFilters.gameType}
                            onChange={handleChange('gameType')}
                            label="Game Type"
                        />
                    </Box>
                )}

                {/* Game Status Filter */}
                {availableFilters.includes('gameStatus') && (
                    <Box sx={{ mb: 2 }}>
                        <GameStatusDropdown
                            value={pendingFilters.gameStatus}
                            onChange={handleChange('gameStatus')}
                            label="Game Status"
                        />
                    </Box>
                )}

                {/* Ranked Games Filter */}
                {availableFilters.includes('rankedGame') && (
                    <Box sx={{ mb: 2 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Ranked Games</InputLabel>
                            <Select
                                value={pendingFilters.rankedGame || ''}
                                label="Ranked Games"
                                onChange={handleChange('rankedGame')}
                            >
                                <MenuItem value="">All Games</MenuItem>
                                <MenuItem value="ranked">Ranked Games Only</MenuItem>
                                <MenuItem value="unranked">Unranked Games Only</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                )}


            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                <Button
                    variant="outlined"
                    onClick={handleReset}
                    size="small"
                >
                    Reset
                </Button>
                <Button
                    variant="contained"
                    onClick={handleApply}
                    size="small"
                >
                    Apply Filters
                </Button>
            </Box>
        </Box>
    );
};

export default FilterMenu;