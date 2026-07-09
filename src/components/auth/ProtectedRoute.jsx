import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ 
    children, 
    requireAuth = true, 
    requireAdmin = false, 
    isAuthenticated, 
    isAdmin, 
    loading = false 
}) => {
    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: '100vh' 
            }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 2, color: 'primary.main' }}>
                    Loading...
                </Typography>
            </Box>
        );
    }

    if (requireAuth && !isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
