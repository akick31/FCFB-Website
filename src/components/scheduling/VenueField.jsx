import React, { useEffect, useMemo, useState } from 'react';
import { Autocomplete, Box, TextField } from '@mui/material';
import PropTypes from 'prop-types';
import { getStadiums } from '../../api/stadiumApi';
import StadiumOption from '../stadium/StadiumOption';
import { isTeamStadium, searchTextOf } from '../stadium/stadiumUsage';
import StadiumSuggestions from '../stadium/StadiumSuggestions';

const NEUTRAL = 'Neutral sites';
const TEAM = 'Team stadiums';

const groupOf = (stadium) => (isTeamStadium(stadium) ? TEAM : NEUTRAL);

const VenueField = ({
    value,
    onChange,
    disabled,
    error,
    helperText,
    placeholder = 'Pick a stadium or type a new one',
}) => {
    const [stadiums, setStadiums] = useState([]);

    useEffect(() => {
        let active = true;
        getStadiums()
            .then((loaded) => active && setStadiums(loaded))
            .catch(() => {});
        return () => {
            active = false;
        };
    }, []);

    const options = useMemo(
        () => [...stadiums].sort((a, b) => groupOf(a).localeCompare(groupOf(b)) || a.name.localeCompare(b.name)),
        [stadiums]
    );
    const isNew = Boolean(value.trim()) && !stadiums.some((stadium) => stadium.name === value.trim());

    return (
        <Box>
            <Autocomplete
                freeSolo
                ListboxProps={{ sx: { maxHeight: 360, '& .MuiAutocomplete-option': { py: '6px', minHeight: 0 } } }}
                componentsProps={{ paper: { sx: { minWidth: 460 } }, popper: { placement: 'bottom-start' } }}
                disabled={disabled}
                options={options}
                groupBy={groupOf}
                getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
                inputValue={value}
                onInputChange={(_, next) => onChange(next || '')}
                renderOption={({ key, ...props }, stadium) => (
                    <Box component="li" key={key} {...props}>
                        <StadiumOption stadium={stadium} />
                    </Box>
                )}
                filterOptions={(candidates, { inputValue }) => {
                    const query = inputValue.trim().toLowerCase();
                    return query ? candidates.filter((stadium) => searchTextOf(stadium).includes(query)) : candidates;
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 'var(--r-sm)' } }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        size="small"
                        placeholder={placeholder}
                        error={error}
                        helperText={
                            helperText || (isNew ? 'New stadium: it will be added with the standard design.' : ' ')
                        }
                    />
                )}
            />
            {isNew && <StadiumSuggestions typed={value} stadiums={stadiums} onPick={onChange} />}
        </Box>
    );
};

VenueField.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    error: PropTypes.bool,
    helperText: PropTypes.string,
    placeholder: PropTypes.string,
};

export default VenueField;
