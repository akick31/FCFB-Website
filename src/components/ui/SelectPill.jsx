import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const SelectPill = ({ label, value, onChange, options, ariaLabel }) => (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid var(--line)', background: 'var(--surface)', borderRadius: 'var(--r-sm)', padding: '6px 10px' }}>
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
            sx={{ background: 'transparent', border: 0, color: 'var(--text)', font: 'inherit', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', outline: 'none', '& option': { background: 'var(--surface)', color: 'var(--text)' } }}
        >
            {options.map(({ value: optionValue, label: optionLabel }) => (
                <option key={optionValue} value={optionValue}>{optionLabel}</option>
            ))}
        </Box>
    </Box>
);

SelectPill.propTypes = {
    label: PropTypes.node,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        label: PropTypes.node.isRequired,
    })).isRequired,
    ariaLabel: PropTypes.string,
};

export default SelectPill;
