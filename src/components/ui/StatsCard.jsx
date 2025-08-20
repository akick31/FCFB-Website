import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import PropTypes from 'prop-types';

const StatsCard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    color = 'primary',
    trend = null,
    trendDirection = 'up',
    size = 'medium',
    sx = {}
}) => {
    const theme = useTheme();

    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return {
                    padding: 2,
                    iconSize: 24,
                    titleVariant: 'body2',
                    valueVariant: 'h6',
                    subtitleVariant: 'caption',
                };
            case 'large':
                return {
                    padding: 4,
                    iconSize: 48,
                    titleVariant: 'h6',
                    valueVariant: 'h3',
                    subtitleVariant: 'body2',
                };
            default:
                return {
                    padding: 3,
                    iconSize: 32,
                    titleVariant: 'body1',
                    valueVariant: 'h5',
                    subtitleVariant: 'body2',
                };
        }
    };

    const sizeStyles = getSizeStyles();

    const getColorValue = () => {
        if (color === 'primary') return theme.palette.primary.main;
        if (color === 'secondary') return theme.palette.secondary.main;
        if (color === 'success') return theme.palette.success.main;
        if (color === 'warning') return theme.palette.warning.main;
        if (color === 'error') return theme.palette.error.main;
        return theme.palette[color]?.main || theme.palette.primary.main;
    };

    const getTrendColor = () => {
        if (trendDirection === 'up') return theme.palette.success.main;
        if (trendDirection === 'down') return theme.palette.error.main;
        return theme.palette.text.secondary;
    };

    return (
        <Box
            sx={{
                background: 'background.paper',
                borderRadius: 3,
                padding: sizeStyles.padding,
                border: `1px solid ${theme.palette.divider}`,
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: getColorValue(),
                    opacity: 0.8,
                },
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                    '&::before': {
                        opacity: 1,
                    },
                },
                ...sx,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                    <Typography
                        variant={sizeStyles.titleVariant}
                        sx={{
                            color: 'text.secondary',
                            fontWeight: 500,
                            mb: 1,
                        }}
                    >
                        {title}
                    </Typography>
                    <Typography
                        variant={sizeStyles.valueVariant}
                        sx={{
                            color: 'text.primary',
                            fontWeight: 700,
                            lineHeight: 1.2,
                        }}
                    >
                        {value}
                    </Typography>
                    {subtitle && (
                        <Typography
                            variant={sizeStyles.subtitleVariant}
                            sx={{
                                color: 'text.secondary',
                                mt: 1,
                            }}
                        >
                            {subtitle}
                        </Typography>
                    )}
                    {trend && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Box
                                component="span"
                                sx={{
                                    color: getTrendColor(),
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                }}
                            >
                                {trendDirection === 'up' ? '↗' : trendDirection === 'down' ? '↘' : '→'}
                                {trend}
                            </Box>
                        </Box>
                    )}
                </Box>
                {icon && (
                    <Box
                        sx={{
                            color: getColorValue(),
                            opacity: 0.8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: sizeStyles.iconSize,
                            height: sizeStyles.iconSize,
                            borderRadius: '50%',
                            background: `${getColorValue()}15`,
                            flexShrink: 0,
                        }}
                    >
                        {React.cloneElement(icon, { 
                            sx: { fontSize: sizeStyles.iconSize * 0.6 } 
                        })}
                    </Box>
                )}
            </Box>
        </Box>
    );
};

StatsCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    subtitle: PropTypes.string,
    icon: PropTypes.node,
    color: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error', 'info']),
    trend: PropTypes.string,
    trendDirection: PropTypes.oneOf(['up', 'down', 'neutral']),
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    sx: PropTypes.object,
};

export default StatsCard; 