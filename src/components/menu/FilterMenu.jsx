import React, { useState, useEffect } from 'react';
import {
    FormControlLabel,
    Checkbox,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import ConferenceDropdown from "../dropdown/ConferenceDropdown";
import GameTypeDropdown from "../dropdown/GameTypeDropdown";
import GameStatusDropdown from "../dropdown/GameStatusDropdown";
import WeekDropdown from "../dropdown/WeekDropdown";
import SeasonDropdown from "../dropdown/SeasonDropdown";

const FilterMenu = ({ onChange, onApply, category }) => {
    const availableFilters = {
        ongoing: ['conference', 'gameType', 'gameStatus', 'rankedGame'],
        past: ['conference', 'gameType', 'week', 'season', 'rankedGame'],
        scrimmage: ['conference', 'gameStatus', 'rankedGame'],
        pastScrimmage: ['conference', 'gameType', 'week', 'season'],
    }[category] || [];

    const getSavedFilters = () => {
        const saved = sessionStorage.getItem(`filters_${category}`);
        if (!saved) {
            return {
                filters: [],
                sort: 'CLOSEST_TO_END',
                conference: null,
                season: null,
                week: null,
                gameType: null,
                gameStatus: null,
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

    // Handle checkbox changes
    const handleCheckboxChange = (value) => (event) => {
        setPendingFilters(prev => {
            let updatedFilters = prev.filters.filter(f => f !== value);

            if (event.target.checked) {
                updatedFilters.push(value);
            }

            return { ...prev, filters: updatedFilters };
        });
    };

    // Apply filters when button is clicked
    const handleApply = () => {
        let filters = [...pendingFilters.filters];

        if (pendingFilters.gameType) filters.push(pendingFilters.gameType);
        if (pendingFilters.gameStatus) filters.push(pendingFilters.gameStatus);

        filters = [...new Set(filters)].filter(Boolean); // Remove duplicates and filter out null/undefined

        const finalFilters = {
            filters: filters.length > 0 ? filters : [],
            week: pendingFilters.week || null,
            season: pendingFilters.season || null,
            conference: pendingFilters.conference || null,
            sort: pendingFilters.sort,
            page: 0,
            size: 10,
        };

        sessionStorage.setItem(`filters_${category}`, JSON.stringify(finalFilters));
        onChange(finalFilters);
        onApply();
    };

    return (
        <div style={{ padding: '16px', minWidth: '250px' }}>
            {availableFilters.includes('season') && (
                <SeasonDropdown
                    value={pendingFilters.season || ""}
                    onChange={handleChange('season')}
                    label="Season"
                />
            )}

            {availableFilters.includes('week') && (
                <WeekDropdown
                    value={pendingFilters.week || ""}
                    onChange={handleChange('week')}
                    label="Week"
                />
            )}

            {availableFilters.includes('conference') && (
                <ConferenceDropdown
                    value={pendingFilters.conference || ""}
                    onChange={handleChange('conference')}
                    label="Conference"
                />
            )}

            {availableFilters.includes('gameType') && (
                <GameTypeDropdown
                    value={pendingFilters.gameType || ""}
                    onChange={handleChange('gameType')}
                    label="Game Type"
                >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="OUT_OF_CONFERENCE">Out of Conference</MenuItem>
                    <MenuItem value="CONFERENCE_GAME">Conference Game</MenuItem>
                    <MenuItem value="CONFERENCE_CHAMPIONSHIP">Conference Championship</MenuItem>
                    <MenuItem value="PLAYOFFS">Playoffs</MenuItem>
                    <MenuItem value="NATIONAL_CHAMPIONSHIP">National Championship</MenuItem>
                    <MenuItem value="BOWL">Bowl</MenuItem>
                </GameTypeDropdown>
            )}

            {availableFilters.includes('gameStatus') && (
                <GameStatusDropdown
                    value={pendingFilters.gameStatus || ""}
                    onChange={handleChange('gameStatus')}
                    label="Game Status"
                >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="PREGAME">Pregame</MenuItem>
                    <MenuItem value="OPENING_KICKOFF">Opening Kickoff</MenuItem>
                    <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                    <MenuItem value="OVERTIME">Overtime</MenuItem>
                </GameStatusDropdown>
            )}

            {availableFilters.includes('rankedGame') && (
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={pendingFilters.filters?.includes("RANKED_GAME") || false}
                            onChange={handleCheckboxChange("RANKED_GAME")}
                        />
                    }
                    label="Ranked Scoreboard Only"
                />
            )}

            <FormControl fullWidth margin="normal">
                <InputLabel>Sort By</InputLabel>
                <Select
                    value={pendingFilters.sort}
                    onChange={handleChange('sort')}
                    label="Sort By"
                >
                    <MenuItem value="CLOSEST_TO_END">Least Time Remaining</MenuItem>
                    <MenuItem value="MOST_TIME_REMAINING">Most Time Remaining</MenuItem>
                </Select>
            </FormControl>

            <Button
                variant="contained"
                fullWidth
                onClick={handleApply}
                sx={{
                    mt: 2,
                    backgroundColor: '#004260',
                    color: 'white',
                    '&:hover': {
                        backgroundColor: '#00354d'
                    }
                }}
            >
                Apply Filters
            </Button>
        </div>
    );
};

export default FilterMenu;