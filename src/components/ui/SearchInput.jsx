import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { inputSx } from '../../styles/controls';

const SearchInput = ({ value, onChange, placeholder, ariaLabel, sx }) => (
    <Box
        component="input"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel || placeholder}
        sx={{ ...inputSx, height: '38px', flex: '1 1 auto', minWidth: 180, maxWidth: 360, ...sx }}
    />
);

SearchInput.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string.isRequired,
    ariaLabel: PropTypes.string,
    sx: PropTypes.object,
};

export default SearchInput;
