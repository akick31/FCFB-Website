import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const Toggle = ({ on, onClick, disabled = false }) => (
    <Box
        onClick={disabled ? undefined : onClick}
        onKeyDown={disabled ? undefined : (event) => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onClick(event); }
        }}
        role="switch"
        tabIndex={disabled ? -1 : 0}
        aria-checked={on}
        aria-disabled={disabled}
        sx={{
            width: 40, height: 22, borderRadius: 99, flexShrink: 0, cursor: disabled ? 'default' : 'pointer', position: 'relative',
            opacity: disabled ? 0.45 : 1,
            background: on ? 'color-mix(in srgb, var(--brand) 45%, var(--surface))' : 'var(--surface-raise)',
            border: '1px solid', borderColor: on ? 'var(--brand)' : 'var(--line)',
            '&:focus-visible': { outline: '2px solid var(--brand)', outlineOffset: '2px' },
            '&::after': {
                content: '""', position: 'absolute', top: 1, left: on ? 19 : 1, width: 16, height: 16, borderRadius: '50%',
                background: on ? 'var(--brand)' : 'var(--text-dim)', transition: 'left 0.15s, background 0.15s',
            },
        }}
    />
);

Toggle.propTypes = { on: PropTypes.bool, onClick: PropTypes.func.isRequired, disabled: PropTypes.bool };

export default Toggle;
