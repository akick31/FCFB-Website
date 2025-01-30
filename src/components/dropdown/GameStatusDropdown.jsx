import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const GameStatusDropdown = ({ selectedGameStatus, onChange }) => (
    <FormControl fullWidth sx={{ marginBottom: 2 }}>
        <InputLabel shrink>Game Status</InputLabel>
        <Select
            value={selectedGameStatus}
            onChange={onChange}
            label="Game Status"
            displayEmpty
            inputlabelprops={{ shrink: true }}
        >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="PREGAME">Pregame</MenuItem>
            <MenuItem value="OPENING_KICKOFF">Opening Kickoff</MenuItem>
            <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
            <MenuItem value="OVERTIME">Overtime</MenuItem>
        </Select>
    </FormControl>
);

export default GameStatusDropdown;