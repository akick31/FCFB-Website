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
    Switch,
    FormControlLabel,
    Card,
    CardContent,
    Alert,
    CircularProgress,
    IconButton
} from '@mui/material';
import { ArrowBack, Save, Cancel } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getTeamById, updateTeam } from '../../api/teamApi';
import { adminNavigationItems } from '../../config/adminNavigation';
import { OFFENSIVE_PLAYBOOKS, DEFENSIVE_PLAYBOOKS, CONFERENCES, SUBDIVISIONS } from '../../constants/teamEnums';
import { formatConference, formatOffensivePlaybook, formatDefensivePlaybook } from '../../utils/formatText';

const TeamEdit = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const navigationItems = adminNavigationItems;

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const response = await getTeamById(teamId);
                setTeam(response);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch team:', error);
                setError('Failed to load team');
                setLoading(false);
            }
        };

        if (teamId) {
            fetchTeam();
        }
    }, [teamId]);

    const handleNavigationChange = (item) => {
        console.log('Navigate to:', item.path);
        navigate(item.path);
    };

    const handleInputChange = (field, value) => {
        setTeam(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            await updateTeam(team);
            setSuccess(true);
            setTimeout(() => {
                navigate('/admin/teams');
            }, 1500);
        } catch (error) {
            console.error('Failed to update team:', error);
            setError('Failed to update team');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate('/admin/team-management');
    };

    if (loading) {
        return (
            <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!team) {
        return (
            <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography color="error">Team not found</Typography>
            </Box>
        );
    }

    return (
        <DashboardLayout
            title={`Edit Team: ${team.name}`}
            navigationItems={navigationItems}
            onNavigationChange={handleNavigationChange}
            hideHeader={true}
            textColor="primary.main"
        >
            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <IconButton
                        onClick={() => navigate('/admin/teams')}
                        sx={{ color: 'primary.main', mr: 2 }}
                    >
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        Edit Team: {team.name}
                    </Typography>
                </Box>

                {/* Alerts */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        Team updated successfully! Redirecting...
                    </Alert>
                )}

                <Grid container spacing={3}>
                    {/* Basic Information */}
                    <Grid item xs={12} lg={6}>
                        <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                                    Basic Information
                                </Typography>
                                
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Team Name"
                                            value={team.name || ''}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            sx={{ 
                                                '& .MuiInputLabel-root': { color: 'primary.main' },
                                                '& .MuiOutlinedInput-root': { 
                                                    color: 'primary.main',
                                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Abbreviation"
                                            value={team.abbreviation || ''}
                                            onChange={(e) => handleInputChange('abbreviation', e.target.value)}
                                            sx={{ 
                                                '& .MuiInputLabel-root': { color: 'primary.main' },
                                                '& .MuiOutlinedInput-root': { 
                                                    color: 'primary.main',
                                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Short Name"
                                            value={team.short_name || ''}
                                            onChange={(e) => handleInputChange('short_name', e.target.value)}
                                            sx={{ 
                                                '& .MuiInputLabel-root': { color: 'primary.main' },
                                                '& .MuiOutlinedInput-root': { 
                                                    color: 'primary.main',
                                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Primary Color (Hex)"
                                            value={team.primary_color || ''}
                                            onChange={(e) => handleInputChange('primary_color', e.target.value)}
                                            placeholder="#FF0000"
                                            sx={{ 
                                                '& .MuiInputLabel-root': { color: 'primary.main' },
                                                '& .MuiOutlinedInput-root': { 
                                                    color: 'primary.main',
                                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Secondary Color (Hex)"
                                            value={team.secondary_color || ''}
                                            onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                                            placeholder="#0000FF"
                                            sx={{ 
                                                '& .MuiInputLabel-root': { color: 'primary.main' },
                                                '& .MuiOutlinedInput-root': { 
                                                    color: 'primary.main',
                                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                }
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Playbooks and Conference */}
                    <Grid item xs={12} lg={6}>
                        <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                                    Playbooks & Conference
                                </Typography>
                                
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth>
                                            <InputLabel sx={{ color: 'primary.main' }}>
                                                Offensive Playbook
                                            </InputLabel>
                                            <Select
                                                value={team.offensive_playbook || ''}
                                                onChange={(e) => handleInputChange('offensive_playbook', e.target.value)}
                                                sx={{ 
                                                    '& .MuiInputLabel-root': { color: 'primary.main' },
                                                    '& .MuiOutlinedInput-root': { 
                                                        color: 'primary.main',
                                                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                    }
                                                }}
                                            >
                                                {OFFENSIVE_PLAYBOOKS.map(playbook => (
                                                    <MenuItem key={playbook} value={playbook}>
                                                        {formatOffensivePlaybook(playbook)}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth>
                                            <InputLabel sx={{ color: 'primary.main' }}>
                                                Defensive Playbook
                                            </InputLabel>
                                            <Select
                                                value={team.defensive_playbook || ''}
                                                onChange={(e) => handleInputChange('defensive_playbook', e.target.value)}
                                                sx={{ 
                                                    '& .MuiInputLabel-root': { color: 'primary.main' },
                                                    '& .MuiOutlinedInput-root': { 
                                                        color: 'primary.main',
                                                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                    }
                                                }}
                                            >
                                                {DEFENSIVE_PLAYBOOKS.map(playbook => (
                                                    <MenuItem key={playbook} value={playbook}>
                                                        {formatDefensivePlaybook(playbook)}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel sx={{ color: 'primary.main' }}>
                                                Conference
                                            </InputLabel>
                                            <Select
                                                value={team.conference || ''}
                                                onChange={(e) => handleInputChange('conference', e.target.value)}
                                                sx={{ 
                                                    '& .MuiInputLabel-root': { color: 'primary.main' },
                                                    '& .MuiOutlinedInput-root': { 
                                                        color: 'primary.main',
                                                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                    }
                                                }}
                                            >
                                                {CONFERENCES.map(conference => (
                                                    <MenuItem key={conference} value={conference}>
                                                        {formatConference(conference)}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth>
                                            <InputLabel sx={{ color: 'primary.main' }}>
                                                Subdivision
                                            </InputLabel>
                                            <Select
                                                value={team.subdivision || ''}
                                                onChange={(e) => handleInputChange('subdivision', e.target.value)}
                                                sx={{ 
                                                    '& .MuiInputLabel-root': { color: 'primary.main' },
                                                    '& .MuiOutlinedInput-root': { 
                                                        color: 'primary.main',
                                                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                    }
                                                }}
                                            >
                                                {SUBDIVISIONS.map(subdivision => (
                                                    <MenuItem key={subdivision} value={subdivision}>
                                                        {subdivision}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Current Season Stats */}
                    <Grid item xs={12} lg={6}>
                        <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                                    Current Season Stats
                                </Typography>
                                
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Current Wins"
                                            type="number"
                                            value={team.current_wins || 0}
                                            onChange={(e) => handleInputChange('current_wins', parseInt(e.target.value) || 0)}
                                            sx={{ 
                                                '& .MuiInputLabel-root': { color: 'primary.main' },
                                                '& .MuiOutlinedInput-root': { 
                                                    color: 'primary.main',
                                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Current Losses"
                                            type="number"
                                            value={team.current_losses || 0}
                                            onChange={(e) => handleInputChange('current_losses', parseInt(e.target.value) || 0)}
                                            sx={{ 
                                                '& .MuiInputLabel-root': { color: 'primary.main' },
                                                '& .MuiOutlinedInput-root': { 
                                                    color: 'primary.main',
                                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Conference Wins"
                                            type="number"
                                            value={team.current_conference_wins || 0}
                                            onChange={(e) => handleInputChange('current_conference_wins', parseInt(e.target.value) || 0)}
                                            sx={{ 
                                                '& .MuiInputLabel-root': { color: 'primary.main' },
                                                '& .MuiOutlinedInput-root': { 
                                                    color: 'primary.main',
                                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Conference Losses"
                                            type="number"
                                            value={team.current_conference_losses || 0}
                                            onChange={(e) => handleInputChange('current_conference_losses', parseInt(e.target.value) || 0)}
                                            sx={{ 
                                                '& .MuiInputLabel-root': { color: 'primary.main' },
                                                '& .MuiOutlinedInput-root': { 
                                                    color: 'primary.main',
                                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                }
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Overall Stats */}
                    <Grid item xs={12} lg={6}>
                        <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                                    Overall Stats
                                </Typography>
                                
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Overall Wins"
                                            type="number"
                                            value={team.overall_wins || 0}
                                            onChange={(e) => handleInputChange('overall_wins', parseInt(e.target.value) || 0)}
                                            sx={{ 
                                                '& .MuiInputLabel-root': { color: 'primary.main' },
                                                '& .MuiOutlinedInput-root': { 
                                                    color: 'primary.main',
                                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Overall Losses"
                                            type="number"
                                            value={team.overall_losses || 0}
                                            onChange={(e) => handleInputChange('overall_losses', parseInt(e.target.value) || 0)}
                                            sx={{ 
                                                '& .MuiInputLabel-root': { color: 'primary.main' },
                                                '& .MuiOutlinedInput-root': { 
                                                    color: 'primary.main',
                                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Overall Conf Wins"
                                            type="number"
                                            value={team.overall_conference_wins || 0}
                                            onChange={(e) => handleInputChange('overall_conference_wins', parseInt(e.target.value) || 0)}
                                            sx={{ 
                                                '& .MuiInputLabel-root': { color: 'primary.main' },
                                                '& .MuiOutlinedInput-root': { 
                                                    color: 'primary.main',
                                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Overall Conf Losses"
                                            type="number"
                                            value={team.overall_conference_losses || 0}
                                            onChange={(e) => handleInputChange('overall_conference_losses', parseInt(e.target.value) || 0)}
                                            sx={{ 
                                                '& .MuiInputLabel-root': { color: 'primary.main' },
                                                '& .MuiOutlinedInput-root': { 
                                                    color: 'primary.main',
                                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                }
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Championship Stats */}
                    <Grid item xs={12}>
                        <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                                    Championship Stats
                                </Typography>
                                
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <TextField
                                            fullWidth
                                            label="Conf Championship Wins"
                                            type="number"
                                            value={team.conference_championship_wins || 0}
                                            onChange={(e) => handleInputChange('conference_championship_wins', parseInt(e.target.value) || 0)}
                                            sx={{ 
                                                '& .MuiInputLabel-root': { color: 'primary.main' },
                                                '& .MuiOutlinedInput-root': { 
                                                    color: 'primary.main',
                                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <TextField
                                            fullWidth
                                            label="Conf Championship Losses"
                                            type="number"
                                            value={team.conference_championship_losses || 0}
                                            onChange={(e) => handleInputChange('conference_championship_losses', parseInt(e.target.value) || 0)}
                                            sx={{ 
                                                '& .MuiInputLabel-root': { color: 'primary.main' },
                                                '& .MuiOutlinedInput-root': { 
                                                    color: 'primary.main',
                                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <TextField
                                            fullWidth
                                            label="Bowl Wins"
                                            type="number"
                                            value={team.bowl_wins || 0}
                                            onChange={(e) => handleInputChange('bowl_wins', parseInt(e.target.value) || 0)}
                                            sx={{ 
                                                '& .MuiInputLabel-root': { color: 'primary.main' },
                                                '& .MuiOutlinedInput-root': { 
                                                    color: 'primary.main',
                                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <TextField
                                            fullWidth
                                            label="Bowl Losses"
                                            type="number"
                                            value={team.bowl_losses || 0}
                                            onChange={(e) => handleInputChange('bowl_losses', parseInt(e.target.value) || 0)}
                                            sx={{ 
                                                '& .MuiInputLabel-root': { color: 'primary.main' },
                                                '& .MuiOutlinedInput-root': { 
                                                    color: 'primary.main',
                                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <TextField
                                            fullWidth
                                            label="Playoff Wins"
                                            type="number"
                                            value={team.playoff_wins || 0}
                                            onChange={(e) => handleInputChange('playoff_wins', parseInt(e.target.value) || 0)}
                                            sx={{ 
                                                '& .MuiInputLabel-root': { color: 'primary.main' },
                                                '& .MuiOutlinedInput-root': { 
                                                    color: 'primary.main',
                                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <TextField
                                            fullWidth
                                            label="Playoff Losses"
                                            type="number"
                                            value={team.playoff_losses || 0}
                                            onChange={(e) => handleInputChange('playoff_losses', parseInt(e.target.value) || 0)}
                                            sx={{ 
                                                '& .MuiInputLabel-root': { color: 'primary.main' },
                                                '& .MuiOutlinedInput-root': { 
                                                    color: 'primary.main',
                                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <TextField
                                            fullWidth
                                            label="National Championship Wins"
                                            type="number"
                                            value={team.national_championship_wins || 0}
                                            onChange={(e) => handleInputChange('national_championship_wins', parseInt(e.target.value) || 0)}
                                            sx={{ 
                                                '& .MuiInputLabel-root': { color: 'primary.main' },
                                                '& .MuiOutlinedInput-root': { 
                                                    color: 'primary.main',
                                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <TextField
                                            fullWidth
                                            label="National Championship Losses"
                                            type="number"
                                            value={team.national_championship_losses || 0}
                                            onChange={(e) => handleInputChange('national_championship_losses', parseInt(e.target.value) || 0)}
                                            sx={{ 
                                                '& .MuiInputLabel-root': { color: 'primary.main' },
                                                '& .MuiOutlinedInput-root': { 
                                                    color: 'primary.main',
                                                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' }
                                                }
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Team Status */}
                    <Grid item xs={12}>
                        <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                                    Team Status
                                </Typography>
                                
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={team.is_taken || false}
                                                    onChange={(e) => handleInputChange('is_taken', e.target.checked)}
                                                    sx={{
                                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                                            color: 'warning.main',
                                                        },
                                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                            backgroundColor: 'warning.main',
                                                        },
                                                    }}
                                                />
                                            }
                                            label="Team is Taken"
                                            sx={{ color: 'primary.main' }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={team.active || false}
                                                    onChange={(e) => handleInputChange('active', e.target.checked)}
                                                    sx={{
                                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                                            color: 'success.main',
                                                        },
                                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                            backgroundColor: 'success.main',
                                                        },
                                                    }}
                                                />
                                            }
                                            label="Team is Active"
                                            sx={{ color: 'primary.main' }}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
                    <Button
                        variant="outlined"
                        onClick={handleCancel}
                        startIcon={<Cancel />}
                        sx={{ 
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                            color: 'white',
                            '&:hover': { borderColor: 'white' }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving}
                        startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                        sx={{ 
                            backgroundColor: 'primary.main',
                            color: 'white',
                            '&:hover': { backgroundColor: 'primary.dark' }
                        }}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Box>
            </Box>
        </DashboardLayout>
    );
};

export default TeamEdit;

