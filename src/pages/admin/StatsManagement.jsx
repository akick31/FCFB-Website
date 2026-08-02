import React, { useState } from 'react';
import { Box, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/ui/Panel';
import { generateAllRecords } from '../../api/recordsApi';
import { generateAllSeasonStats } from '../../api/seasonStatsApi';
import { generateAllLeagueStats } from '../../api/leagueStatsApi';
import { generateAllConferenceStats } from '../../api/conferenceStatsApi';
import { generateAllPlaybookStats } from '../../api/playbookStatsApi';

const rowSx = { display: 'flex', alignItems: 'center', gap: '14px', px: '16px', py: '14px', borderBottom: '1px solid var(--line-soft)', flexWrap: 'wrap', '&:last-of-type': { borderBottom: 0 } };
const lblSx = { fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)' };
const descSx = { color: 'var(--text-dim)', fontSize: '0.74rem' };
const runBtnSx = { ml: 'auto', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--field)', borderRadius: 'var(--r-sm)', px: '12px', py: '7px', font: 'inherit', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', '&:hover': { borderColor: 'var(--field)' }, '&:disabled': { opacity: 0.6, cursor: 'default' } };

const STATS_ACTIONS = [
    { id: 'records', title: 'Generate Records', description: 'Recalculate all game and season records', action: generateAllRecords },
    { id: 'season-stats', title: 'Generate Season Stats', description: 'Recalculate all team season statistics', action: generateAllSeasonStats },
    { id: 'league-stats', title: 'Generate League Stats', description: 'Recalculate all league-wide statistics', action: generateAllLeagueStats },
    { id: 'conference-stats', title: 'Generate Conference Stats', description: 'Recalculate all conference statistics', action: generateAllConferenceStats },
    { id: 'playbook-stats', title: 'Generate Playbook Stats', description: 'Recalculate all playbook statistics', action: generateAllPlaybookStats },
];

const StatsManagement = () => {
    const [loading, setLoading] = useState({});
    const [results, setResults] = useState({});
    const [error, setError] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, title: '' });

    const handleGenerate = (actionId, actionFunction, title) => {
        setConfirmDialog({
            open: true,
            action: () => executeGeneration(actionId, actionFunction),
            title: `Generate ${title}?`,
        });
    };

    const executeGeneration = async (actionId, actionFunction) => {
        setLoading((prev) => ({ ...prev, [actionId]: true }));
        setError(null);
        setResults((prev) => ({ ...prev, [actionId]: null }));

        try {
            await actionFunction();
            setResults((prev) => ({
                ...prev,
                [actionId]: { success: true, message: 'Generation completed successfully', timestamp: new Date().toLocaleString() },
            }));
        } catch (err) {
            console.error(`Error generating ${actionId}:`, err);
            setResults((prev) => ({
                ...prev,
                [actionId]: { success: false, message: err.response?.data?.message || err.message || 'Generation failed', timestamp: new Date().toLocaleString() },
            }));
            setError(`Failed to generate ${actionId}: ${err.message}`);
        } finally {
            setLoading((prev) => ({ ...prev, [actionId]: false }));
        }
    };

    const handleConfirm = () => {
        confirmDialog.action?.();
        setConfirmDialog({ open: false, action: null, title: '' });
    };

    const handleCancel = () => setConfirmDialog({ open: false, action: null, title: '' });

    return (
        <AdminLayout title="Stats Management">
            <Alert severity="info" sx={{ mb: '16px' }}>
                Use these tools to generate and recalculate statistics. This process may take several minutes
                depending on the amount of data. Please do not refresh the page during generation.
            </Alert>

            {error && <Alert severity="error" sx={{ mb: '16px' }} onClose={() => setError(null)}>{error}</Alert>}

            <Panel header="Generate statistics">
                {STATS_ACTIONS.map((action) => (
                    <Box key={action.id} sx={rowSx}>
                        <Box>
                            <Box sx={lblSx}>{action.title}</Box>
                            <Box sx={descSx}>{action.description}</Box>
                            {results[action.id] && (
                                <Box sx={{ mt: '6px', fontSize: '0.72rem', fontWeight: 700, color: results[action.id].success ? 'var(--field)' : 'var(--live)' }}>
                                    {results[action.id].success ? 'Success' : 'Failed'} &middot; {results[action.id].message} &middot; {results[action.id].timestamp}
                                </Box>
                            )}
                        </Box>
                        <Box component="button" type="button" onClick={() => handleGenerate(action.id, action.action, action.title)} disabled={loading[action.id]} sx={runBtnSx}>
                            {loading[action.id] ? <CircularProgress size={14} /> : null}
                            {loading[action.id] ? 'Generating...' : 'Run'}
                        </Box>
                    </Box>
                ))}
            </Panel>

            <Dialog open={confirmDialog.open} onClose={handleCancel} maxWidth="sm" fullWidth>
                <DialogTitle>Confirm Generation</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to {confirmDialog.title.toLowerCase()}?
                        This process may take several minutes and will recalculate all related statistics.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel} color="inherit">Cancel</Button>
                    <Button onClick={handleConfirm} color="primary" variant="contained">Confirm</Button>
                </DialogActions>
            </Dialog>
        </AdminLayout>
    );
};

export default StatsManagement;
