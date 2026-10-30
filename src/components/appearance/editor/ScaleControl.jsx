import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const ScaleControl = ({ definition, value, onChange, disabled }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Box
            component="input"
            type="range"
            disabled={disabled}
            min={definition.min}
            max={definition.max}
            step={definition.step}
            value={value}
            onChange={(event) => onChange(Number(event.target.value))}
            sx={{ flex: 1, accentColor: 'var(--brand)' }}
        />
        <Box
            sx={{
                width: 48,
                textAlign: 'right',
                fontVariantNumeric: 'tabular-nums',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
            }}
        >
            {Number(value).toFixed(definition.decimals ?? 2)}
            {definition.unit ?? 'x'}
        </Box>
    </Box>
);

ScaleControl.propTypes = {
    definition: PropTypes.object.isRequired,
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};

export default ScaleControl;
