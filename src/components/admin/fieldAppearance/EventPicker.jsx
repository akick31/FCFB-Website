import React from 'react';
import { Autocomplete, TextField } from '@mui/material';
import PropTypes from 'prop-types';

const EventPicker = ({ items, selectedId, onSelect, label }) => (
    <Autocomplete
        options={items}
        value={items.find((item) => item.id === selectedId) || null}
        onChange={(_, item) => item && onSelect(item.id)}
        getOptionLabel={(item) => item.label}
        isOptionEqualToValue={(item, chosen) => item.id === chosen.id}
        disableClearable
        size="small"
        sx={{ width: { xs: '100%', md: 320 }, '& .MuiOutlinedInput-root': { borderRadius: 'var(--r-sm)' } }}
        renderInput={(params) => (
            <TextField
                {...params}
                placeholder={`Search ${label.toLowerCase()}`}
                inputProps={{ ...params.inputProps, 'aria-label': label }}
            />
        )}
    />
);

EventPicker.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string.isRequired, label: PropTypes.node.isRequired }))
        .isRequired,
    selectedId: PropTypes.string,
    onSelect: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
};

export default EventPicker;
