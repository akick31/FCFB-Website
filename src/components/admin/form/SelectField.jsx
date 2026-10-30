import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import FormField from './FormField';
import { selectSx } from '../../../styles/controls';

const SelectField = ({ label, value, onChange, options, disabled, title }) => (
    <FormField label={label}>
        <Box
            component="select"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            title={title}
            sx={selectSx}
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </Box>
    </FormField>
);

SelectField.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(
        PropTypes.shape({ value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), label: PropTypes.string })
    ).isRequired,
    disabled: PropTypes.bool,
    title: PropTypes.string,
};

export default SelectField;
