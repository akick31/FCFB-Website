import React from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import NumberInput from '../ui/NumberInput';
import { labelSx, primaryButtonSx, secondaryButtonSx } from '../../styles/controls';

const dialogPaperSx = { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)' };
const dialogTitleSx = { color: 'var(--text)', fontWeight: 800, fontSize: '1.05rem' };

const CreateSeasonDialog = ({
    open,
    onClose,
    newSeasonNumber,
    onNewSeasonNumberChange,
    creatingSeasonLoading,
    createSeasonProgress,
    onSubmit,
}) => (
    <Dialog
        open={open}
        onClose={() => !creatingSeasonLoading && onClose()}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: dialogPaperSx }}
    >
        <DialogTitle sx={dialogTitleSx}>Create New Season for Scheduling</DialogTitle>
        <DialogContent>
            <Box sx={{ mt: '6px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <Box>
                    <Box component="label" sx={labelSx}>
                        Season number
                    </Box>
                    <NumberInput
                        value={newSeasonNumber}
                        onChange={(next) => onNewSeasonNumberChange(String(next))}
                        min={1}
                        ariaLabel="Season number"
                        disabled={creatingSeasonLoading}
                    />
                </Box>
                <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
                    This will create the season and auto-generate conference schedules for all conferences (9 conference
                    games per team, no protected rivalries). OOC weeks will be left blank. You can modify everything
                    afterwards.
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
            <Box
                component="button"
                type="button"
                onClick={onClose}
                disabled={creatingSeasonLoading}
                sx={secondaryButtonSx}
            >
                Cancel
            </Box>
            <Box
                component="button"
                type="button"
                onClick={onSubmit}
                disabled={creatingSeasonLoading}
                sx={primaryButtonSx}
            >
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
