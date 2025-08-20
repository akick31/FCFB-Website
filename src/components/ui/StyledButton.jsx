import React from 'react';
import { Button, useTheme } from '@mui/material';
import PropTypes from 'prop-types';

const StyledButton = ({ 
    children, 
    variant = 'contained',
    size = 'medium',
    color = 'primary',
    fullWidth = false,
    disabled = false,
    startIcon,
    endIcon,
    onClick,
    href,
    sx = {},
    ...props 
}) => {
    const theme = useTheme();

    const getButtonStyles = () => {
        const baseStyles = {
            borderRadius: 2,
            fontWeight: 600,
            textTransform: 'none',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                transition: 'left 0.5s',
            },
            '&:hover::before': {
                left: '100%',
            },
        };

        if (variant === 'contained') {
            return {
                ...baseStyles,
                background: color === 'primary' 
                    ? theme.custom?.gradients?.primary 
                    : color === 'secondary'
                    ? theme.custom?.gradients?.secondary
                    : theme.palette[color]?.main,
                color: 'white',
                boxShadow: theme.shadows[4],
                '&:hover': {
                    background: color === 'primary' 
                        ? theme.custom?.gradients?.primary 
                        : color === 'secondary'
                        ? theme.custom?.gradients?.secondary
                        : theme.palette[color]?.dark,
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[8],
                },
                '&:active': {
                    transform: 'translateY(0)',
                },
            };
        }

        if (variant === 'outlined') {
            return {
                ...baseStyles,
                border: `2px solid ${theme.palette[color]?.main}`,
                color: theme.palette[color]?.main,
                background: 'transparent',
                '&:hover': {
                    background: theme.palette[color]?.main,
                    color: 'white',
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4],
                },
            };
        }

        if (variant === 'text') {
            return {
                ...baseStyles,
                color: theme.palette[color]?.main,
                background: 'transparent',
                '&:hover': {
                    background: `${theme.palette[color]?.main}10`,
                    transform: 'translateY(-1px)',
                },
            };
        }

        return baseStyles;
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return { px: 2, py: 1, fontSize: '0.875rem' };
            case 'large':
                return { px: 4, py: 2, fontSize: '1.125rem' };
            default:
                return { px: 3, py: 1.5, fontSize: '1rem' };
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            color={color}
            fullWidth={fullWidth}
            disabled={disabled}
            startIcon={startIcon}
            endIcon={endIcon}
            onClick={onClick}
            href={href}
            sx={{
                ...getButtonStyles(),
                ...getSizeStyles(),
                ...sx,
            }}
            {...props}
        >
            {children}
        </Button>
    );
};

StyledButton.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['contained', 'outlined', 'text']),
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    color: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error', 'info']),
    fullWidth: PropTypes.bool,
    disabled: PropTypes.bool,
    startIcon: PropTypes.node,
    endIcon: PropTypes.node,
    onClick: PropTypes.func,
    href: PropTypes.string,
    sx: PropTypes.object,
};

export default StyledButton; 