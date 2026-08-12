import React from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import PropTypes from 'prop-types';
import { formatPosition } from '../../utils/formatText';

const pickerRowSx = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', px: '4px', py: '10px', borderBottom: '1px solid var(--line-soft)', '&:last-of-type': { borderBottom: 0 } };
const fireBtnSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--live)', borderRadius: 'var(--r-sm)', px: '10px', height: '30px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--live)' } };

const FirePickerDialog = ({ team, roster, onCancel, onSelectCoach }) => (
    <Dialog open={Boolean(team)} onClose={onCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Fire which coach from {team?.name}?</DialogTitle>
        <DialogContent>
            {team && roster.map((coach) => (
                <Box key={coach.username} sx={pickerRowSx}>
                    <Box>
                        <Box sx={{ fontWeight: 700 }}>{coach.name}</Box>
                        <Box sx={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{formatPosition(coach.position)}</Box>
                    </Box>
                    <Box component="button" type="button" onClick={() => onSelectCoach(coach)} sx={fireBtnSx}>
                        Fire
                    </Box>
                </Box>
            ))}
        </DialogContent>
        <DialogActions>
            <Button onClick={onCancel}>Cancel</Button>
        </DialogActions>
    </Dialog>
);

FirePickerDialog.propTypes = {
    team: PropTypes.object,
    roster: PropTypes.array.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSelectCoach: PropTypes.func.isRequired,
};

export default FirePickerDialog;
