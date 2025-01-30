import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const WeekDropdown = ({ week, onChange }) => (
    <FormControl fullWidth margin="normal">
        <InputLabel shrink>Week</InputLabel>
        <Select
            value={week}
            label="Week"
            onChange={onChange}
            displayEmpty
            inputlabelprops={{ shrink: true }}
        >
            {Array.from({ length: 12 }, (_, i) => (
                <MenuItem key={i + 1} value={i + 1}>
                    Week {i + 1}
                </MenuItem>
            ))}
            <MenuItem value="13">Conference Championship</MenuItem>
            <MenuItem value="14">Postseason</MenuItem>
        </Select>
    </FormControl>
);

export default WeekDropdown;