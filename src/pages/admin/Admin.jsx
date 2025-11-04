import React, { useState, useEffect } from 'react';
import { 
    Chip,
    Box, 
    Grid, 
    Typography
} from '@mui/material';
import {
    People,
    SportsFootball,
    EmojiEvents,
    CheckCircle,
    Cancel,
    Headset
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StyledCard from '../../components/ui/StyledCard';
import StyledTable from '../../components/ui/StyledTable';
import { useNavigate } from 'react-router-dom';
import { getNewSignups } from '../../api/newSignupsApi';
import { getAllTeams } from '../../api/teamApi';
import { formatPosition, formatConference, formatOffensivePlaybook, formatDefensivePlaybook } from '../../utils/formatText';
import { adminNavigationItems } from '../../config/adminNavigation';

const Admin = ({ user }) => {
    const navigate = useNavigate();
    const [newSignups, setNewSignups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openTeams, setOpenTeams] = useState([]);

    // Fetch new signups data
    useEffect(() => {
        const fetchNewSignups = async () => {
            try {
                const response = await getNewSignups();
                setNewSignups(response);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch new signups:', error);
                setLoading(false);
            }
        };

        fetchNewSignups();
    }, []);

    // Fetch open teams data
    useEffect(() => {
        const fetchOpenTeams = async () => {
            try {
                const response = await getAllTeams();
                setOpenTeams(response);
            } catch (error) {
                console.error('Failed to fetch open teams:', error);
            }
        };

        fetchOpenTeams();
    }, []);

    const newSignupColumns = [
        { id: 'username', label: 'Username', width: 70 },
        { id: 'coach_name', label: 'Coach', width: 80 },
        { id: 'discord_tag', label: 'Discord', width: 70 },
        { id: 'position', label: 'Position', width: 80 },
        { id: 'team_choice_one', label: 'Team 1', width: 60 },
        { id: 'team_choice_two', label: 'Team 2', width: 60 },
        { id: 'team_choice_three', label: 'Team 3', width: 60 },
        { id: 'offensive_playbook', label: 'Offense', width: 60 },
        { id: 'defensive_playbook', label: 'Defense', width: 60 },
        { id: 'approved', label: 'Status', width: 50 },
    ];

    const openTeamColumns = [
        { id: 'name', label: 'Team Name', width: 120 },
        { id: 'conference', label: 'Conference', width: 100 },
        { id: 'status', label: 'Status', width: 80 },
    ];

    // Transform new signup data to include approval status indicators
    const transformedNewSignups = newSignups.map(signup => ({
        ...signup,
        offensive_playbook: formatOffensivePlaybook(signup.offensive_playbook),
        defensive_playbook: formatDefensivePlaybook(signup.defensive_playbook),
        coach_position: formatPosition(signup.coach_position),
        approved: signup.approved ? (
            <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
        ) : (
            <Cancel sx={{ color: 'error.main', fontSize: 20 }} />
        )
    }));

    // Transform open teams data to show only available teams
    const transformedOpenTeams = openTeams
        .filter(team => !team.is_taken && team.active)
        .map(team => ({
            ...team,
            conference: formatConference(team.conference),
            status: (
                <Chip
                    label="Open"
                    color="success"
                    size="small"
                />
            )
    }));

    const navigationItems = adminNavigationItems;

    const handleNavigationChange = (item) => {
        navigate(item.path);
    };

    if (loading) {
        return (
            <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ color: 'primary.main' }}>
                    Loading...
                </Typography>
            </Box>
        );
    }

    return (
        <DashboardLayout
            title="Admin Dashboard"
            navigationItems={navigationItems}
            onNavigationChange={handleNavigationChange}
            hideHeader={true}
            textColor="primary.main"
        >
            <Box sx={{ p: 3 }}>
                {/* Welcome Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                        Welcome back, {user?.username || 'Admin'}!
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Here's what's happening with FCFB today.
                    </Typography>
                </Box>

                {/* Main Content Grid */}
                <Grid container spacing={4}>
                    {/* New Signups */}
                    <Grid item xs={12}>
                        <StyledCard>
                            <Box sx={{ p: 3 }}>
                                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                                    New Signups
                                </Typography>
                                <StyledTable
                                    columns={newSignupColumns}
                                    data={transformedNewSignups}
                                    maxHeight={400}
                                    compact={true}
                                    onRowClick={() => {
                                    }}
                                />
                            </Box>
                        </StyledCard>
                    </Grid>

                    {/* Open Teams */}
                    <Grid item xs={12}>
                        <StyledCard>
                            <Box sx={{ p: 3 }}>
                                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                                    Open Teams
                                </Typography>
                                <StyledTable
                                    columns={openTeamColumns}
                                    data={transformedOpenTeams}
                                    maxHeight={400}
                                    compact={true}
                                    onRowClick={() => {
                                    }}
                                />
                            </Box>
                        </StyledCard>
                    </Grid>

                    {/* Quick Actions */}
                    <Grid item xs={12}>
                        <StyledCard>
                            <Box sx={{ p: 3 }}>
                                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                                    Quick Actions
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <StyledCard
                                            hover
                                            onClick={() => navigate('/admin/game-management')}
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
                                            onClick={() => navigate('/admin/team-management')}
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
                                            onClick={() => navigate('/admin/user-management')}
                                            sx={{ 
                                                textAlign: 'center', 
                                                p: 2,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <People sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                                            <Typography variant="h6">Manage Users</Typography>
                                        </StyledCard>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={2.4}>
                                        <StyledCard
                                            hover
                                            onClick={() => navigate('/admin/coach-management')}
                                            sx={{ 
                                                textAlign: 'center', 
                                                p: 2,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Headset sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                                            <Typography variant="h6">Manage Coaches</Typography>
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