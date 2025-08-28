import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Grid, 
    Typography, 
    useTheme,
    useMediaQuery
} from '@mui/material';
import { 
    Dashboard,
    People,
    SportsFootball,
    EmojiEvents,
    Settings
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StyledCard from '../../components/ui/StyledCard';
import StyledTable from '../../components/ui/StyledTable';

const Admin = ({ user }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Mock data for demonstration - replace with actual API calls
    const recentUsers = [
        { id: 1, username: 'john_doe', email: 'john@example.com', role: 'User', status: 'Active', joinDate: '2024-01-15' },
        { id: 2, username: 'jane_smith', email: 'jane@example.com', role: 'Admin', status: 'Active', joinDate: '2024-01-14' },
        { id: 3, username: 'bob_wilson', email: 'bob@example.com', role: 'User', status: 'Pending', joinDate: '2024-01-13' },
        { id: 4, username: 'alice_brown', email: 'alice@example.com', role: 'User', status: 'Active', joinDate: '2024-01-12' },
        { id: 5, username: 'charlie_davis', email: 'charlie@example.com', role: 'Moderator', status: 'Active', joinDate: '2024-01-11' }
    ];

    const systemMetrics = [
        { metric: 'Server Uptime', value: '99.9%', status: 'Good' },
        { metric: 'Database Performance', value: 'Excellent', status: 'Good' },
        { metric: 'API Response Time', value: '45ms', status: 'Good' },
        { metric: 'Active Connections', value: '1,247', status: 'Normal' },
        { metric: 'Storage Usage', value: '67%', status: 'Warning' },
        { metric: 'Memory Usage', value: '78%', status: 'Warning' }
    ];

    const userColumns = [
        { id: 'username', label: 'Username', width: 150 },
        { id: 'email', label: 'Email', width: 200 },
        { id: 'role', label: 'Role', width: 120 },
        { id: 'status', label: 'Status', width: 100 },
        { id: 'joinDate', label: 'Join Date', width: 120 },
    ];

    const metricsColumns = [
        { id: 'metric', label: 'Metric', width: 200 },
        { id: 'value', label: 'Value', width: 150 },
        { id: 'status', label: 'Status', width: 120 },
    ];

    const navigationItems = [
        { label: 'Dashboard', icon: <Dashboard />, path: '/admin' },
        { label: 'User Management', icon: <People />, path: '/admin/users' },
        { label: 'Game Management', icon: <SportsFootball />, path: '/admin/games' },
        { label: 'Team Management', icon: <EmojiEvents />, path: '/admin/teams' },
        { label: 'System Settings', icon: <Settings />, path: '/admin/settings' },
    ];

    const handleNavigationChange = (item) => {
        console.log('Navigate to:', item.path);
        // Implement navigation logic here
    };

    return (
        <DashboardLayout
            title="Admin Dashboard"
            navigationItems={navigationItems}
            onNavigationChange={handleNavigationChange}
        >
            <Box sx={{ p: 3 }}>
                {/* Welcome Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        Welcome back, {user?.username || 'Admin'}!
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Here's what's happening with your FCFB platform today.
                    </Typography>
                </Box>

                {/* Main Content Grid */}
                <Grid container spacing={4}>
                    {/* Recent Users */}
                    <Grid item xs={12} lg={8}>
                        <StyledCard>
                            <Box sx={{ p: 3 }}>
                                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                                    Recent Users
                                </Typography>
                                <StyledTable
                                    columns={userColumns}
                                    data={recentUsers}
                                    maxHeight={400}
                                    onRowClick={(user) => {
                                        console.log('View user details:', user.username);
                                    }}
                                />
                            </Box>
                        </StyledCard>
                    </Grid>

                    {/* System Metrics */}
                    <Grid item xs={12} lg={4}>
                        <StyledCard>
                            <Box sx={{ p: 3 }}>
                                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                                    System Health
                                </Typography>
                                <StyledTable
                                    columns={metricsColumns}
                                    data={systemMetrics}
                                    maxHeight={400}
                                    showHeader={false}
                                />
                            </Box>
                        </StyledCard>
                    </Grid>

                    {/* Quick Actions */}
                    <Grid item xs={12}>
                        <StyledCard>
                            <Box sx={{ p: 3 }}>
                                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                                    Quick Actions
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <StyledCard
                                            hover
                                            onClick={() => console.log('Add new user')}
                                            sx={{ 
                                                textAlign: 'center', 
                                                p: 2,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <People sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                                            <Typography variant="h6">Add User</Typography>
                                        </StyledCard>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <StyledCard
                                            hover
                                            onClick={() => console.log('Create game')}
                                            sx={{ 
                                                textAlign: 'center', 
                                                p: 2,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <SportsFootball sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                                            <Typography variant="h6">Create Game</Typography>
                                        </StyledCard>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <StyledCard
                                            hover
                                            onClick={() => console.log('Manage teams')}
                                            sx={{ 
                                                textAlign: 'center', 
                                                p: 2,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <EmojiEvents sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                                            <Typography variant="h6">Manage Teams</Typography>
                                        </StyledCard>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <StyledCard
                                            hover
                                            onClick={() => console.log('System settings')}
                                            sx={{ 
                                                textAlign: 'center', 
                                                p: 2,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Settings sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                                            <Typography variant="h6">Settings</Typography>
                                        </StyledCard>
                                    </Grid>
                                </Grid>
                            </Box>
                        </StyledCard>
                    </Grid>
                </Grid>
            </Box>
        </DashboardLayout>
    );
};

export default Admin;