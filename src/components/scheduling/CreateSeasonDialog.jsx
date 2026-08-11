import React from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';

const ctrlSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '12px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' } };
const labelSx = { display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: 'var(--text-dim)', mb: '5px' };
const inputSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.82rem', width: '100%' };
const btnPrimarySx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '16px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', '&:disabled': { opacity: 0.6, cursor: 'default' } };
const dialogPaperSx = { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)' };
const dialogTitleSx = { color: 'var(--text)', fontWeight: 800, fontSize: '1.05rem' };

const CreateSeasonDialog = ({ open, onClose, newSeasonNumber, onNewSeasonNumberChange, creatingSeasonLoading, createSeasonProgress, onSubmit }) => (
    <Dialog open={open} onClose={() => !creatingSeasonLoading && onClose()} maxWidth="xs" fullWidth PaperProps={{ sx: dialogPaperSx }}>
        <DialogTitle sx={dialogTitleSx}>Create New Season for Scheduling</DialogTitle>
        <DialogContent>
            <Box sx={{ mt: '6px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <Box>
                    <Box component="label" sx={labelSx}>Season number</Box>
                    <Box component="input" type="number" value={newSeasonNumber} onChange={(e) => onNewSeasonNumberChange(e.target.value)} disabled={creatingSeasonLoading} sx={inputSx} />
                </Box>
                <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
                    This will create the season and auto-generate conference schedules for all conferences
                    (9 conference games per team, no protected rivalries). OOC weeks will be left blank.
                    You can modify everything afterwards.
                </Alert>
                {creatingSeasonLoading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CircularProgress size={18} />
                        <Box sx={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                            {createSeasonProgress || 'Creating season & generating schedules…'}
                        </Box>
                    </Box>
                )}
            </Box>
        </DialogContent>
        <DialogActions sx={{ px: '20px', pb: '18px' }}>
            <Box component="button" type="button" onClick={onClose} disabled={creatingSeasonLoading} sx={ctrlSx}>Cancel</Box>
            <Box component="button" type="button" onClick={onSubmit} disabled={creatingSeasonLoading} sx={btnPrimarySx}>
                {creatingSeasonLoading ? 'Creating…' : 'Create Season'}
            </Box>
        </DialogActions>
    </Dialog>
);

CreateSeasonDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    newSeasonNumber: PropTypes.string.isRequired,
    onNewSeasonNumberChange: PropTypes.func.isRequired,
    creatingSeasonLoading: PropTypes.bool,
    createSeasonProgress: PropTypes.string,
    onSubmit: PropTypes.func.isRequired,
};

export default CreateSeasonDialog;
