import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const SeasonDropdown = ({value, onChange}) => (
    <FormControl fullWidth margin="normal">
        <InputLabel shrink>Season</InputLabel>
        <Select
            value={value}
            label="Season"
            onChange={onChange}
            displayEmpty
        >
            <MenuItem value="">All Seasons</MenuItem>
            <MenuItem value="10">Season 10</MenuItem>
        </Select>
    </FormControl>
);

export default SeasonDropdown;