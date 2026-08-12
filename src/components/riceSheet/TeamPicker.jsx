import React from 'react';
import PropTypes from 'prop-types';
import { Autocomplete, TextField } from '@mui/material';

const MAX_TEAMS = 10;

const TeamPicker = ({ teams, selectedTeams, onChange }) => (
    <Autocomplete
        multiple
        options={teams}
        value={selectedTeams}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        onChange={(event, newValue) => {
            if (newValue.length > MAX_TEAMS) return;
            onChange(newValue);
        }}
        filterOptions={(options, { inputValue }) => {
            const filterValue = inputValue.toLowerCase();
            return options.filter((option) => option.name.toLowerCase().includes(filterValue));
        }}
        renderInput={(params) => (
            <TextField
                {...params}
                label="Teams"
                placeholder={selectedTeams.length >= MAX_TEAMS ? '' : `Add a team (up to ${MAX_TEAMS})`}
            />
        )}
        sx={{ minWidth: 320, flex: 1 }}
    />
);

TeamPicker.propTypes = {
    teams: PropTypes.array.isRequired,
    selectedTeams: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default TeamPicker;
