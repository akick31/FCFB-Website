import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { conferences } from '../constants/conferences';
import PropTypes from 'prop-types';

const ConferenceDropdown = ({ value, onChange }) => {

    return (
        <FormControl fullWidth margin="normal">
            <InputLabel shrink>Conference</InputLabel>
            <Select
                value={value}
                label="Conference"
                onChange={onChange}
                displayEmpty
            >
                <MenuItem value="">All Conferences</MenuItem>
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
    selectedConference: PropTypes.string,
    onChange: PropTypes.func,
}

export default ConferenceDropdown;