import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const SeasonFilter = ({ season, onSeasonChange }) => (
    <FormControl sx={{ minWidth: 120, margin: 1 }}>
        <InputLabel id="season-label">Season</InputLabel>
        <Select
            labelId="season-label"
            value={season}
            onChange={(e) => onSeasonChange(e.target.value)}
            label="Season"
        >
            <MenuItem value="10">Season 10</MenuItem>
            {/* Add more seasons if needed */}
        </Select>
    </FormControl>
);

export default SeasonFilter;