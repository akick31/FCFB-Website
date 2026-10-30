import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';
import ScrollFade from './ScrollFade';
import useScrollFade from '../../hooks/useScrollFade';

const HOVER = 'color-mix(in srgb, var(--brand) 7%, var(--surface))';

const DataTable = ({ minWidth = 600, phoneMinWidth, tableLayout = 'auto', dense = false, children }) => {
    const { ref, edges } = useScrollFade();
    return (
        <Box
            sx={{
                position: 'relative',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-lg)',
                background: 'var(--surface)',
                overflow: 'hidden',
            }}
        >
            <ScrollFade edges={edges} />
            <Box ref={ref} sx={{ overflowX: 'auto', overflowY: 'hidden' }}>
                <Box
                    component="table"
                    sx={{
                        borderCollapse: 'collapse',
                        width: '100%',
                        minWidth: { xs: phoneMinWidth ?? minWidth, sm: minWidth },
                        tableLayout,
                        fontSize: '0.85rem',
                        color: 'var(--text)',
                        '& thead th': {
                            position: 'sticky',
                            top: 0,
                            background: 'var(--surface-2)',
                            textAlign: 'right',
                            padding: '10px 12px',
                            fontSize: '0.62rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: 'var(--text-dim)',
                            fontWeight: 800,
                            borderBottom: '1px solid var(--line)',
                            whiteSpace: 'nowrap',
                            zIndex: 1,
                        },
                        '& th.lft, & td.lft': { textAlign: 'left' },
                        '& .wide': { display: { xs: 'none', sm: 'table-cell' } },
                        ...(tableLayout === 'fixed' && {
                            '& td': { overflow: 'hidden', textOverflow: 'ellipsis' },
                        }),
                        '& td': {
                            padding: dense ? '5px 12px' : '9px 12px',
                            borderBottom: '1px solid var(--line-soft)',
                            textAlign: 'right',
                            whiteSpace: 'nowrap',
                        },
                        '& tbody tr': { cursor: 'pointer' },
                        '& tbody tr:hover': { background: HOVER },
                        '& .stick': {
                            position: 'sticky',
                            left: 0,
                            background: 'var(--surface)',
                            borderRight: '1px solid var(--line)',
                            zIndex: 2,
                        },
                        '& thead .stick': { zIndex: 3, background: 'var(--surface-2)' },
                        '& tbody tr:hover .stick': { background: HOVER },
                        '& .num': { fontVariantNumeric: 'tabular-nums' },
                        '& .teamcell': { display: 'flex', alignItems: 'center', gap: '9px' },
                        '& .teamcell .rk': {
                            color: 'var(--text-dim)',
                            fontWeight: 800,
                            minWidth: 22,
                            textAlign: 'right',
                        },
                        '& .teamcell .nm': { fontWeight: 700 },
                        '& .teamcell .cf': { color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: 600 },
                        '& .up': { color: 'var(--field)' },
                        '& .down': { color: 'var(--live)' },
                        '& .flat': { color: 'var(--text-dim)' },
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

DataTable.propTypes = {
    minWidth: PropTypes.number,
    phoneMinWidth: PropTypes.number,
    tableLayout: PropTypes.string,
    dense: PropTypes.bool,
    children: PropTypes.node.isRequired,
};

export default DataTable;
