import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { formatConference } from '../../utils/formatText';
import PropTypes from 'prop-types';

const ConferenceFilter = ({ selectedConference, onConferenceChange }) => {
    const conferenceOptions = [
        'ACC', 'AMERICAN', 'BIG_12', 'BIG_TEN', 'CUSA', 'FBS_INDEPENDENT', 'MAC', 'MOUNTAIN_WEST', 'PAC_12', 'SEC', 'SUN_BELT',
        'ATLANTIC_SUN', 'BIG_SKY', 'CAROLINA_FOOTBALL_CONFERENCE', 'MISSOURI_VALLEY', 'COLONIAL', 'NEC', 'IVY_LEAGUE', 'MID_ATLANTIC',
        'SOUTHLAND', 'OHIO_VALLEY', 'SWAC'
    ];

    return (
        <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel shrink>Conference</InputLabel>
            <Select
                value={selectedConference}
                label="Conference"
                onChange={onConferenceChange}
                displayEmpty
                InputLabelProps={{ shrink: true }}
            >
                <MenuItem value="">All Conferences</MenuItem>
                {conferenceOptions.map((conference) => (
                    <MenuItem key={conference} value={conference}>
                        {formatConference(conference)}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

ConferenceFilter.propTypes = {
    selectedConference: PropTypes.string,
    onConferenceChange: PropTypes.func,
}

export default ConferenceFilter;