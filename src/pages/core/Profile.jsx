import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Grid, 
    Typography, 
    Avatar, 
    Chip,
    Divider,
    TextField,
    Button,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { 
    SportsFootball,
    Person, 
    School,
    EmojiEvents,
    TrendingUp,
    MilitaryTech,
    Group,
    Flag,
    Edit,
    Save,
    Cancel
} from '@mui/icons-material';
import PageLayout from '../../components/layout/PageLayout';
import StyledCard from '../../components/ui/StyledCard';
import StatsCard from '../../components/ui/StatsCard';
import { formatOffensivePlaybook, formatDefensivePlaybook, formatPosition } from '../../utils/formatText';
import { formatResponseTime } from '../../utils/timeUtils';
import { getTeamByName } from '../../api/teamApi';

const Profile = ({ user }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: '', // Email field for editing
        password: '',
        confirmPassword: ''
    });
    const [teamData, setTeamData] = useState(null);
    const [isLoadingTeam, setIsLoadingTeam] = useState(false);

    // Fetch team data when user changes
    useEffect(() => {
        const fetchTeamData = async () => {
            if (user?.team) {
                setIsLoadingTeam(true);
                try {
                    const team = await getTeamByName(user.team);
                    setTeamData(team);
                } catch (error) {
                    console.error('Error fetching team data:', error);
                } finally {
                    setIsLoadingTeam(false);
                }
            }
        };

        fetchTeamData();
    }, [user?.team]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            // TODO: Implement actual API call to update user data
            console.log('Saving user data:', formData);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handleCancel = () => {
        setFormData({
            username: user?.username || '',
            email: '', // Reset email field
            password: '',
            confirmPassword: ''
        });
        setIsEditing(false);
    };

    // Calculate win percentage
    const winPercentage = user?.win_percentage ? (user.win_percentage * 100).toFixed(1) : '0.0';

    // Main stats cards
    const mainStats = [
        {
            title: 'Total Games',
            value: (user?.wins || 0) + (user?.losses || 0),
            subtitle: 'Career games coached',
            icon: <SportsFootball />,
            color: 'primary'
        },
        {
            title: 'Win Rate',
            value: `${winPercentage}%`,
            subtitle: 'Career win percentage',
            icon: <TrendingUp />,
            color: 'success'
        },
        {
            title: 'Team',
            value: user?.team || 'Unassigned',
            subtitle: 'Current team',
            icon: <School />,
            color: 'info'
        },
        {
            title: 'Position',
            value: formatPosition(user?.position),
            subtitle: 'Coaching role',
            icon: <Person />,
            color: 'secondary'
        }
    ];

    // Record stats (centered)
    const recordStats = [
        {
            title: 'Overall Record',
            value: `${user?.wins || 0}-${user?.losses || 0}`,
            subtitle: 'Career record',
            icon: <EmojiEvents />,
            color: 'primary'
        },
        {
            title: 'Bowl Record',
            value: `${user?.bowl_wins || 0}-${user?.bowl_losses || 0}`,
            subtitle: 'Bowl games',
            icon: <MilitaryTech />,
            color: 'warning'
        },
        {
            title: 'Playoff Record',
            value: `${user?.playoff_wins || 0}-${user?.playoff_losses || 0}`,
            subtitle: 'Playoff games',
            icon: <Flag />,
            color: 'success'
        }
    ];

    // Championship stats
    const championshipStats = [
        {
            title: 'Conference Championships',
            value: `${user?.conference_championship_wins || 0}-${user?.conference_championship_losses || 0}`,
            subtitle: 'Conference titles',
            icon: <EmojiEvents />,
            color: 'primary'
        },
        {
            title: 'National Championships',
            value: `${user?.national_championship_wins || 0}-${user?.national_championship_losses || 0}`,
            subtitle: 'National titles',
            icon: <MilitaryTech />,
            color: 'warning'
        }
    ];

    return (
        <PageLayout
            title="My Profile"
            subtitle="View your FCFB coaching statistics and profile information"
        >
            <Grid container spacing={4}>
                {/* Profile Header with Account Details and Playbooks */}
                <Grid item xs={12} lg={8}>
                    <StyledCard>
                        <Box sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                                {/* Team Logo or Default Avatar */}
                                {user?.team && isLoadingTeam ? (
                                    <Box sx={{ mr: 3 }}>
                                        <Avatar
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                background: theme.custom?.gradients?.primary,
                                                fontSize: '2rem',
                                                fontWeight: 700,
                                            }}
                                        >
                                            <SportsFootball />
                                        </Avatar>
                                    </Box>
                                ) : user?.team && teamData ? (
                                    <Box sx={{ mr: 3 }}>
                                        <img 
                                            src={teamData.logo} 
                                            alt={`${user.team} Logo`}
                                            style={{ 
                                                width: 80, 
                                                height: 80,
                                                objectFit: 'contain'
                                            }}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'block';
                                            }}
                                        />
                                        <Avatar
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                background: theme.custom?.gradients?.primary,
                                                fontSize: '2rem',
                                                fontWeight: 700,
                                                display: 'none'
                                            }}
                                        >
                                            {user.team.charAt(0).toUpperCase()}
                                        </Avatar>
                                    </Box>
                                ) : (
                                    <Avatar
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            mr: 3,
                                            background: theme.custom?.gradients?.primary,
                                            fontSize: '2rem',
                                            fontWeight: 700,
                                        }}
                                    >
                                        {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                                    </Avatar>
                                )}
                                
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                                        {user?.coach_name || user?.username || 'Coach'}
                                    </Typography>
                                    
                                    <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
                                        {formatPosition(user?.position)} • {user?.team || 'Unassigned'}
                                    </Typography>


                                </Box>
                            </Box>

                            {/* Playbooks Section */}
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    Coaching Strategy
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                                Offensive Playbook
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                {formatOffensivePlaybook(user?.offensive_playbook) || 'Not Set'}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                                Defensive Playbook
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                {formatDefensivePlaybook(user?.defensive_playbook) || 'Not Set'}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Performance Metrics */}
                            <Box>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    Performance Metrics
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                                Average Response Time
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                {user?.average_response_time ? formatResponseTime(user.average_response_time) : 'N/A'}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                                Delay of Game Instances
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                {user?.delay_of_game_instances || 0}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Box>
                    </StyledCard>
                </Grid>

                {/* Account Details Sidebar */}
                <Grid item xs={12} lg={4}>
                    <StyledCard>
                        <Box sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                    Account Details
                                </Typography>
                                {!isEditing ? (
                                    <Button
                                        size="small"
                                        startIcon={<Edit />}
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Edit
                                    </Button>
                                ) : (
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            startIcon={<Save />}
                                            onClick={handleSave}
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={<Cancel />}
                                            onClick={handleCancel}
                                        >
                                            Cancel
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                            
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                    Username
                                </Typography>
                                {isEditing ? (
                                    <TextField
                                        fullWidth
                                        size="small"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        sx={{ mb: 2 }}
                                    />
                                ) : (
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {user?.username || 'Not Set'}
                                    </Typography>
                                )}
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            {isEditing && (
                                <>
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                            Email
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter new email"
                                            sx={{ mb: 2 }}
                                        />
                                    </Box>
                                    <Divider sx={{ my: 2 }} />
                                </>
                            )}
                            
                            {isEditing && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                            New Password
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            name="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            sx={{ mb: 2 }}
                                        />
                                    </Box>
                                    
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                            Confirm Password
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            name="confirmPassword"
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                        />
                                    </Box>
                                </>
                            )}
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                    Role
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500, color: 'success.main' }}>
                                    {user?.role || 'Member'}
                                </Typography>
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                    Discord Tag
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {user?.discord_tag || 'Not Set'}
                                </Typography>
                            </Box>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Box>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                    Delay of Game Warning Opt-out
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {user?.delay_of_game_warning_opt_out ? 'Yes' : 'No'}
                                </Typography>
                            </Box>
                        </Box>
                    </StyledCard>
                </Grid>

                {/* Main Stats Overview */}
                <Grid item xs={12}>
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                        Career Overview
                    </Typography>
                    <Grid container spacing={3}>
                        {mainStats.map((stat, index) => (
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

                {/* Record Stats (Centered) */}
                <Grid item xs={12}>
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, textAlign: 'center' }}>
                        Coaching Records
                    </Typography>
                    <Grid container spacing={3} justifyContent="center">
                        {recordStats.map((stat, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
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

                {/* Championship Stats */}
                <Grid item xs={12}>
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                        Championships
                    </Typography>
                    <Grid container spacing={3}>
                        {championshipStats.map((stat, index) => (
                            <Grid item xs={12} sm={6} key={index}>
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
            </Grid>
        </PageLayout>
    );
};

export default Profile;