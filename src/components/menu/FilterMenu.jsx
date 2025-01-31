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

    const [pendingFilters, setPendingFilters] = useState({
        filters: [],
        sort: 'CLOSEST_TO_END',
        conference: null,
        season: null,
        week: null,
        gameType: null,
        gameStatus: null,
        page: 0,
        size: 20,
    });

    // Handle dropdown changes
    const handleChange = (field) => (event) => {
        const newValue = event.target.value;
        setPendingFilters(prev => ({
            ...prev,
            [field]: newValue,
        }));
    };

    // Handle checkbox changes
    const handleCheckboxChange = (value) => (event) => {
        setPendingFilters(prev => {
            const updatedFilters = [...prev.filters];
            if (event.target.checked) {
                if (!updatedFilters.includes(value)) {
                    updatedFilters.push(value);
                }
            } else {
                const index = updatedFilters.indexOf(value);
                if (index > -1) {
                    updatedFilters.splice(index, 1);
                }
            }
            return { ...prev, filters: updatedFilters };
        });
    };

    // Apply filters when button is clicked
    const handleApply = () => {
        let filters = pendingFilters.filters || [];
        if (pendingFilters.gameType !== null) filters.push(pendingFilters.gameType)
        if (pendingFilters.gameStatus !== null) filters.push(pendingFilters.gameStatus)
        if (filters === []) filters = null
        // Ensure filters is at least an empty array
        const finalFilters = {
            filters: pendingFilters.filters || null, // Ensure filters is always an array
            week: pendingFilters.week,
            season: pendingFilters.season,
            conference: pendingFilters.conference,
            sort: pendingFilters.sort,
            page: 0, // Reset to first page when filters change
            size: 10, // Default page size
        };

        onChange(finalFilters); // Send updated filters to parent
        onApply(); // Close the menu
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
                />
            )}

            {availableFilters.includes('gameStatus') && (
                <GameStatusDropdown
                    value={pendingFilters.gameStatus || ""}
                    onChange={handleChange('gameStatus')}
                    label="Game Status"
                />
            )}

            {availableFilters.includes('rankedGame') && (
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={pendingFilters.filters?.includes("RANKED_GAME") || false}
                            onChange={handleCheckboxChange("RANKED_GAME")}
                        />
                    }
                    label="Ranked Games Only"
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