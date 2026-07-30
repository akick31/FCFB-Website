import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Card,
    CardContent,
    Alert,
    CircularProgress,
    IconButton,
} from '@mui/material';
import { ArrowBack, Save, Cancel } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getAllUsers, updateUser } from '../../api/userApi';
import { getAllTeams } from '../../api/teamApi';
import { adminNavigationItems } from '../../config/adminNavigation.jsx';
import { OFFENSIVE_PLAYBOOKS, DEFENSIVE_PLAYBOOKS } from '../../constants/teamEnums';
import { formatOffensivePlaybook, formatDefensivePlaybook, formatRole, formatPosition } from '../../utils/formatText';

const ROLES = ['USER', 'CONFERENCE_COMMISSIONER', 'ADMIN'];
const POSITIONS = ['HEAD_COACH', 'OFFENSIVE_COORDINATOR', 'DEFENSIVE_COORDINATOR', 'RETIRED'];

const fieldSx = {
    '& .MuiInputLabel-root': { color: 'primary.main' },
    '& .MuiOutlinedInput-root': { color: 'primary.main', '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' } },
};

const EditCoach = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [allUsers, allTeams] = await Promise.all([getAllUsers(), getAllTeams().catch(() => [])]);
                const decoded = decodeURIComponent(username || '');
                const found = allUsers.find((entry) => entry.username === decoded || entry.coach_name === decoded);
                setUser(found || null);
                setTeams(allTeams.filter((team) => team.active).map((team) => team.name).sort((a, b) => a.localeCompare(b)));
                if (!found) setError('Coach not found');
            } catch (err) {
                console.error('Failed to load coach:', err);
                setError('Failed to load coach');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [username]);

    const handleChange = (field, value) => setUser((prev) => ({ ...prev, [field]: value }));

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(false);
        try {
            await updateUser(user);
            setSuccess(true);
            setTimeout(() => navigate('/admin/coach-management'), 1500);
        } catch (err) {
            setError(err.message || 'Failed to update coach');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
    }
    if (!user) {
        return <Box sx={{ py: 2, textAlign: 'center' }}><Typography color="error">{error || 'Coach not found'}</Typography></Box>;
    }

    const numberField = (field, label) => (
        <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth type="number" label={label} value={user[field] || 0} onChange={(e) => handleChange(field, parseInt(e.target.value, 10) || 0)} sx={fieldSx} />
        </Grid>
    );

    return (
        <DashboardLayout title={`Edit Coach: ${user.coach_name || user.username}`} navigationItems={adminNavigationItems} hideHeader textColor="primary.main">
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <IconButton onClick={() => navigate('/admin/coach-management')} sx={{ color: 'primary.main', mr: 2 }}><ArrowBack /></IconButton>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>Edit Coach: {user.coach_name || user.username}</Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 3 }}>Coach updated successfully! Redirecting...</Alert>}

                <Grid container spacing={3}>
                    <Grid item xs={12} lg={6}>
                        <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>Basic Information</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Coach Name" value={user.coach_name || ''} onChange={(e) => handleChange('coach_name', e.target.value)} sx={fieldSx} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Discord Tag" value={user.discord_tag || ''} onChange={(e) => handleChange('discord_tag', e.target.value)} sx={fieldSx} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel sx={{ color: 'primary.main' }}>Role</InputLabel>
                                            <Select label="Role" value={user.role || ''} onChange={(e) => handleChange('role', e.target.value)} sx={fieldSx}>
                                                {ROLES.map((role) => <MenuItem key={role} value={role}>{formatRole(role)}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel sx={{ color: 'primary.main' }}>Position</InputLabel>
                                            <Select label="Position" value={user.position || ''} onChange={(e) => handleChange('position', e.target.value)} sx={fieldSx}>
                                                {POSITIONS.map((position) => <MenuItem key={position} value={position}>{formatPosition(position)}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth>
                                            <InputLabel sx={{ color: 'primary.main' }}>Team</InputLabel>
                                            <Select label="Team" value={user.team || ''} onChange={(e) => handleChange('team', e.target.value || null)} sx={fieldSx}>
                                                <MenuItem value=""><em>None (free agent)</em></MenuItem>
                                                {teams.map((team) => <MenuItem key={team} value={team}>{team}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} lg={6}>
                        <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>Playbooks</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth>
                                            <InputLabel sx={{ color: 'primary.main' }}>Offensive Playbook</InputLabel>
                                            <Select label="Offensive Playbook" value={user.offensive_playbook || ''} onChange={(e) => handleChange('offensive_playbook', e.target.value)} sx={fieldSx}>
                                                {OFFENSIVE_PLAYBOOKS.map((playbook) => <MenuItem key={playbook} value={playbook}>{formatOffensivePlaybook(playbook)}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth>
                                            <InputLabel sx={{ color: 'primary.main' }}>Defensive Playbook</InputLabel>
                                            <Select label="Defensive Playbook" value={user.defensive_playbook || ''} onChange={(e) => handleChange('defensive_playbook', e.target.value)} sx={fieldSx}>
                                                {DEFENSIVE_PLAYBOOKS.map((playbook) => <MenuItem key={playbook} value={playbook}>{formatDefensivePlaybook(playbook)}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12}>
                        <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>Record</Typography>
                                <Grid container spacing={2}>
                                    {numberField('wins', 'Wins')}
                                    {numberField('losses', 'Losses')}
                                    {numberField('conference_wins', 'Conference Wins')}
                                    {numberField('conference_losses', 'Conference Losses')}
                                    {numberField('conference_championship_wins', 'Conf Championship Wins')}
                                    {numberField('conference_championship_losses', 'Conf Championship Losses')}
                                    {numberField('bowl_wins', 'Bowl Wins')}
                                    {numberField('bowl_losses', 'Bowl Losses')}
                                    {numberField('playoff_wins', 'Playoff Wins')}
                                    {numberField('playoff_losses', 'Playoff Losses')}
                                    {numberField('national_championship_wins', 'National Championship Wins')}
                                    {numberField('national_championship_losses', 'National Championship Losses')}
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
                    <Button variant="outlined" onClick={() => navigate('/admin/coach-management')} startIcon={<Cancel />} sx={{ borderColor: 'rgba(255, 255, 255, 0.5)', color: 'white', '&:hover': { borderColor: 'white' } }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving} startIcon={saving ? <CircularProgress size={20} /> : <Save />} sx={{ backgroundColor: 'primary.main', color: 'white', '&:hover': { backgroundColor: 'primary.dark' } }}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                </Box>
            </Box>
        </DashboardLayout>
    );
};

export default EditCoach;
