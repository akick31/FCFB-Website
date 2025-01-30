import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const SeasonDropdown = ({season, onChange}) => (
    <FormControl fullWidth margin="normal">
        <InputLabel shrink>Season</InputLabel>
        <Select
            value={season}
            label="Season"
            onChange={onChange}
            displayEmpty
            inputlabelprops={{shrink: true}}
        >
            <MenuItem value="">All Seasons</MenuItem>
            <MenuItem value="10">Season 10</MenuItem>
        </Select>
    </FormControl>
);

export default SeasonDropdown;