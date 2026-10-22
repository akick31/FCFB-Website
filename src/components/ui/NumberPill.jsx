import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const stepperSx = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    flexShrink: 0,
    border: '1px solid var(--line)',
    borderRadius: 'var(--r-sm)',
    background: 'var(--surface-2)',
    color: 'var(--text-muted)',
    font: 'inherit',
    fontSize: '0.8rem',
    fontWeight: 800,
    lineHeight: 1,
    cursor: 'pointer',
    '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' },
    '&:focus-visible': { outline: '2px solid var(--brand)', outlineOffset: '1px' },
};

const NumberPill = ({ label, value, onChange, min = 0, max, step = 1, ariaLabel, sx }) => {
    const commit = (next) => onChange(Math.min(max ?? Infinity, Math.max(min, next)));
    const stepTo = (direction) => {
        const steps = value / step;
        const target = direction > 0 ? (Math.floor(steps) + 1) * step : (Math.ceil(steps) - 1) * step;
        commit(target);
    };

    return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '34px', boxSizing: 'border-box', border: '1px solid var(--line)', background: 'var(--surface)', borderRadius: 'var(--r-sm)', padding: '0 10px', ...sx }}>
            {label && (
                <Box component="span" sx={{ color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: '0.04em' }}>
                    {label}
                </Box>
            )}
            <Box component="button" type="button" aria-label={`Decrease ${ariaLabel || label}`} onClick={() => stepTo(-1)} sx={stepperSx}>-</Box>
            <Box
                component="input"
                type="number"
                inputMode="numeric"
                aria-label={ariaLabel || label}
                value={value}
                min={min}
                step={step}
                onChange={(event) => {
                    const parsed = parseInt(event.target.value, 10);
                    commit(Number.isFinite(parsed) ? parsed : min);
                }}
                sx={{
                    width: 54,
                    background: 'transparent',
                    border: 0,
                    color: 'var(--text)',
                    font: 'inherit',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    fontVariantNumeric: 'tabular-nums',
                    textAlign: 'center',
                    outline: 'none',
                    MozAppearance: 'textfield',
                    '&::-webkit-outer-spin-button': { WebkitAppearance: 'none', margin: 0 },
                    '&::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 },
                }}
            />
            <Box component="button" type="button" aria-label={`Increase ${ariaLabel || label}`} onClick={() => stepTo(1)} sx={stepperSx}>+</Box>
        </Box>
    );
};

NumberPill.propTypes = {
    label: PropTypes.node,
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    ariaLabel: PropTypes.string,
    sx: PropTypes.object,
};

export default NumberPill;
