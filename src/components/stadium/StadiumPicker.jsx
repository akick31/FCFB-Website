import React, { useEffect, useMemo, useState } from 'react';
import { Autocomplete, Box, TextField } from '@mui/material';
import PropTypes from 'prop-types';
import StadiumOption from './StadiumOption';
import { isTeamStadium, searchTextOf } from './stadiumUsage';
import { getStadiums } from '../../api/stadiumApi';

export const BUILD_NEW = '__build_new__';

const NONE = '';
const groupOf = (option) => {
    if (option.special) {
        return '';
    }
    return isTeamStadium(option) ? 'Team stadiums' : 'Neutral sites';
};
const unlisted = (name) => ({ name, teams: [], bowls: [], conferences: [], playoff_rounds: [] });

const StadiumPicker = ({
    value,
    onChange,
    allowNone = false,
    noneLabel = 'Standard stadium',
    allowBuild = false,
    disabled = false,
    ariaLabel = 'Stadium',
    exclude,
}) => {
    const [stadiums, setStadiums] = useState([]);

    useEffect(() => {
        let active = true;
        getStadiums()
            .then((loaded) => active && setStadiums(loaded))
            .catch(() => active && setStadiums([]));
        return () => {
            active = false;
        };
    }, []);

    const options = useMemo(() => {
        const listed = stadiums
            .filter((stadium) => stadium.name !== exclude)
            .sort((a, b) => groupOf(a).localeCompare(groupOf(b)) || a.name.localeCompare(b.name));
        const current =
            value && value !== BUILD_NEW && !listed.some((stadium) => stadium.name === value) ? [unlisted(value)] : [];
        return [
            ...(allowNone ? [{ special: true, name: NONE, label: noneLabel }] : []),
            ...(allowBuild ? [{ special: true, name: BUILD_NEW, label: 'Build a new stadium…' }] : []),
            ...current,
            ...listed,
        ];
    }, [stadiums, exclude, value, allowNone, noneLabel, allowBuild]);

    const selected = options.find((option) => option.name === (value || NONE)) || null;

    return (
        <Autocomplete
            options={options}
            value={selected}
            onChange={(_, option) => onChange(option ? option.name : NONE)}
            groupBy={groupOf}
            getOptionLabel={(option) => (option.special ? option.label : option.name)}
            isOptionEqualToValue={(option, chosen) => option.name === chosen.name}
            filterOptions={(candidates, { inputValue }) => {
                const query = inputValue.trim().toLowerCase();
                return query
                    ? candidates.filter((option) => !option.special && searchTextOf(option).includes(query))
                    : candidates;
            }}
            disableClearable={!allowNone}
            ListboxProps={{ sx: { maxHeight: 360, '& .MuiAutocomplete-option': { py: '6px', minHeight: 0 } } }}
            componentsProps={{ paper: { sx: { minWidth: 460 } }, popper: { placement: 'bottom-start' } }}
            disabled={disabled}
            size="small"
            renderOption={({ key, ...props }, option) => (
                <Box component="li" key={key} {...props}>
                    {option.special ? (
                        <Box sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{option.label}</Box>
                    ) : (
                        <StadiumOption stadium={option} />
                    )}
                </Box>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    placeholder="Search stadiums, teams or cities"
                    inputProps={{ ...params.inputProps, 'aria-label': ariaLabel }}
                />
            )}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 'var(--r-sm)' } }}
        />
    );
};

StadiumPicker.propTypes = {
    exclude: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    allowNone: PropTypes.bool,
    noneLabel: PropTypes.string,
    allowBuild: PropTypes.bool,
    disabled: PropTypes.bool,
    ariaLabel: PropTypes.string,
};

export default StadiumPicker;
