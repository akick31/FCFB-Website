import React, {useEffect} from 'react';
import {
    Menu,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Button,
    Alert,
    CircularProgress,
    Typography,
    Box,
    Card
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorMessage from "../message/ErrorMessage";
import {getTeamByName} from "../../api/teamApi";

export const HireCoachByTeamMenu = ({
   contextMenu,
   handleCloseMenu,
   teams,
   selectedTeam,
   setSelectedTeam,
   selectedPosition,
   setSelectedPosition,
   handleHireCoach,
   contextError,
   hiringInProgress
}) => {
    const navigate = useNavigate();
    return (
        <Menu
            open={contextMenu !== null}
            onClose={handleCloseMenu}
            anchorReference="anchorPosition"
            anchorPosition={
                contextMenu !== null
                    ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                    : undefined
            }
        >
            <MenuItem sx={{ minWidth: 300, flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth>
                    <InputLabel>Select Team</InputLabel>
                    <Select
                        value={selectedTeam}
                        label="Select Team"
                        onChange={(e) => setSelectedTeam(e.target.value)}
                    >
                        {teams.map((team) => (
                            <MenuItem key={team.name} value={team.name}>
                                {team.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth>
                    <InputLabel>Select Position</InputLabel>
                    <Select
                        value={selectedPosition}
                        label="Select Position"
                        onChange={(e) => setSelectedPosition(e.target.value)}
                    >
                        <MenuItem value="HEAD_COACH">Head Coach</MenuItem>
                        <MenuItem value="OFFENSIVE_COORDINATOR">Offensive Coordinator</MenuItem>
                        <MenuItem value="DEFENSIVE_COORDINATOR">Defensive Coordinator</MenuItem>
                    </Select>
                </FormControl>

                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleHireCoach}
                    disabled={!selectedTeam || !selectedPosition || hiringInProgress}
                >
                    {hiringInProgress ? <CircularProgress size={24} /> : "Hire Coach"}
                </Button>

                <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    onClick={() => navigate(`/team-details/${selectedTeam}`)}
                    disabled={!selectedTeam}
                >
                    Go to Team Page
                </Button>

                {contextError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {contextError}
                    </Alert>
                )}
            </MenuItem>
        </Menu>
    );
};

export const HireCoachByUserMenu = ({
    contextMenu,
    handleCloseMenu,
    coaches,
    selectedTeam,
    selectedPosition,
    setSelectedPosition,
    handleHireCoach,
    contextError,
    hiringInProgress,
    selectedUser,
    setSelectedUser
}) => {
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [team, setTeam] = React.useState(null);

    const fetchData = async () => {
        try {
            const teamData = await getTeamByName(selectedTeam);
            setTeam(teamData);
            setLoading(false);
        } catch (error) {
            setError('Failed to load data');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return (
            <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <Menu
            open={contextMenu !== null}
            onClose={handleCloseMenu}
            anchorReference="anchorPosition"
            anchorPosition={
                contextMenu !== null
                    ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                    : undefined
            }
        >
            <MenuItem sx={{ minWidth: 300, flexDirection: 'column', gap: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Card sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mb: 1,
                    background: 'transparent',
                    border: 'none',
                    boxShadow: 'none',
                }}>
                    <Box
                        sx={{
                            width: 60,
                            height: 60,
                            overflow: 'hidden',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            mb: 1,
                        }}
                    >
                        <img
                            src={team.logo}
                            alt={team.name}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                            }}
                        />
                    </Box>
                    <Typography
                        variant="h6"
                        component="h2"
                        sx={{
                            fontWeight: 600,
                            fontSize: '1.2rem',
                            color: 'text.primary',
                            textAlign: 'center',
                        }}
                    >
                        {team.name}
                    </Typography>
                </Card>

                <FormControl fullWidth>
                    <InputLabel>Select Position</InputLabel>
                    <Select
                        value={selectedPosition}
                        label="Select Position"
                        onChange={(e) => setSelectedPosition(e.target.value)}
                    >
                        <MenuItem value="HEAD_COACH">Head Coach</MenuItem>
                        <MenuItem value="OFFENSIVE_COORDINATOR">Offensive Coordinator</MenuItem>
                        <MenuItem value="DEFENSIVE_COORDINATOR">Defensive Coordinator</MenuItem>
                    </Select>
                </FormControl>

                <FormControl fullWidth>
                    <InputLabel>Select Coach</InputLabel>
                    <Select
                        value={selectedUser?.discord_id || ''}
                        label="Select Coach"
                        onChange={(e) => {
                            const selectedCoach = coaches.find(coach => coach.discord_id === e.target.value);
                            setSelectedUser(selectedCoach);
                        }}
                    >
                        {coaches.map((coach) => (
                            <MenuItem key={coach.discord_id} value={coach.discord_id}>
                                {coach.username}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleHireCoach}
                    disabled={!selectedTeam || !selectedPosition || hiringInProgress}
                >
                    {hiringInProgress ? <CircularProgress size={24} /> : "Hire Coach"}
                </Button>

                <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    onClick={() => navigate(`/team-details/${team.id}`)}
                    disabled={!team}
                >
                    Go to Team Page
                </Button>

                {contextError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {contextError}
                    </Alert>
                )}
            </MenuItem>
        </Menu>
    );
};

export const HireInterimCoachByUserMenu = ({
    contextMenu,
    handleCloseMenu,
    coaches,
    selectedTeam,
    handleHireCoach,
    contextError,
    hiringInProgress,
    selectedUser,
    setSelectedUser
}) => {
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [team, setTeam] = React.useState(null);

    const fetchData = async () => {
        try {
            const teamData = await getTeamByName(selectedTeam);
            setTeam(teamData);
            setLoading(false);
        } catch (error) {
            setError('Failed to load data');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return (
            <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <Menu
            open={contextMenu !== null}
            onClose={handleCloseMenu}
            anchorReference="anchorPosition"
            anchorPosition={
                contextMenu !== null
                    ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                    : undefined
            }
        >
            <MenuItem sx={{ minWidth: 300, flexDirection: 'column', gap: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <FormControl fullWidth>
                    <InputLabel>Select Coach</InputLabel>
                    <Select
                        value={selectedUser?.discord_id || ''}
                        label="Select Coach"
                        onChange={(e) => {
                            const selectedCoach = coaches.find(coach => coach.discord_id === e.target.value);
                            setSelectedUser(selectedCoach);
                        }}
                    >
                        {coaches.map((coach) => (
                            <MenuItem key={coach.discord_id} value={coach.discord_id}>
                                {coach.username}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleHireCoach}
                    disabled={hiringInProgress}
                >
                    {hiringInProgress ? <CircularProgress size={24} /> : "Hire Interim Coach"}
                </Button>

                <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    onClick={() => handleCloseMenu()}
                    disabled={!team}
                >
                    Back
                </Button>

                {contextError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {contextError}
                    </Alert>
                )}
            </MenuItem>
        </Menu>
    );
};