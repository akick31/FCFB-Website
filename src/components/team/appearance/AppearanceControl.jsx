import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import Toggle from '../../ui/Toggle';
import LogoUrlField from '../../admin/LogoUrlField';

const inputSx = { width: '100%', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.85rem' };
const clearSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '10px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' } };

const ColorControl = ({ value, onChange, clearable, disabled }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Box
            component="input"
            type="color"
            disabled={disabled}
            value={value || '#000000'}
            onChange={(event) => onChange(event.target.value.toUpperCase())}
            sx={{ width: 42, height: 38, p: '2px', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', background: 'var(--surface-2)', cursor: disabled ? 'default' : 'pointer', opacity: value ? 1 : 0.35 }}
        />
        <Box component="input" disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} placeholder={clearable ? 'Not set' : '#RRGGBB'} sx={inputSx} />
        {clearable && value && !disabled && (
            <Box component="button" type="button" onClick={() => onChange('')} sx={clearSx}>Clear</Box>
        )}
    </Box>
);

ColorControl.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    clearable: PropTypes.bool,
    disabled: PropTypes.bool,
};

const AppearanceControl = ({ definition, value, onChange, disabled }) => {
    switch (definition.type) {
        case 'color':
            return <ColorControl value={value} onChange={onChange} disabled={disabled} />;
        case 'optionalColor':
            return <ColorControl value={value} onChange={onChange} clearable disabled={disabled} />;
        case 'select':
            return (
                <Box component="select" disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} sx={inputSx}>
                    {definition.options.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </Box>
            );
        case 'toggle':
            return <Toggle on={value} onClick={() => onChange(!value)} disabled={disabled} />;
        case 'logo':
            return <LogoUrlField label="" value={value} onChange={(event) => onChange(event.target.value)} />;
        default:
            return <Box component="input" disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} placeholder={definition.placeholder} sx={inputSx} />;
    }
};

AppearanceControl.propTypes = {
    definition: PropTypes.object.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};

export default AppearanceControl;
