import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';

/**
 * A <td> that's clickable across its whole area via a real anchor overlay.
 * Sizing the overlay against the <tr> instead breaks on mobile WebKit when the table
 * uses border-collapse: collapse, so each cell gets its own containing block instead.
 */
const LinkCell = ({ to, className, style, sx, children }) => (
    <Box component="td" className={className} style={style} sx={{ position: 'relative', ...sx }}>
        {children}
        {to != null && (
            <Box component={Link} to={to} tabIndex={-1} aria-hidden="true" sx={{ position: 'absolute', inset: 0 }} />
        )}
    </Box>
);

LinkCell.propTypes = {
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    className: PropTypes.string,
    style: PropTypes.object,
    sx: PropTypes.object,
    children: PropTypes.node,
};

export default LinkCell;
