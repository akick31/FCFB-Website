import React, { useState, useEffect } from 'react';
import { 
    Box,
    Typography,
    CircularProgress,
    Chip,
    IconButton,
    Tooltip,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid
} from '@mui/material';
import { Edit, Search } from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getAllUsers } from '../../api/userApi';
import { useNavigate } from 'react-router-dom';
import { adminNavigationItems } from '../../config/adminNavigation';
import StyledTable from '../../components/ui/StyledTable';

const UserManagement = ({ user }) => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const navigationItems = adminNavigationItems;

    useEffect(() => {
        // If user is not loaded yet, just return (we're loading)
        if (!user || !user.role) {
            setLoading(true);
            return;
        }

        // Once the user is loaded, check the role
        if (user.role !== "ADMIN" && user.role !== "CONFERENCE_COMMISSIONER") {
            navigate('*');
        } else {
            setLoading(false);
        }
    }, [user, navigate]);

    useEffect(() => {
        // Fetch the list of users
        const fetchUsers = async () => {
            try {
                const response = await getAllUsers();
                setUsers(response);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch users:", error);
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Filter users based on search and filter criteria
    useEffect(() => {
        let filtered = users;
        
        // Filter by search term (username or team)
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(user => 
                user.username?.toLowerCase().includes(searchLower) ||
                user.team?.toLowerCase().includes(searchLower)
            );
        }
        
        // Filter by role
        if (roleFilter !== 'ALL') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }
        
        // Filter by status
        if (statusFilter !== 'ALL') {
            if (statusFilter === 'ACTIVE') {
                filtered = filtered.filter(user => user.isActive !== false);
            } else if (statusFilter === 'INACTIVE') {
                filtered = filtered.filter(user => user.isActive === false);
            } else if (statusFilter === 'UNVERIFIED') {
                filtered = filtered.filter(user => user.isVerified === false);
            }
        }
        
        setFilteredUsers(filtered);
    }, [users, searchTerm, roleFilter, statusFilter]);

    const handleNavigationChange = (item) => {
        navigate(item.path);
    };

    const handleUserClick = (user) => {
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'ADMIN':
                return 'error';
            case 'CONFERENCE_COMMISSIONER':
                return 'warning';
            case 'COACH':
                return 'success';
            default:
                return 'default';
        }
    };

    const getStatusColor = (user) => {
        if (user.isActive === false) return 'error';
        if (user.isVerified === false) return 'warning';
        return 'success';
    };

    const getStatusText = (user) => {
        if (user.isActive === false) return 'Inactive';
        if (user.isVerified === false) return 'Unverified';
        return 'Active';
    };

    const userColumns = [
        { id: 'username', label: 'Username', width: 120 },
        { id: 'role', label: 'Role', width: 120 },
        { id: 'team', label: 'Team', width: 100 },
        { id: 'status', label: 'Status', width: 100 },
        { id: 'actions', label: '', width: 80 },
    ];

    // Transform users data for the table
    const tableData = filteredUsers.map(user => ({
        ...user,
        role: (
            <Chip
                label={user.role || 'USER'}
                color={getRoleColor(user.role)}
                size="small"
            />
        ),
        team: user.team || 'No Team',
        status: (
            <Chip
                label={getStatusText(user)}
                color={getStatusColor(user)}
                size="small"
            />
        ),
        actions: (
            <Tooltip title="Edit User">
                <IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    sx={{ color: 'primary.main' }}
                >
                    <Edit fontSize="small" />
                </IconButton>
            </Tooltip>
        )
    }));

    if (loading) {
        return (
            <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <DashboardLayout
            title="User Management"
            navigationItems={navigationItems}
            onNavigationChange={handleNavigationChange}
            hideHeader={true}
            textColor="primary.main"
        >
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                    User Management
                </Typography>

                {/* Search and Filter Controls */}
                <Box sx={{ mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                placeholder="Search username or team..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        color: 'primary.main',
                                        '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.23)' }
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Role</InputLabel>
                                <Select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    label="Role"
                                    sx={{
                                        color: 'primary.main',
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.23)' }
                                    }}
                                >
                                    <MenuItem value="ALL">All Roles</MenuItem>
                                    <MenuItem value="ADMIN">Admin</MenuItem>
                                    <MenuItem value="CONFERENCE_COMMISSIONER">Conference Commissioner</MenuItem>
                                    <MenuItem value="COACH">Coach</MenuItem>
                                    <MenuItem value="USER">User</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    label="Status"
                                    sx={{
                                        color: 'primary.main',
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.23)' }
                                    }}
                                >
                                    <MenuItem value="ALL">All Statuses</MenuItem>
                                    <MenuItem value="ACTIVE">Active</MenuItem>
                                    <MenuItem value="INACTIVE">Inactive</MenuItem>
                                    <MenuItem value="UNVERIFIED">Unverified</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Box>
                
                <StyledTable
                    columns={userColumns}
                    data={tableData}
                    maxHeight={600}
                    onRowClick={handleUserClick}
                    headerBackground="primary.main"
                    headerTextColor="white"
                />
            </Box>
        </DashboardLayout>
    );
};

export default UserManagement;