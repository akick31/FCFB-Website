import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const WeekFilter = ({ week, onWeekChange }) => (
    <FormControl sx={{ minWidth: 120, margin: 1 }}>
        <InputLabel id="week-label">Week</InputLabel>
        <Select
            labelId="week-label"
            value={week}
            onChange={(e) => onWeekChange(e.target.value)}
            label="Week"
        >
            {Array.from({ length: 16 }, (_, i) => (
                <MenuItem key={i + 1} value={i + 1}>
                    Week {i + 1}
                </MenuItem>
            ))}
        </Select>
    </FormControl>
);

export default WeekFilter;