import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Alert, Button } from '@mui/material';
import PropTypes from 'prop-types';

const ChewAllConfirmDialog = ({ open, processing, onCancel, onConfirm }) => (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Put every ongoing game in chew mode?</DialogTitle>
        <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
                Every remaining play in every ongoing game will burn 30 seconds off the clock instead of the offense&apos;s normal runoff.
            </Typography>
            <Alert severity="warning">
                This ignores the filters on this page and applies to all ongoing games. Each change is recorded against your account and announced in that game&apos;s thread.
            </Alert>
        </DialogContent>
        <DialogActions>
            <Button onClick={onCancel} disabled={processing}>Cancel</Button>
            <Button onClick={onConfirm} color="warning" variant="contained" disabled={processing}>Chew all games</Button>
        </DialogActions>
    </Dialog>
);

ChewAllConfirmDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    processing: PropTypes.bool,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
};

export default ChewAllConfirmDialog;
