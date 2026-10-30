import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import Pager from './Pager';
import StepPager from './StepPager';

const PagedFooter = ({ page, pageCount, pageSize, total, onChange, noun = 'rows', compact = false }) =>
    pageCount > 1 ? (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: compact ? 'nowrap' : 'wrap',
                gap: '8px',
                p: compact ? '6px 12px' : '10px 14px',
                borderTop: '1px solid var(--line-soft)',
            }}
        >
            <Box sx={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                {page * pageSize + 1}-{Math.min((page + 1) * pageSize, total)} of {total} {noun}
            </Box>
            {compact ? (
                <StepPager page={page} pageCount={pageCount} onChange={onChange} />
            ) : (
                <Pager page={page} pageCount={pageCount} onChange={onChange} />
            )}
        </Box>
    ) : null;

PagedFooter.propTypes = {
    page: PropTypes.number.isRequired,
    pageCount: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    noun: PropTypes.string,
    compact: PropTypes.bool,
};

export default PagedFooter;
