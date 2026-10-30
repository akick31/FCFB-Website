import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const stepSx = {
    width: 28,
    height: 28,
    border: '1px solid var(--line)',
    background: 'var(--surface)',
    color: 'var(--text-muted)',
    borderRadius: 'var(--r-sm)',
    font: 'inherit',
    fontSize: '0.9rem',
    fontWeight: 800,
    lineHeight: 1,
    cursor: 'pointer',
    '&:disabled': { opacity: 0.4, cursor: 'default' },
};

const StepPager = ({ page, pageCount, onChange }) => (
    <Box sx={{ display: 'flex', gap: '6px' }}>
        <Box
            component="button"
            type="button"
            aria-label="Previous page"
            disabled={page === 0}
            onClick={() => onChange(page - 1)}
            sx={stepSx}
        >
            ‹
        </Box>
        <Box
            component="button"
            type="button"
            aria-label="Next page"
            disabled={page >= pageCount - 1}
            onClick={() => onChange(page + 1)}
            sx={stepSx}
        >
            ›
        </Box>
    </Box>
);

StepPager.propTypes = {
    page: PropTypes.number.isRequired,
    pageCount: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default StepPager;
