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
import { getCurrentWeek, getCurrentSeason } from '../../api/seasonApi';

const FilterMenu = ({ filters, onChange, onApply, category }) => {
    const [defaultValues, setDefaultValues] = useState({
        season: null,
        week: null
    });

    useEffect(() => {
        const fetchDefaults = async () => {
            const season = await getCurrentSeason();
            const week = await getCurrentWeek();
            setDefaultValues({ season, week });
        };
        fetchDefaults();
    }, []);

    const [pendingFilters, setPendingFilters] = useState({
        season: defaultValues.season,
        week: defaultValues.week,
        conference: "",
        gameType: "",
        gameStatus: "",
        filters: [],
        sort: "CLOSEST_TO_END",
        ...filters
    });

    const availableFilters = {
        ongoing: ['conference', 'gameType', 'gameStatus', 'rankedMatchup'],
        past: ['conference', 'gameType', 'week', 'season', 'rankedMatchup'],
        scrimmage: ['conference', 'gameStatus', 'rankedMatchup'],
        pastScrimmage: ['conference', 'gameType', 'week', 'season'],
    }[category] || [];

    const handleChange = (field) => (event) => {
        setPendingFilters((prev) => {
            const updatedFilters = prev.filters ? [...prev.filters] : [];
            if (event.target.checked) {
                if (!updatedFilters.includes("RANKED_MATCHUP")) {
                    updatedFilters.push("RANKED_MATCHUP");
                }
            } else {
                if (!updatedFilters.includes(event.target.value)) {
                    updatedFilters.push(event.target.value);
                }
            }
            return {
                ...prev,
                filters: updatedFilters,
            }
        });
    };

    const handleCheckboxChange = (value) => (event) => {
        setPendingFilters((prev) => {
            const updatedFilters = prev.filters ? [...prev.filters] : [];

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

    return (
        <div style={{ padding: '16px', minWidth: '250px' }}>
            {availableFilters.includes('season') && (
                <SeasonDropdown
                    value={pendingFilters.season ?? defaultValues.season}
                    onChange={handleChange('season')}
                    label="Season"
                />
            )}

            {availableFilters.includes('week') && (
                <WeekDropdown
                    value={pendingFilters.week ?? defaultValues.week}
                    onChange={handleChange('week')}
                    label="Week"
                />
            )}

            {availableFilters.includes('conference') && (
                <ConferenceDropdown
                    value={pendingFilters.conference ?? ""}
                    onChange={handleChange('conference')}
                    label="Conference"
                />
            )}

            {availableFilters.includes('gameType') && (
                <GameTypeDropdown
                    value={pendingFilters.gameType ?? ""}
                    onChange={handleChange('gameType')}
                    label="Game Type"
                />
            )}

            {availableFilters.includes('gameStatus') && (
                <GameStatusDropdown
                    value={pendingFilters.gameStatus ?? ""}
                    onChange={handleChange('gameStatus')}
                    label="Game Status"
                />
            )}

            {availableFilters.includes('rankedMatchup') && (
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={pendingFilters.filters?.includes("RANKED_MATCHUP") || false}
                            onChange={handleCheckboxChange("RANKED_MATCHUP")}
                        />
                    }
                    label="Ranked Matchups Only"
                />
            )}

            <FormControl fullWidth margin="normal">
                <InputLabel>Sort By</InputLabel>
                <Select
                    value={pendingFilters.sort ?? "CLOSEST_TO_END"}
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
                onClick={() => onApply(pendingFilters)}
                sx={{
                    width: '100%',
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