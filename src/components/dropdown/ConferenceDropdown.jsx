import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { conferences } from '../constants/conferences';
import PropTypes from 'prop-types';

const ConferenceDropdown = ({ value, onChange, sx = {} }) => {

    return (
        <FormControl fullWidth margin="normal" sx={sx}>
            <InputLabel shrink>Conference</InputLabel>
            <Select
                value={value}
                label="Conference"
                onChange={onChange}
                displayEmpty
            >
                {conferences.map((conference) => (
                    <MenuItem key={conference.value} value={conference.value}>
                        {conference.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

ConferenceDropdown.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    sx: PropTypes.object
}

export default ConferenceDropdown;