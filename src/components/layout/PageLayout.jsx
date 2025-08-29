import React from 'react';
import { Box, Container, Typography, useTheme, useMediaQuery } from '@mui/material';
import PropTypes from 'prop-types';

const PageLayout = ({ 
    title, 
    subtitle, 
    children, 
    maxWidth = 'lg', 
    padding = { xs: 3, md: 4 },
    background = 'background.default',
    showHeader = true,
    fullWidth = false
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    if (fullWidth) {
        return (
            <Box sx={{ 
                minHeight: '100vh',
                background,
                pt: showHeader ? { xs: 2, md: 3 } : 0,
                pb: { xs: 4, md: 6 }
            }}>
                {children}
            </Box>
        );
    }

    return (
        <Box sx={{ 
            minHeight: '100vh',
            background,
            pt: showHeader ? { xs: 2, md: 3 } : 0,
            pb: { xs: 4, md: 6 }
        }}>
            <Container maxWidth={maxWidth} sx={{ px: padding }}>
                {showHeader && (title || subtitle) && (
                    <Box sx={{ 
                        textAlign: 'center', 
                        mb: { xs: 4, md: 6 },
                        mt: { xs: 2, md: 3 }
                    }}>
                        {title && (
                            <Typography
                                variant={isMobile ? 'h3' : 'h2'}
                                sx={{
                                    fontWeight: 700,
                                    color: 'text.primary',
                                    mb: subtitle ? 2 : 0,
                                    background: theme.custom?.gradients?.primary,
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                }}
                            >
                                {title}
                            </Typography>
                        )}
                        {subtitle && (
                            <Typography
                                variant={isMobile ? 'h6' : 'h5'}
                                sx={{
                                    color: 'text.secondary',
                                    fontWeight: 400,
                                    maxWidth: 600,
                                    mx: 'auto',
                                    lineHeight: 1.5,
                                }}
                            >
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                )}
                {children}
            </Container>
        </Box>
    );
};

PageLayout.propTypes = {
    title: PropTypes.string,
    subtitle: PropTypes.string,
    children: PropTypes.node.isRequired,
    maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', false]),
    padding: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.object,
        PropTypes.array
    ]),
    background: PropTypes.string,
    showHeader: PropTypes.bool,
    fullWidth: PropTypes.bool,
};

export default PageLayout; 