import React from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from '@mui/material';
import PropTypes from 'prop-types';

const ctrlSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '12px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' } };
const btnPrimarySx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '16px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', '&:disabled': { opacity: 0.6, cursor: 'default' } };
const dialogPaperSx = { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)' };
const dialogTitleSx = { color: 'var(--text)', fontWeight: 800, fontSize: '1.05rem' };

const OocScheduleDialog = ({ open, onClose, season, oocLoading, oocResult, onGenerate }) => (
    <Dialog open={open} onClose={() => !oocLoading && onClose()} maxWidth="sm" fullWidth PaperProps={{ sx: dialogPaperSx }}>
        <DialogTitle sx={dialogTitleSx}>Auto-Generate Out-of-Conference Schedule</DialogTitle>
        <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', mt: '6px' }}>
                {!oocResult ? (
                    <>
                        <Alert severity="info">
                            Fills every active team&apos;s remaining open weeks (1-12) in Season {season} with random,
                            cross-conference opponents. Existing games are never touched or overwritten.
                        </Alert>
                        <Box sx={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                            If a team can&apos;t be matched for a given week (no valid opponent left), that slot is
                            reported back so you can fill it manually.
                        </Box>
                    </>
                ) : (
                    <>
                        <Alert severity={oocResult.unmatchedSlots?.length > 0 ? 'warning' : 'success'}>
                            Scheduled {oocResult.gamesScheduled} OOC games.
                            {oocResult.unmatchedSlots?.length > 0
                                ? ` ${oocResult.unmatchedSlots.length} slot(s) couldn't be matched.`
                                : ' Every team’s schedule is full.'}
                        </Alert>
                        {oocResult.unmatchedSlots?.length > 0 && (
                            <Box sx={{ maxHeight: 240, overflowY: 'auto', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)' }}>
                                {oocResult.unmatchedSlots.map((slot, i) => (
                                    <Box key={`${slot.team}-${slot.week}-${i}`} sx={{ display: 'flex', justifyContent: 'space-between', px: '12px', py: '8px', fontSize: '0.82rem', borderBottom: '1px solid var(--line-soft)', '&:last-of-type': { borderBottom: 0 } }}>
                                        <Box>{slot.team}</Box>
                                        <Box sx={{ color: 'var(--text-dim)' }}>Week {slot.week}</Box>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </>
                )}
            </Box>
        </DialogContent>
        <DialogActions sx={{ px: '20px', pb: '18px' }}>
            <Box component="button" type="button" onClick={onClose} disabled={oocLoading} sx={ctrlSx}>
                {oocResult ? 'Close' : 'Cancel'}
            </Box>
            {!oocResult && (
                <Box component="button" type="button" onClick={onGenerate} disabled={oocLoading} sx={btnPrimarySx}>
                    {oocLoading ? 'Generating...' : 'Generate OOC Schedule'}
                </Box>
            )}
        </DialogActions>
    </Dialog>
);

OocScheduleDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    season: PropTypes.number,
    oocLoading: PropTypes.bool,
    oocResult: PropTypes.object,
    onGenerate: PropTypes.func.isRequired,
};

export default OocScheduleDialog;
