import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const SeasonDropdown = ({value, onChange}) => {
    // Only show seasons 10 and 11 for now
    const availableSeasons = [10, 11];

    return (
        <FormControl fullWidth margin="normal">
            <InputLabel shrink>Season</InputLabel>
            <Select
                value={value || ''}
                label="Season"
                onChange={onChange}
                displayEmpty
            >
                <MenuItem value="">All Seasons</MenuItem>
                {availableSeasons.map(season => (
                    <MenuItem key={season} value={season}>
                        Season {season}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default SeasonDropdown;