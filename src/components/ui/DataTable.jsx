import React from 'react';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const HOVER = 'color-mix(in srgb, var(--brand) 7%, var(--surface))';

const DataTable = ({ minWidth = 600, children }) => (
    <Box sx={{ border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', overflowX: 'auto', background: 'var(--surface)' }}>
        <Box
            component="table"
            sx={{
                borderCollapse: 'collapse',
                width: '100%',
                minWidth,
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
                '& td': { padding: '9px 12px', borderBottom: '1px solid var(--line-soft)', textAlign: 'right', whiteSpace: 'nowrap' },
                '& tbody tr': { cursor: 'pointer' },
                '& tbody tr:hover': { background: HOVER },
                '& .stick': { position: 'sticky', left: 0, background: 'var(--surface)', borderRight: '1px solid var(--line)', zIndex: 2 },
                '& thead .stick': { zIndex: 3, background: 'var(--surface-2)' },
                '& tbody tr:hover .stick': { background: HOVER },
                '& .num': { fontVariantNumeric: 'tabular-nums' },
                '& .teamcell': { display: 'flex', alignItems: 'center', gap: '9px' },
                '& .teamcell .rk': { color: 'var(--text-dim)', fontWeight: 800, minWidth: 22, textAlign: 'right' },
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
);

DataTable.propTypes = {
    minWidth: PropTypes.number,
    children: PropTypes.node.isRequired,
};

export default DataTable;
