import React, { useMemo } from 'react';
import { Autocomplete, Box, InputAdornment, TextField } from '@mui/material';
import PropTypes from 'prop-types';
import TeamMark from './TeamMark';
import TeamName from './TeamName';

const NONE = '';

const TeamSelect = ({
    value,
    onChange,
    teams,
    ariaLabel,
    placeholder = 'Search teams',
    noneLabel,
    disabled = false,
    groupOf,
    exclude,
    detailOf,
    sx,
}) => {
    const options = useMemo(() => {
        const excluded = new Set([].concat(exclude || []).filter(Boolean));
        const names = [...new Set(teams.filter((name) => name && !excluded.has(name)))];
        const sorted = groupOf
            ? names.sort((a, b) => (groupOf(a) || '').localeCompare(groupOf(b) || '') || a.localeCompare(b))
            : names.sort((a, b) => a.localeCompare(b));
        return noneLabel != null ? [NONE, ...sorted] : sorted;
    }, [teams, noneLabel, groupOf, exclude]);

    const selected = value && options.includes(value) ? value : noneLabel != null ? NONE : null;

    return (
        <Autocomplete
            options={options}
            value={selected}
            onChange={(_, option) => onChange(option || NONE)}
            getOptionLabel={(option) => (option === NONE ? noneLabel || '' : option)}
            groupBy={groupOf ? (option) => (option === NONE ? '' : groupOf(option) || '') : undefined}
            disableClearable={noneLabel == null}
            disabled={disabled}
            size="small"
            ListboxProps={{ sx: { maxHeight: 360, '& .MuiAutocomplete-option': { py: '5px', minHeight: 0 } } }}
            renderOption={({ key, ...props }, option) => (
                <Box component="li" key={key} {...props}>
                    {option === NONE ? (
                        <Box sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{noneLabel}</Box>
                    ) : (
                        <>
                            <TeamName name={option} />
                            {detailOf?.(option) && (
                                <Box component="span" sx={{ ml: '8px', color: 'var(--text-dim)', fontSize: '0.74rem' }}>
                                    {detailOf(option)}
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    placeholder={placeholder}
                    inputProps={{ ...params.inputProps, 'aria-label': ariaLabel }}
                    InputProps={{
                        ...params.InputProps,
                        startAdornment: selected ? (
                            <InputAdornment position="start" sx={{ ml: '4px', mr: 0 }}>
                                <TeamMark team={{ name: selected }} size={20} decorative />
                            </InputAdornment>
                        ) : null,
                    }}
                />
            )}
            sx={{ minWidth: 0, '& .MuiOutlinedInput-root': { borderRadius: 'var(--r-sm)' }, ...sx }}
        />
    );
};

TeamSelect.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    teams: PropTypes.arrayOf(PropTypes.string).isRequired,
    ariaLabel: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    noneLabel: PropTypes.string,
    disabled: PropTypes.bool,
    groupOf: PropTypes.func,
    exclude: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    detailOf: PropTypes.func,
    sx: PropTypes.object,
};

export default TeamSelect;
