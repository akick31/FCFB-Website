import React, { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import StepPager from './StepPager';
import useFitCount from '../../hooks/useFitCount';
import { chunkPages } from '../../utils/paging';

const FOOTER_HEIGHT = 41;

const FitPagedList = ({ rows, renderRow, rowHeight = 34, minRows = 3, noun, resetKey, paginate = chunkPages }) => {
    const [fitRef, pageSize] = useFitCount({
        itemSelector: '[data-fit-row]',
        rowHeight,
        minRows,
        initialRows: 8,
        phoneCount: 8,
        resetKey,
        ownBottom: true,
        reserveBelow: FOOTER_HEIGHT,
    });
    const pages = useMemo(() => paginate(rows, pageSize), [paginate, rows, pageSize]);
    const [page, setPage] = useState(0);
    useEffect(() => setPage(0), [resetKey]);
    const shownPage = Math.min(page, pages.length - 1);
    const pageRows = pages[shownPage] || [];
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <Box ref={fitRef}>
                {pageRows.map((row, index) => (
                    <Box key={row.key} data-fit-row>
                        {renderRow(row, index, pageRows)}
                    </Box>
                ))}
            </Box>
            <Box
                sx={{
                    mt: 'auto',
                    height: FOOTER_HEIGHT,
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    px: '12px',
                    borderTop: '1px solid var(--line-soft)',
                    fontSize: '0.76rem',
                    color: 'var(--text-dim)',
                }}
            >
                <span>
                    {rows.length} {noun}
                    {pages.length > 1 ? `, page ${shownPage + 1} of ${pages.length}` : ''}
                </span>
                {pages.length > 1 && <StepPager page={shownPage} pageCount={pages.length} onChange={setPage} />}
            </Box>
        </Box>
    );
};

FitPagedList.propTypes = {
    rows: PropTypes.arrayOf(PropTypes.shape({ key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) }))
        .isRequired,
    renderRow: PropTypes.func.isRequired,
    rowHeight: PropTypes.number,
    minRows: PropTypes.number,
    noun: PropTypes.string,
    resetKey: PropTypes.string,
    paginate: PropTypes.func,
};

export default FitPagedList;
