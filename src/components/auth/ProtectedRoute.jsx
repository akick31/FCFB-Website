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
    // Show loading spinner while checking authentication
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

    // Check if authentication is required and user is not authenticated
    if (requireAuth && !isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check if admin access is required and user is not admin
    if (requireAdmin && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    // User is authenticated and authorized, render the protected content
    return children;
};

export default ProtectedRoute;
