import React from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import { secondaryButtonSx } from '../../styles/controls';

const dialogPaperSx = { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)' };
const dialogTitleSx = { color: 'var(--text)', fontWeight: 800, fontSize: '1.05rem' };

const ValidateScheduleDialog = ({ open, onClose, season, validating, validationResult }) => (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: dialogPaperSx }}>
        <DialogTitle sx={dialogTitleSx}>Validate Season {season} Schedule</DialogTitle>
        <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', mt: '6px' }}>
                {validating ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CircularProgress size={18} />
                        <Box sx={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                            Checking every active team&apos;s schedule…
                        </Box>
                    </Box>
                ) : (
                    validationResult &&
                    (validationResult.valid ? (
                        <Alert severity="success">
                            Every active team has a game scheduled in every week (1-12). This season&apos;s schedule is
                            ready to start.
                        </Alert>
                    ) : (
                        <>
                            <Alert severity="warning">
                                {validationResult.incompleteTeams.length} team
                                {validationResult.incompleteTeams.length > 1 ? 's are' : ' is'} missing games. The
                                schedule must be complete before starting the season.
                            </Alert>
                            <Box
                                sx={{
                                    maxHeight: 320,
                                    overflowY: 'auto',
                                    border: '1px solid var(--line)',
                                    borderRadius: 'var(--r-sm)',
                                }}
                            >
                                {validationResult.incompleteTeams.map((gap) => (
                                    <Box
                                        key={gap.team}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            gap: '12px',
                                            px: '12px',
                                            py: '8px',
                                            fontSize: '0.82rem',
                                            borderBottom: '1px solid var(--line-soft)',
                                            '&:last-of-type': { borderBottom: 0 },
                                        }}
                                    >
                                        <Box component="b">{gap.team}</Box>
                                        <Box sx={{ color: 'var(--live)' }}>
                                            Missing week{gap.missingWeeks.length > 1 ? 's' : ''}{' '}
                                            {gap.missingWeeks.join(', ')}
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </>
                    ))
                )}
            </Box>
        </DialogContent>
        <DialogActions sx={{ px: '20px', pb: '18px' }}>
            <Box component="button" type="button" onClick={onClose} sx={secondaryButtonSx}>
                Close
            </Box>
        </DialogActions>
    </Dialog>
);

ValidateScheduleDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    season: PropTypes.number,
    validating: PropTypes.bool,
    validationResult: PropTypes.object,
};

export default ValidateScheduleDialog;
