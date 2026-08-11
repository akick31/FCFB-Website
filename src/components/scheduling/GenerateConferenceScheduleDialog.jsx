import React from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import { formatConference } from '../../utils/formatText';

const ctrlSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '12px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' } };
const btnPrimarySx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '16px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', '&:disabled': { opacity: 0.6, cursor: 'default' } };
const dialogPaperSx = { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)' };
const dialogTitleSx = { color: 'var(--text)', fontWeight: 800, fontSize: '1.05rem' };

const GenerateConferenceScheduleDialog = ({ open, onClose, selectedConference, season, conferenceTeams, numConferenceGames, protectedRivalries, confLoading, onGenerate }) => (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: dialogPaperSx }}>
        <DialogTitle sx={dialogTitleSx}>Auto-Generate {formatConference(selectedConference)} Conference Schedule</DialogTitle>
        <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', mt: '6px' }}>
                <Alert severity="warning">
                    This will replace all existing conference games for {formatConference(selectedConference)} in Season {season}.
                </Alert>

                <Alert severity="info">
                    {conferenceTeams.length} teams in conference.
                    {conferenceTeams.length <= numConferenceGames + 1
                        ? ` With ${conferenceTeams.length} teams, this will be a round robin where each team plays every other team once.`
                        : ` With more than ${numConferenceGames + 1} teams, protected rivalries determine guaranteed matchups. Remaining games are randomized.`
                    }
                </Alert>

                <Box sx={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    Using {numConferenceGames} conference games per team with {protectedRivalries.filter(r => r.team1 && r.team2).length} protected rivalries.
                    Adjust these in the Conference Rules section above.
                </Box>
            </Box>
        </DialogContent>
        <DialogActions sx={{ px: '20px', pb: '18px' }}>
            <Box component="button" type="button" onClick={onClose} sx={ctrlSx}>Cancel</Box>
            <Box component="button" type="button" onClick={onGenerate} disabled={confLoading} sx={btnPrimarySx}>
                {confLoading ? 'Generating...' : 'Generate Schedule'}
            </Box>
        </DialogActions>
    </Dialog>
);

GenerateConferenceScheduleDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    selectedConference: PropTypes.string.isRequired,
    season: PropTypes.number,
    conferenceTeams: PropTypes.array.isRequired,
    numConferenceGames: PropTypes.number.isRequired,
    protectedRivalries: PropTypes.array.isRequired,
    confLoading: PropTypes.bool,
    onGenerate: PropTypes.func.isRequired,
};

export default GenerateConferenceScheduleDialog;
