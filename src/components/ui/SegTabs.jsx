import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const SegTabs = ({ value, onChange, options, ariaLabel }) => (
    <Box
        role="tablist"
        aria-label={ariaLabel}
        sx={{
            display: 'inline-flex',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-sm)',
            overflow: 'hidden',
            '& button': {
                background: 'var(--surface)',
                border: 0,
                color: 'var(--text-muted)',
                font: 'inherit',
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '8px 15px',
                cursor: 'pointer',
                borderRight: '1px solid var(--line-soft)',
                whiteSpace: 'nowrap',
            },
            '& button:last-of-type': { borderRight: 0 },
            '& button.on': { background: 'var(--brand-deep)', color: '#fff' },
            '& button:not(.on):hover': { background: 'var(--surface-2)' },
        }}
    >
        {options.map(({ value: optionValue, label }) => (
            <button
                key={optionValue}
                type="button"
                role="tab"
                aria-selected={value === optionValue}
                className={value === optionValue ? 'on' : ''}
                onClick={() => onChange(optionValue)}
            >
                {label}
            </button>
        ))}
    </Box>
);

SegTabs.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.node.isRequired,
    })).isRequired,
    ariaLabel: PropTypes.string,
};

export default SegTabs;
