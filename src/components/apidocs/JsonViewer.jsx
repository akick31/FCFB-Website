import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const JsonViewer = ({ value, sx }) => (
    <Box
        component="pre"
        sx={{
            m: 0,
            p: '12px',
            overflowX: 'auto',
            border: '1px solid var(--line)',
            background: 'var(--surface-2)',
            color: 'var(--text)',
            borderRadius: 'var(--r-sm)',
            fontSize: '0.78rem',
            lineHeight: 1.5,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            ...sx,
        }}
    >
        {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
    </Box>
);

JsonViewer.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array]),
    sx: PropTypes.object,
};

export default JsonViewer;
