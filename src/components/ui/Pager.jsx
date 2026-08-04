import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const range = (start, end) => Array.from({ length: end - start + 1 }, (_, index) => start + index);

const pageItems = (current, pageCount) => {
    if (pageCount <= 7) return range(1, pageCount);
    const items = [1];
    const start = Math.max(2, current);
    const end = Math.min(pageCount - 1, current + 2);
    if (start > 2) items.push('start-gap');
    items.push(...range(start, end));
    if (end < pageCount - 1) items.push('end-gap');
    items.push(pageCount);
    return items;
};

const buttonSx = (active) => ({
    minWidth: 36,
    height: 36,
    px: 1,
    border: '1px solid var(--line)',
    background: active ? 'var(--brand-deep)' : 'var(--surface)',
    color: active ? '#fff' : 'var(--text-muted)',
    borderColor: active ? 'var(--brand-deep)' : 'var(--line)',
    borderRadius: 'var(--r-sm)',
    fontSize: '0.78rem',
    fontWeight: 700,
    cursor: 'pointer',
    '&:disabled': { opacity: 0.4, cursor: 'default' },
});

const Pager = ({ page, pageCount, onChange }) => {
    if (pageCount <= 1) return null;
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, mt: 2, flexWrap: 'wrap' }}>
            <Box component="button" type="button" disabled={page === 0} onClick={() => onChange(page - 1)} sx={buttonSx(false)}>Prev</Box>
            {pageItems(page + 1, pageCount).map((item) => (
                typeof item === 'number'
                    ? <Box key={item} component="button" type="button" onClick={() => onChange(item - 1)} sx={buttonSx(item === page + 1)}>{item}</Box>
                    : <Box key={item} component="span" sx={{ color: 'var(--text-dim)', px: 0.5 }}>…</Box>
            ))}
            <Box component="button" type="button" disabled={page >= pageCount - 1} onClick={() => onChange(page + 1)} sx={buttonSx(false)}>Next</Box>
        </Box>
    );
};

Pager.propTypes = {
    page: PropTypes.number.isRequired,
    pageCount: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default Pager;
