import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import FormField from './FormField';
import { inputSx } from '../../../styles/controls';

const TextInputField = ({ label, value, onChange, placeholder }) => (
    <FormField label={label}>
        <Box
            component="input"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            sx={inputSx}
        />
    </FormField>
);

TextInputField.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
};

export default TextInputField;
