import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';

const TableMessageRow = ({ colSpan, loading = false, children }) => (
    <tr>
        <Box
            component="td"
            colSpan={colSpan}
            sx={{ textAlign: 'center !important', color: 'var(--text-muted)', py: 4 }}
        >
            {loading ? <CircularProgress size={22} aria-label="Loading" /> : children}
        </Box>
    </tr>
);

TableMessageRow.propTypes = {
    colSpan: PropTypes.number.isRequired,
    loading: PropTypes.bool,
    children: PropTypes.node,
};

export default TableMessageRow;
