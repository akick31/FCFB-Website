import React, { Component } from 'react';
import { Box, Typography, Button } from '@mui/material';
import PropTypes from 'prop-types';
import { reportFrontendError } from '../../api/frontendErrorsApi';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        reportFrontendError({
            message: error?.message ?? String(error),
            stack: error?.stack ?? errorInfo?.componentStack ?? null,
            url: typeof window !== 'undefined' ? window.location.href : null,
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '60vh',
                        textAlign: 'center',
                        px: 3,
                    }}
                >
                    <Typography variant="h4" gutterBottom>
                        Something went wrong
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        An unexpected error occurred. Try reloading the page.
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => {
                            if (typeof window !== 'undefined') {
                                window.location.reload();
                            }
                        }}
                    >
                        Reload
                    </Button>
                </Box>
            );
        }

        return this.props.children;
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
