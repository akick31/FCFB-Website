import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography,
    CircularProgress,
    IconButton,
    Tooltip,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Autocomplete,
    TextField,
    Grid
} from '@mui/material';
import { PersonAdd, PersonRemove } from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getAllTeams } from '../../api/teamApi';
import { getAllUsers } from '../../api/userApi';
import { hireCoach, hireInterimCoach, fireCoach } from '../../api/teamApi';
import { useNavigate } from 'react-router-dom';
import StyledTable from '../../components/ui/StyledTable';
import { formatConference } from '../../utils/formatText';
import { adminNavigationItems } from '../../config/adminNavigation';
import { CONFERENCES } from '../../constants/teamEnums';

const CoachManagement = ({ user }) => {
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [filteredTeams, setFilteredTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filter states
    const [conferenceFilter, setConferenceFilter] = useState('ALL');
    const [takenFilter, setTakenFilter] = useState('ALL');
    const [activeFilter, setActiveFilter] = useState('ALL');
    
    // Dialog states
    const [hireDialogOpen, setHireDialogOpen] = useState(false);
    const [fireDialogOpen, setFireDialogOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedPosition, setSelectedPosition] = useState('');
    const [processing, setProcessing] = useState(false);
    const [dialogError, setDialogError] = useState('');

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
        const fetchData = async () => {
            try {
                const [teamsResponse, usersResponse] = await Promise.all([
                    getAllTeams(),
                    getAllUsers()
                ]);
                setTeams(teamsResponse);
                setUsers(usersResponse);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch data:', error);
                setError('Failed to load data');
                setLoading(false);
            }
        };

        if (user?.role === "ADMIN" || user?.role === "CONFERENCE_COMMISSIONER") {
            fetchData();
        }
    }, [user]);

    // Filter teams based on all criteria
    useEffect(() => {
        let filtered = teams;
        
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
        
        // Filter by active status
        if (activeFilter !== 'ALL') {
            if (activeFilter === 'ACTIVE') {
                filtered = filtered.filter(team => team.active);
            } else if (activeFilter === 'INACTIVE') {
                filtered = filtered.filter(team => !team.active);
            }
        }
        
        setFilteredTeams(filtered);
    }, [teams, conferenceFilter, takenFilter, activeFilter]);

    const handleNavigationChange = (item) => {
        navigate(item.path);
    };

    const handleHireCoach = (team) => {
        setSelectedTeam(team);
        setSelectedUser(null);
        setSelectedPosition('');
        setDialogError('');
        setHireDialogOpen(true);
    };

    const handleFireCoach = (team) => {
        setSelectedTeam(team);
        setDialogError('');
        setFireDialogOpen(true);
    };

    const handleHireSubmit = async () => {
        if (!selectedUser || !selectedPosition) {
            setDialogError('Please select both a user and position');
            return;
        }

        setProcessing(true);
        setDialogError('');

        try {
            if (!selectedUser.discord_id) {
                setDialogError('Selected user does not have a Discord ID');
                return;
            }

            await hireCoach({
                team: selectedTeam.name,
                discordId: selectedUser.discord_id,
                coachPosition: selectedPosition,
                processedBy: user.username
            });

            setHireDialogOpen(false);
            // Refresh teams data
            const updatedTeams = await getAllTeams();
            setTeams(updatedTeams);
        } catch (error) {
            setDialogError(error.message || 'Failed to hire coach');
        } finally {
            setProcessing(false);
        }
    };

    const handleHireInterimSubmit = async () => {
        if (!selectedUser) {
            setDialogError('Please select a user');
            return;
        }

        setProcessing(true);
        setDialogError('');

        try {
            if (!selectedUser.discord_id) {
                setDialogError('Selected user does not have a Discord ID');
                return;
            }

            await hireInterimCoach({
                team: selectedTeam.name,
                discordId: selectedUser.discord_id,
                processedBy: user.username
            });

            setHireDialogOpen(false);
            // Refresh teams data
            const updatedTeams = await getAllTeams();
            setTeams(updatedTeams);
        } catch (error) {
            setDialogError(error.message || 'Failed to hire interim coach');
        } finally {
            setProcessing(false);
        }
    };

    const handleFireSubmit = async () => {
        setProcessing(true);
        setDialogError('');

        try {
            await fireCoach({
                team: selectedTeam.name,
                processedBy: user.username
            });

            setFireDialogOpen(false);
            // Refresh teams data
            const updatedTeams = await getAllTeams();
            setTeams(updatedTeams);
        } catch (error) {
            setDialogError(error.message || 'Failed to fire coach');
        } finally {
            setProcessing(false);
        }
    };

    const coachColumns = [
        { id: 'logo', label: '', width: 60 },
        { id: 'name', label: 'Team Name', width: 200 },
        { id: 'conference', label: 'Conference', width: 150 },
        { id: 'actions', label: 'Actions', width: 200 },
    ];

    // Transform teams data for the table
    const tableData = filteredTeams.map(team => ({
        ...team,
        logo: (
            <Avatar
                src={team.logo}
                alt={team.name}
                sx={{ width: 40, height: 40 }}
            >
                {team.abbreviation || team.name?.charAt(0)}
            </Avatar>
        ),
        name: team.name,
        conference: formatConference(team.conference) || 'No Conference',
        actions: (
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Hire Coach">
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleHireCoach(team);
                        }}
                        sx={{ color: 'success.main' }}
                    >
                        <PersonAdd fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Fire Coach">
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleFireCoach(team);
                        }}
                        sx={{ color: 'error.main' }}
                    >
                        <PersonRemove fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
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
            title="Coach Management"
            navigationItems={navigationItems}
            onNavigationChange={handleNavigationChange}
            hideHeader={true}
            textColor="primary.main"
        >
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                    Coach Management
                </Typography>
                
                {/* Filter Controls */}
                <Box sx={{ mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
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
                            <FormControl fullWidth>
                                <InputLabel>Active Status</InputLabel>
                                <Select
                                    value={activeFilter}
                                    onChange={(e) => setActiveFilter(e.target.value)}
                                    label="Active Status"
                                    sx={{
                                        color: 'primary.main',
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.23)' }
                                    }}
                                >
                                    <MenuItem value="ALL">All Teams</MenuItem>
                                    <MenuItem value="ACTIVE">Active Teams</MenuItem>
                                    <MenuItem value="INACTIVE">Inactive Teams</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Box>
                
                <StyledTable
                    columns={coachColumns}
                    data={tableData}
                    maxHeight={600}
                    headerBackground="primary.main"
                    headerTextColor="white"
                />
            </Box>

            {/* Hire Coach Dialog */}
            <Dialog open={hireDialogOpen} onClose={() => setHireDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Hire Coach for {selectedTeam?.name}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Autocomplete
                            options={users}
                            getOptionLabel={(option) => option.username}
                            value={selectedUser}
                            onChange={(event, newValue) => setSelectedUser(newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select User"
                                    placeholder="Start typing to search users..."
                                    fullWidth
                                    sx={{ mb: 2 }}
                                />
                            )}
                            filterOptions={(options, { inputValue }) => {
                                const filterValue = inputValue.toLowerCase();
                                return options.filter((option) =>
                                    option.username.toLowerCase().includes(filterValue)
                                );
                            }}
                        />
                        
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Coach Position</InputLabel>
                            <Select
                                value={selectedPosition}
                                onChange={(e) => setSelectedPosition(e.target.value)}
                                label="Coach Position"
                            >
                                <MenuItem value="HEAD_COACH">Head Coach</MenuItem>
                                <MenuItem value="OFFENSIVE_COORDINATOR">Offensive Coordinator</MenuItem>
                                <MenuItem value="DEFENSIVE_COORDINATOR">Defensive Coordinator</MenuItem>
                            </Select>
                        </FormControl>

                        {dialogError && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {dialogError}
                            </Alert>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setHireDialogOpen(false)} disabled={processing}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleHireInterimSubmit} 
                        color="warning" 
                        variant="contained"
                        disabled={processing}
                    >
                        Hire Interim Coach
                    </Button>
                    <Button 
                        onClick={handleHireSubmit} 
                        color="primary" 
                        variant="contained"
                        disabled={processing}
                    >
                        Hire Coach
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Fire Coach Dialog */}
            <Dialog open={fireDialogOpen} onClose={() => setFireDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Fire Coach from {selectedTeam?.name}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Typography>
                            Are you sure you want to fire the current coach from {selectedTeam?.name}? 
                            This action cannot be undone.
                        </Typography>

                        {dialogError && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {dialogError}
                            </Alert>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFireDialogOpen(false)} disabled={processing}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleFireSubmit} 
                        color="error" 
                        variant="contained"
                        disabled={processing}
                    >
                        Fire Coach
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
};

export default CoachManagement;
