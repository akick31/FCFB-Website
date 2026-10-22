import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const renderOption = ({ value, label }) => <option key={value} value={value}>{label}</option>;

const SelectPill = ({ label, value, onChange, options, ariaLabel, sx }) => (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '34px', boxSizing: 'border-box', border: '1px solid var(--line)', background: 'var(--surface)', borderRadius: 'var(--r-sm)', padding: '0 10px', ...sx }}>
        {label && (
            <Box component="span" sx={{ color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: '0.04em' }}>
                {label}
            </Box>
        )}
        <Box
            component="select"
            aria-label={ariaLabel || label}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            sx={{ flex: 1, minWidth: 0, background: 'transparent', border: 0, color: 'var(--text)', font: 'inherit', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', outline: 'none', '& option': { background: 'var(--surface)', color: 'var(--text)' }, '& optgroup': { background: 'var(--surface)', color: 'var(--text-dim)', fontWeight: 800 } }}
        >
            {options.map((option) => (option.options
                ? <optgroup key={option.label} label={option.label}>{option.options.map(renderOption)}</optgroup>
                : renderOption(option)))}
        </Box>
    </Box>
);

SelectPill.propTypes = {
    label: PropTypes.node,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(PropTypes.oneOfType([
        PropTypes.shape({
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            label: PropTypes.node.isRequired,
        }),
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            options: PropTypes.array.isRequired,
        }),
    ])).isRequired,
    ariaLabel: PropTypes.string,
    sx: PropTypes.object,
};

export default SelectPill;
