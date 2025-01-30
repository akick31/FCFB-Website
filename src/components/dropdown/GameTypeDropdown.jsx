import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const GameTypeDropdown = ({ selectedGameType, onChange }) => (
    <FormControl fullWidth margin="normal">
        <InputLabel shrink>Game Type</InputLabel>
        <Select
            value={selectedGameType}
            onChange={onChange}
            label="Game Type"
            displayEmpty
            inputlabelprops={{ shrink: true }}
        >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="OUT_OF_CONFERENCE">Out of Conference</MenuItem>
            <MenuItem value="CONFERENCE_GAME">Conference Game</MenuItem>
            <MenuItem value="CONFERENCE_CHAMPIONSHIP">Conference Championship</MenuItem>
            <MenuItem value="PLAYOFFS">Playoffs</MenuItem>
            <MenuItem value="NATIONAL_CHAMPIONSHIP">National Championship</MenuItem>
            <MenuItem value="BOWL">Bowl</MenuItem>
        </Select>
    </FormControl>
);

export default GameTypeDropdown;