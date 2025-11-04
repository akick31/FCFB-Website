import React, { useState, useEffect } from 'react';
import {
    Box, 
    Typography,
    CircularProgress,
    Chip,
    IconButton,
    Tooltip,
    Avatar,
    FormControlLabel,
    Checkbox,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Button
} from '@mui/material';
import { Edit, Search, Add } from '@mui/icons-material';
import { CONFERENCES } from '../../constants/teamEnums';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getAllTeams } from '../../api/teamApi';
import CreateTeamForm from '../../components/forms/CreateTeamForm';
import { useNavigate } from 'react-router-dom';
import StyledTable from '../../components/ui/StyledTable';
import { formatConference, formatOffensivePlaybook, formatDefensivePlaybook } from '../../utils/formatText';
import { adminNavigationItems } from '../../config/adminNavigation';

const TeamManagement = () => {
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [filteredTeams, setFilteredTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hideFakeTeams, setHideFakeTeams] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [conferenceFilter, setConferenceFilter] = useState('ALL');
    const [takenFilter, setTakenFilter] = useState('ALL');
    const [createTeamOpen, setCreateTeamOpen] = useState(false);

    const navigationItems = adminNavigationItems;

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await getAllTeams();
                setTeams(response);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch teams:', error);
                setError('Failed to load teams');
                setLoading(false);
            }
        };

        fetchTeams();
    }, []);

    // Filter teams based on all criteria
    useEffect(() => {
        let filtered = teams;
        
        // Filter out fake teams if checkbox is checked
        if (hideFakeTeams) {
            filtered = filtered.filter(team => team.subdivision !== 'FAKE');
        }
        
        // Filter by conference
        if (conferenceFilter !== 'ALL') {
            filtered = filtered.filter(team => team.conference === conferenceFilter);
        }
        
        // Filter by taken status
        if (takenFilter !== 'ALL') {
            if (takenFilter === 'TAKEN') {
                filtered = filtered.filter(team => team.is_taken);
            } else if (takenFilter === 'OPEN') {
                filtered = filtered.filter(team => !team.is_taken);
            }
        }
        
        // Filter by search term
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(team => 
                team.name?.toLowerCase().includes(searchLower) ||
                team.short_name?.toLowerCase().includes(searchLower) ||
                team.abbreviation?.toLowerCase().includes(searchLower)
            );
        }
        
        setFilteredTeams(filtered);
    }, [teams, hideFakeTeams, conferenceFilter, takenFilter, searchTerm]);

    const handleNavigationChange = (item) => {
        navigate(item.path);
    };

    const handleTeamClick = (team) => {
                        navigate(`/admin/edit-team/${team.id}`);
    };

    const handleCreateTeam = () => {
        setCreateTeamOpen(true);
    };

    const handleTeamCreated = async () => {
        // Refresh the teams list
        try {
            const response = await getAllTeams();
            setTeams(response);
        } catch (error) {
            console.error('Failed to refresh teams:', error);
        }
    };

    const getStatusColor = (team) => {
        if (!team.active) return 'error';
        if (team.is_taken) return 'warning';
        return 'success';
    };

    const getStatusText = (team) => {
        if (!team.active) return 'Inactive';
        if (team.is_taken) return 'Taken';
        return 'Open';
    };

    const teamColumns = [
        { id: 'logo', label: '', width: 40 },
        { id: 'name', label: 'Team Name', width: 120 },
        { id: 'conference', label: 'Conference', width: 100 },
        { id: 'offensive_playbook', label: 'Offense', width: 80 },
        { id: 'defensive_playbook', label: 'Defense', width: 80 },
        { id: 'currentRecord', label: 'Current', width: 80 },
        { id: 'overallRecord', label: 'Overall', width: 80 },
        { id: 'status', label: 'Status', width: 80 },
        { id: 'actions', label: '', width: 50 },
    ];

    // Transform teams data for the table
    const tableData = filteredTeams.map(team => ({
        ...team,
        logo: (
            <Avatar
                src={team.logo}
                sx={{ width: 24, height: 24 }}
                alt={`${team.name} Logo`}
            >
                {team.abbreviation?.charAt(0) || 'T'}
            </Avatar>
        ),
        conference: formatConference(team.conference) || 'None',
        offensive_playbook: formatOffensivePlaybook(team.offensive_playbook) || 'None',
        defensive_playbook: formatDefensivePlaybook(team.defensive_playbook) || 'None',
        currentRecord: `${team.current_wins}-${team.current_losses}`,
        overallRecord: `${team.overall_wins}-${team.overall_losses}`,
        status: (
            <Chip
                label={getStatusText(team)}
                color={getStatusColor(team)}
                size="small"
            />
        ),
        actions: (
            <Tooltip title="Edit Team">
                <IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/edit-team/${team.id}`);
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

    if (error) {
        return (
            <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <DashboardLayout
            title="Team Management"
            navigationItems={navigationItems}
            onNavigationChange={handleNavigationChange}
            hideHeader={true}
            textColor="primary.main"
        >
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        Team Management
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleCreateTeam}
                        sx={{
                            backgroundColor: 'primary.main',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                            },
                        }}
                    >
                        Create Team
                    </Button>
                </Box>
                
                {/* Filter Controls */}
                <Box sx={{ mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                placeholder="Search teams..."
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
                                <InputLabel>Conference</InputLabel>
                                <Select
                                    value={conferenceFilter}
                                    onChange={(e) => setConferenceFilter(e.target.value)}
                                    label="Conference"
                                    sx={{
                                        color: 'primary.main',
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.23)' }
                                    }}
                                >
                                    <MenuItem value="ALL">All Conferences</MenuItem>
                                    {CONFERENCES.map(conference => (
                                        <MenuItem key={conference} value={conference}>
                                            {formatConference(conference)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Taken Status</InputLabel>
                                <Select
                                    value={takenFilter}
                                    onChange={(e) => setTakenFilter(e.target.value)}
                                    label="Taken Status"
                                    sx={{
                                        color: 'primary.main',
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.23)' }
                                    }}
                                >
                                    <MenuItem value="ALL">All Teams</MenuItem>
                                    <MenuItem value="OPEN">Open Teams</MenuItem>
                                    <MenuItem value="TAKEN">Taken Teams</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={hideFakeTeams}
                                        onChange={(e) => setHideFakeTeams(e.target.checked)}
                                        sx={{ color: 'primary.main' }}
                                    />
                                }
                                label="Filter out fake teams"
                                sx={{ color: 'primary.main' }}
                            />
                        </Grid>
                    </Grid>
                </Box>
                
                <StyledTable
                    columns={teamColumns}
                    data={tableData}
                    maxHeight={600}
                    onRowClick={handleTeamClick}
                    headerBackground="primary.main"
                    headerTextColor="white"
                />

                {/* Create Team Dialog */}
                <CreateTeamForm 
                    open={createTeamOpen}
                    onClose={() => setCreateTeamOpen(false)}
                    onTeamCreated={handleTeamCreated}
                />
            </Box>
        </DashboardLayout>
    );
};

export default TeamManagement;
