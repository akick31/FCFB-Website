import React from 'react';
import { Box, ListSubheader, MenuItem, Select } from '@mui/material';
import PropTypes from 'prop-types';
import ConferenceName from './ConferenceName';

const ALL_VALUES = ['ALL', 'all', ''];

const flatten = (options) => options.flatMap((option) => (option.options ? option.options : [option]));

const optionLabel = (option) =>
    ALL_VALUES.includes(option.value) ? option.label : <ConferenceName code={option.value} label={option.label} />;

const ConferencePill = ({ label = 'Conference', value, onChange, options, ariaLabel, sx }) => {
    const selected = flatten(options).find((option) => option.value === value);
    return (
        <Box
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                height: '34px',
                boxSizing: 'border-box',
                border: '1px solid var(--line)',
                background: 'var(--surface)',
                borderRadius: 'var(--r-sm)',
                pl: '10px',
                maxWidth: '100%',
                minWidth: 0,
                ...sx,
            }}
        >
            {label && (
                <Box
                    component="span"
                    sx={{
                        color: 'var(--text-dim)',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        fontSize: '0.6rem',
                        letterSpacing: '0.04em',
                        flexShrink: 0,
                    }}
                >
                    {label}
                </Box>
            )}
            <Select
                variant="standard"
                disableUnderline
                value={value}
                onChange={(event) => onChange(event.target.value)}
                inputProps={{ 'aria-label': ariaLabel || label }}
                renderValue={() => (selected ? optionLabel(selected) : '')}
                MenuProps={{ PaperProps: { sx: { maxHeight: 420 } } }}
                sx={{
                    flex: 1,
                    minWidth: 0,
                    color: 'var(--text)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    '& .MuiSelect-select': { py: 0, pr: '28px !important', display: 'flex', alignItems: 'center' },
                    '& .MuiSelect-icon': { color: 'var(--text-muted)' },
                }}
            >
                {options.flatMap((option) =>
                    option.options
                        ? [
                              <ListSubheader key={`group-${option.label}`}>{option.label}</ListSubheader>,
                              ...option.options.map((child) => (
                                  <MenuItem key={child.value} value={child.value} sx={{ fontSize: '0.82rem' }}>
                                      {optionLabel(child)}
                                  </MenuItem>
                              )),
                          ]
                        : [
                              <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.82rem' }}>
                                  {optionLabel(option)}
                              </MenuItem>,
                          ]
                )}
            </Select>
        </Box>
    );
};

const optionShape = PropTypes.shape({ value: PropTypes.string, label: PropTypes.node });

ConferencePill.propTypes = {
    label: PropTypes.string,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(
        PropTypes.oneOfType([
            optionShape,
            PropTypes.shape({ label: PropTypes.string, options: PropTypes.arrayOf(optionShape) }),
        ])
    ).isRequired,
    ariaLabel: PropTypes.string,
    sx: PropTypes.object,
};

export default ConferencePill;
