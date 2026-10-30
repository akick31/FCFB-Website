import React from 'react';
import PropTypes from 'prop-types';
import FormField from './FormField';
import NumberInput from '../../ui/NumberInput';

const NumberField = ({ label, value, onChange, fallback = 0 }) => (
    <FormField label={label}>
        <NumberInput
            value={value ?? fallback}
            onChange={(next) => onChange(Math.round(next) || fallback)}
            min={0}
            ariaLabel={label}
        />
    </FormField>
);

NumberField.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    onChange: PropTypes.func.isRequired,
    fallback: PropTypes.number,
};

export default NumberField;
