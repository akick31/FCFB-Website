import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const Toggle = ({ on, onClick }) => (
    <Box
        onClick={onClick}
        role="switch"
        aria-checked={on}
        sx={{
            width: 40, height: 22, borderRadius: 99, flexShrink: 0, cursor: 'pointer', position: 'relative',
            background: on ? 'color-mix(in srgb, var(--brand) 45%, var(--surface))' : 'var(--surface-raise)',
            border: '1px solid', borderColor: on ? 'var(--brand)' : 'var(--line)',
            '&::after': {
                content: '""', position: 'absolute', top: 1, left: on ? 19 : 1, width: 16, height: 16, borderRadius: '50%',
                background: on ? 'var(--brand)' : 'var(--text-dim)', transition: 'left 0.15s, background 0.15s',
            },
        }}
    />
);

Toggle.propTypes = { on: PropTypes.bool, onClick: PropTypes.func.isRequired };

export default Toggle;
