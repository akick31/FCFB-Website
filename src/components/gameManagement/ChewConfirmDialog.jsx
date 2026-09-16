import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Alert, Button } from '@mui/material';
import PropTypes from 'prop-types';

const ChewConfirmDialog = ({ open, chewing, awayTeam, homeTeam, processing, onCancel, onConfirm }) => (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
        <DialogTitle>
            {chewing ? `Take ${awayTeam} at ${homeTeam} out of chew mode?` : `Put ${awayTeam} at ${homeTeam} in chew mode?`}
        </DialogTitle>
        <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
                {chewing
                    ? 'Plays will go back to running off the offense’s normal amount of time.'
                    : 'Every remaining play will burn 30 seconds off the clock instead of the offense’s normal runoff.'}
            </Typography>
            <Alert severity="warning">
                This is recorded against your account and announced in the game thread.
            </Alert>
        </DialogContent>
        <DialogActions>
            <Button onClick={onCancel} disabled={processing}>Cancel</Button>
            <Button onClick={onConfirm} color="warning" variant="contained" disabled={processing}>
                {chewing ? 'Take out of chew mode' : 'Chew game'}
            </Button>
        </DialogActions>
    </Dialog>
);

ChewConfirmDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    chewing: PropTypes.bool,
    awayTeam: PropTypes.string,
    homeTeam: PropTypes.string,
    processing: PropTypes.bool,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
};

export default ChewConfirmDialog;
