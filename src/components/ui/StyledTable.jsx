import React from 'react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    Typography,
    Box,
    useTheme,
    useMediaQuery
} from '@mui/material';
import PropTypes from 'prop-types';

const StyledTable = ({ 
    columns, 
    data, 
    title,
    subtitle,
    maxHeight = 400,
    stickyHeader = true,
    showHeader = true,
    onRowClick,
    sx = {},
    ...props 
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleRowClick = (row, index) => {
        if (onRowClick) {
            onRowClick(row, index);
        }
    };

    return (
        <Box sx={{ width: '100%', ...sx }}>
            {(title || subtitle) && (
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                    {title && (
                        <Typography
                            variant={isMobile ? 'h5' : 'h4'}
                            sx={{
                                fontWeight: 700,
                                color: 'text.primary',
                                mb: subtitle ? 1 : 0,
                            }}
                        >
                            {title}
                        </Typography>
                    )}
                    {subtitle && (
                        <Typography
                            variant="body1"
                            sx={{
                                color: 'text.secondary',
                                maxWidth: 600,
                                mx: 'auto',
                            }}
                        >
                            {subtitle}
                        </Typography>
                    )}
                </Box>
            )}
            
            <TableContainer
                sx={{
                    borderRadius: 0,
                    border: 'none',
                    boxShadow: 'none',
                    overflow: 'visible',
                    backgroundColor: 'transparent',
                }}
            >
                <Table
                    stickyHeader={stickyHeader}
                    sx={{
                        minWidth: 650,
                        '& .MuiTableCell-root': {
                            borderBottom: `1px solid ${theme.palette.divider}`,
                        },
                    }}
                    {...props}
                >
                    {showHeader && (
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        align={column.align || 'left'}
                                        sx={{
                                            backgroundColor: theme.palette.background.paper,
                                            fontWeight: 700,
                                            color: 'text.primary',
                                            fontSize: '0.875rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            py: 2,
                                            px: 3,
                                            borderBottom: `2px solid ${theme.palette.primary.main}`,
                                        }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                    )}
                    <TableBody>
                        {data.map((row, index) => (
                            <TableRow
                                key={index}
                                onClick={() => handleRowClick(row, index)}
                                sx={{
                                    cursor: onRowClick ? 'pointer' : 'default',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: onRowClick 
                                            ? `${theme.palette.primary.main}08`
                                            : 'transparent',
                                        transform: onRowClick ? 'scale(1.01)' : 'none',
                                    },
                                    '&:nth-of-type(even)': {
                                        backgroundColor: `${theme.palette.background.default}50`,
                                    },
                                }}
                            >
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        align={column.align || 'left'}
                                        sx={{
                                            py: 2,
                                            px: 3,
                                            fontSize: '0.875rem',
                                            color: 'text.primary',
                                            fontWeight: column.id === 'name' || column.id === 'team' ? 600 : 400,
                                        }}
                                    >
                                        {column.render ? column.render(row[column.id], row) : row[column.id]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

StyledTable.propTypes = {
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            align: PropTypes.oneOf(['left', 'right', 'center']),
            render: PropTypes.func,
        })
    ).isRequired,
    data: PropTypes.array.isRequired,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    maxHeight: PropTypes.number,
    stickyHeader: PropTypes.bool,
    showHeader: PropTypes.bool,
    onRowClick: PropTypes.func,
    sx: PropTypes.object,
};

export default StyledTable; 