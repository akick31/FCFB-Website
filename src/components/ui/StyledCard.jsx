import React from 'react';
import { Card, CardContent, useTheme } from '@mui/material';
import PropTypes from 'prop-types';

const StyledCard = ({ 
    children, 
    elevation = 2, 
    hover = true, 
    padding = 3,
    background = 'background.paper',
    border = false,
    onClick,
    sx = {},
    ...props 
}) => {
    const theme = useTheme();

    return (
        <Card
            elevation={elevation}
            onClick={onClick}
            sx={{
                background,
                borderRadius: 3,
                border: border ? `1px solid ${theme.palette.divider}` : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: onClick ? 'pointer' : 'default',
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: theme.custom?.gradients?.primary || theme.palette.primary.main,
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                },
                ...(hover && {
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[8],
                        '&::before': {
                            opacity: 1,
                        },
                    },
                }),
                ...sx,
            }}
            {...props}
        >
            <CardContent sx={{ p: padding, '&:last-child': { pb: padding } }}>
                {children}
            </CardContent>
        </Card>
    );
};

StyledCard.propTypes = {
    children: PropTypes.node.isRequired,
    elevation: PropTypes.number,
    hover: PropTypes.bool,
    padding: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.object,
        PropTypes.array
    ]),
    background: PropTypes.string,
    border: PropTypes.bool,
    onClick: PropTypes.func,
    sx: PropTypes.object,
};

export default StyledCard; 