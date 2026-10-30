import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import { CONTROL_HEIGHT } from '../../styles/controls';

const stepSx = {
    flex: '0 0 30px',
    alignSelf: 'stretch',
    border: 0,
    background: 'transparent',
    color: 'var(--text-muted)',
    font: 'inherit',
    fontSize: '1rem',
    fontWeight: 800,
    cursor: 'pointer',
    '&:hover:not(:disabled)': { color: 'var(--text)', background: 'var(--surface)' },
    '&:disabled': { opacity: 0.35, cursor: 'default' },
};

const clamp = (value, min, max) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, value));

const NumberInput = ({ id, value, onChange, min, max, step = 1, ariaLabel, disabled = false, sx }) => {
    const numeric = Number(value) || 0;
    const commit = (next) => onChange(clamp(next, min, max));
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                height: CONTROL_HEIGHT,
                boxSizing: 'border-box',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-sm)',
                background: 'var(--surface-2)',
                overflow: 'hidden',
                opacity: disabled ? 0.6 : 1,
                '&:focus-within': { outline: '2px solid var(--brand)', outlineOffset: '-1px' },
                ...sx,
            }}
        >
            <Box
                component="button"
                type="button"
                tabIndex={-1}
                aria-label={`Decrease ${ariaLabel || ''}`.trim()}
                disabled={disabled || (min != null && numeric <= min)}
                onClick={() => commit(numeric - step)}
                sx={{ ...stepSx, borderRight: '1px solid var(--line-soft)' }}
            >
                −
            </Box>
            <Box
                component="input"
                id={id}
                type="number"
                inputMode="numeric"
                aria-label={ariaLabel}
                value={value ?? ''}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                onChange={(event) => {
                    const parsed = parseFloat(event.target.value);
                    onChange(Number.isNaN(parsed) ? '' : clamp(parsed, min, max));
                }}
                sx={{
                    flex: 1,
                    minWidth: 0,
                    height: '100%',
                    border: 0,
                    background: 'transparent',
                    color: 'var(--text)',
                    font: 'inherit',
                    fontSize: '0.85rem',
                    textAlign: 'center',
                    outline: 'none',
                    fontVariantNumeric: 'tabular-nums',
                }}
            />
            <Box
                component="button"
                type="button"
                tabIndex={-1}
                aria-label={`Increase ${ariaLabel || ''}`.trim()}
                disabled={disabled || (max != null && numeric >= max)}
                onClick={() => commit(numeric + step)}
                sx={{ ...stepSx, borderLeft: '1px solid var(--line-soft)' }}
            >
                +
            </Box>
        </Box>
    );
};

NumberInput.propTypes = {
    id: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    onChange: PropTypes.func.isRequired,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    ariaLabel: PropTypes.string,
    disabled: PropTypes.bool,
    sx: PropTypes.object,
};

export default NumberInput;
