import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { formatPosition } from '../../utils/formatText';

const FireConfirmDialog = ({ target, processing, dialogError, onCancel, onConfirm }) => (
    <Dialog open={Boolean(target)} onClose={onCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Fire {target?.coach.name} from {target?.team.name}?</DialogTitle>
        <DialogContent>
            <Typography>
                Are you sure you want to fire {target?.coach.name} ({formatPosition(target?.coach.position)}) from {target?.team.name}? This action cannot be undone.
            </Typography>
            {dialogError && <Alert severity="error" sx={{ mt: 2 }}>{dialogError}</Alert>}
        </DialogContent>
        <DialogActions>
            <Button onClick={onCancel} disabled={processing}>Cancel</Button>
            <Button onClick={onConfirm} color="error" variant="contained" disabled={processing}>Fire Coach</Button>
        </DialogActions>
    </Dialog>
);

FireConfirmDialog.propTypes = {
    target: PropTypes.shape({
        team: PropTypes.object.isRequired,
        coach: PropTypes.object.isRequired,
    }),
    processing: PropTypes.bool,
    dialogError: PropTypes.string,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
};

export default FireConfirmDialog;
