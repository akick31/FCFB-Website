import React, { useState } from 'react';
import { 
    Box, 
    Grid, 
    Typography, 
    Avatar, 
    TextField, 
    Button,
    Divider,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { 
    SportsFootball,
    Person, 
    Email, 
    Phone, 
    LocationOn, 
    Edit,
    Save,
    Cancel,
    EmojiEvents,
    TrendingUp
} from '@mui/icons-material';
import PageLayout from '../components/layout/PageLayout';
import StyledCard from '../components/ui/StyledCard';
import StatsCard from '../components/ui/StatsCard';

const Profile = ({ user }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        bio: user?.bio || 'Passionate college football fan and FCFB member.'
    });

    // Mock data for demonstration - replace with actual API calls
    const userStats = [
        {
            title: 'Games Played',
            value: '156',
            subtitle: 'This season',
            icon: <SportsFootball />,
            color: 'primary'
        },
        {
            title: 'Wins',
            value: '89',
            subtitle: 'Total victories',
            icon: <EmojiEvents />,
            color: 'success'
        },
        {
            title: 'Win Rate',
            value: '57%',
            subtitle: 'Current season',
            icon: <TrendingUp />,
            color: 'secondary'
        },
        {
            title: 'Team',
            value: user?.teamName || 'Unassigned',
            subtitle: 'Current team',
            icon: <LocationOn />,
            color: 'info'
        }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            // Mock API call - replace with actual update logic
            await new Promise(resolve => setTimeout(resolve, 1000));
            setIsEditing(false);
            // Update user data here
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handleCancel = () => {
        setFormData({
            username: user?.username || '',
            email: user?.email || '',
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            bio: user?.bio || 'Passionate college football fan and FCFB member.'
        });
        setIsEditing(false);
    };

    return (
        <PageLayout
            title="My Profile"
            subtitle="Manage your account and view your FCFB statistics"
        >
            <Grid container spacing={4}>
                {/* Profile Header */}
                <Grid item xs={12}>
                    <StyledCard>
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Avatar
                                sx={{
                                    width: 120,
                                    height: 120,
                                    mx: 'auto',
                                    mb: 3,
                                    background: theme.custom?.gradients?.primary,
                                    fontSize: '3rem',
                                    fontWeight: 700,
                                }}
                            >
                                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                            </Avatar>
                            
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                                {user?.username || 'Username'}
                            </Typography>
                            
                            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                                {user?.email || 'user@example.com'}
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                                {!isEditing ? (
                                    <Button
                                        variant="contained"
                                        startIcon={<Edit />}
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            variant="contained"
                                            startIcon={<Save />}
                                            onClick={handleSave}
                                        >
                                            Save Changes
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            startIcon={<Cancel />}
                                            onClick={handleCancel}
                                        >
                                            Cancel
                                        </Button>
                                    </>
                                )}
                            </Box>
                        </Box>
                    </StyledCard>
                </Grid>

                {/* Stats Overview */}
                <Grid item xs={12}>
                    <Grid container spacing={3}>
                        {userStats.map((stat, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <StatsCard
                                    title={stat.title}
                                    value={stat.value}
                                    subtitle={stat.subtitle}
                                    icon={stat.icon}
                                    color={stat.color}
                                    size="medium"
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Grid>

                {/* Profile Details */}
                <Grid item xs={12} lg={8}>
                    <StyledCard>
                        <Box sx={{ p: 3 }}>
                            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                                Profile Information
                            </Typography>
                            
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        sx={{ mb: 2 }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        sx={{ mb: 2 }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="First Name"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        sx={{ mb: 2 }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Last Name"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        sx={{ mb: 2 }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Bio"
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        multiline
                                        rows={4}
                                        sx={{ mb: 2 }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </StyledCard>
                </Grid>

                {/* Account Info */}
                <Grid item xs={12} lg={4}>
                    <StyledCard>
                        <Box sx={{ p: 3 }}>
                            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                                Account Details
                            </Typography>
                            
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                    Member Since
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {user?.joinDate || 'January 2024'}
                                </Typography>
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                    Account Status
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500, color: 'success.main' }}>
                                    Active
                                </Typography>
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                    Role
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {user?.role || 'Member'}
                                </Typography>
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Box>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                    Last Login
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {user?.lastLogin || 'Today'}
                                </Typography>
                            </Box>
                        </Box>
                    </StyledCard>
                </Grid>
            </Grid>
        </PageLayout>
    );
};

export default Profile;