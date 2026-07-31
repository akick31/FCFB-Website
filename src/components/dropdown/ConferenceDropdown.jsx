import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box, Avatar } from '@mui/material';
import { useConferencesMap, activeConferenceList } from '../constants/conferences';
import PropTypes from 'prop-types';

const ConferenceDropdown = ({ value, onChange, sx = {}, fullWidth = false, size = "medium" }) => {
    useConferencesMap();
    const conferences = activeConferenceList();

    return (
        <FormControl fullWidth={fullWidth} margin="normal" size={size} sx={sx}>
            <InputLabel shrink>Conference</InputLabel>
            <Select
                value={value}
                label="Conference"
                onChange={(e) => onChange(e.target.value)}
                displayEmpty
            >
                {conferences.map((conference) => (
                    <MenuItem key={conference.code} value={conference.code}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {conference.logo_url && (
                                <Avatar src={conference.logo_url} sx={{ width: 20, height: 20 }} variant="rounded" />
                            )}
                            {conference.label}
                        </Box>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

ConferenceDropdown.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    sx: PropTypes.object,
    fullWidth: PropTypes.bool,
    size: PropTypes.string
}

export default ConferenceDropdown;