import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Divider } from '@mui/material';

const WeekDropdown = ({ value, onChange, showPostseasonOptions = false }) => {
    return (
        <FormControl fullWidth margin="normal">
            <InputLabel shrink>Week</InputLabel>
            <Select
                value={value || ''}
                label="Week"
                onChange={onChange}
                displayEmpty
            >
                <MenuItem value="">All Weeks</MenuItem>
                {Array.from({ length: 12 }, (_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>
                        Week {i + 1}
                    </MenuItem>
                ))}
                <MenuItem value="13">Conference Championship</MenuItem>
                <MenuItem value="14">Week 14</MenuItem>
                {showPostseasonOptions && <Divider />}
                {showPostseasonOptions && <MenuItem value="POSTSEASON">Postseason (All)</MenuItem>}
                {showPostseasonOptions && <MenuItem value="PLAYOFFS">Playoffs Only</MenuItem>}
            </Select>
        </FormControl>
    );
};

export default WeekDropdown;