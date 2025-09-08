import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useTheme
} from '@mui/material';
import {
    Assessment,
    Timeline,
    Public,
    Group,
    Sports,
    CheckCircle,
    Error
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminNavigationItems } from '../../config/adminNavigation';
import { generateAllRecords } from '../../api/recordsApi';
import { generateAllSeasonStats } from '../../api/seasonStatsApi';
import { generateAllLeagueStats } from '../../api/leagueStatsApi';
import { generateAllConferenceStats } from '../../api/conferenceStatsApi';
import { generateAllPlaybookStats } from '../../api/playbookStatsApi';
import { generateAllGameStats } from '../../api/gameStatsApi';

const StatsManagement = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState({});
    const [results, setResults] = useState({});
    const [error, setError] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, title: '' });
    const navigationItems = adminNavigationItems;

    const handleNavigationChange = (path) => {
        // Navigation is handled by React Router, so this can be empty
        // or you can add any additional logic here if needed
    };

    const statsActions = [
        {
            id: 'records',
            title: 'Generate Records',
            description: 'Recalculate all game and season records',
            icon: <Assessment />,
            color: 'primary',
            action: generateAllRecords
        },
        {
            id: 'season-stats',
            title: 'Generate Season Stats',
            description: 'Recalculate all team season statistics',
            icon: <Timeline />,
            color: 'secondary',
            action: generateAllSeasonStats
        },
        {
            id: 'league-stats',
            title: 'Generate League Stats',
            description: 'Recalculate all league-wide statistics',
            icon: <Public />,
            color: 'success',
            action: generateAllLeagueStats
        },
        {
            id: 'conference-stats',
            title: 'Generate Conference Stats',
            description: 'Recalculate all conference statistics',
            icon: <Group />,
            color: 'info',
            action: generateAllConferenceStats
        },
        {
            id: 'playbook-stats',
            title: 'Generate Playbook Stats',
            description: 'Recalculate all playbook statistics',
            icon: <Sports />,
            color: 'warning',
            action: generateAllPlaybookStats
        },
        {
            id: 'game-stats',
            title: 'Generate Game Stats',
            description: 'Recalculate all game statistics',
            icon: <Assessment />,
            color: 'error',
            action: generateAllGameStats
        }
    ];

    const handleGenerate = async (actionId, actionFunction, title) => {
        setConfirmDialog({
            open: true,
            action: () => executeGeneration(actionId, actionFunction),
            title: `Generate ${title}?`
        });
    };

    const executeGeneration = async (actionId, actionFunction) => {
        setLoading(prev => ({ ...prev, [actionId]: true }));
        setError(null);
        setResults(prev => ({ ...prev, [actionId]: null }));

        try {
            const result = await actionFunction();
            setResults(prev => ({ 
                ...prev, 
                [actionId]: { 
                    success: true, 
                    message: 'Generation completed successfully',
                    timestamp: new Date().toLocaleString()
                }
            }));
        } catch (error) {
            console.error(`Error generating ${actionId}:`, error);
            setResults(prev => ({ 
                ...prev, 
                [actionId]: { 
                    success: false, 
                    message: error.response?.data?.message || error.message || 'Generation failed',
                    timestamp: new Date().toLocaleString()
                }
            }));
            setError(`Failed to generate ${actionId}: ${error.message}`);
        } finally {
            setLoading(prev => ({ ...prev, [actionId]: false }));
        }
    };

    const handleConfirm = () => {
        if (confirmDialog.action) {
            confirmDialog.action();
        }
        setConfirmDialog({ open: false, action: null, title: '' });
    };

    const handleCancel = () => {
        setConfirmDialog({ open: false, action: null, title: '' });
    };

    const getResultIcon = (result) => {
        if (!result) return null;
        return result.success ? (
            <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
        ) : (
            <Error sx={{ color: 'error.main', fontSize: 20 }} />
        );
    };

    const getResultColor = (result) => {
        if (!result) return 'default';
        return result.success ? 'success' : 'error';
    };

    return (
        <DashboardLayout
            title="Stats Management"
            navigationItems={navigationItems}
            onNavigationChange={handleNavigationChange}
            hideHeader={true}
            textColor="primary.main"
        >
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        Stats Management
                    </Typography>
                </Box>
                
                <Alert severity="info" sx={{ mb: 3 }}>
                    Use these tools to generate and recalculate statistics. This process may take several minutes 
                    depending on the amount of data. Please do not refresh the page during generation.
                </Alert>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    {statsActions.map((action) => (
                        <Grid item xs={12} sm={6} md={4} key={action.id}>
                            <Card 
                                sx={{ 
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: theme.shadows[4]
                                    }
                                }}
                            >
                                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Box sx={{ 
                                            mr: 2, 
                                            p: 1, 
                                            borderRadius: 1, 
                                            backgroundColor: `${action.color}.light`,
                                            color: `${action.color}.contrastText`
                                        }}>
                                            {action.icon}
                                        </Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {action.title}
                                        </Typography>
                                    </Box>
                                    
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                        {action.description}
                                    </Typography>

                                    <Button
                                        variant="contained"
                                        color={action.color}
                                        fullWidth
                                        onClick={() => handleGenerate(action.id, action.action, action.title)}
                                        disabled={loading[action.id]}
                                        startIcon={loading[action.id] ? <CircularProgress size={20} /> : action.icon}
                                        sx={{ mb: 2 }}
                                    >
                                        {loading[action.id] ? 'Generating...' : action.title}
                                    </Button>

                                    {results[action.id] && (
                                        <Alert 
                                            severity={getResultColor(results[action.id])}
                                            icon={getResultIcon(results[action.id])}
                                            sx={{ mt: 2 }}
                                        >
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {results[action.id].message}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {results[action.id].timestamp}
                                            </Typography>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Confirmation Dialog */}
                <Dialog open={confirmDialog.open} onClose={handleCancel} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        Confirm Generation
                    </DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to {confirmDialog.title.toLowerCase()}? 
                            This process may take several minutes and will recalculate all related statistics.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCancel} color="inherit">
                            Cancel
                        </Button>
                        <Button onClick={handleConfirm} color="primary" variant="contained">
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </DashboardLayout>
    );
};

export default StatsManagement;
