import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import FormField from './FormField';
import { inputSx } from '../../../styles/controls';

const ColorInput = ({ id, value, onChange, placeholder }) => (
    <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Box
            sx={{
                width: 32,
                height: 32,
                flexShrink: 0,
                borderRadius: 'var(--r-sm)',
                border: '1px solid var(--line)',
                background: value || 'transparent',
            }}
        />
        <Box
            component="input"
            id={id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            sx={inputSx}
        />
    </Box>
);

ColorInput.propTypes = {
    id: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
};

const ColorField = ({ label, value, onChange, placeholder = '#000000' }) => (
    <FormField label={label}>
        <ColorInput value={value} onChange={onChange} placeholder={placeholder} />
    </FormField>
);

ColorField.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
};

export default ColorField;
