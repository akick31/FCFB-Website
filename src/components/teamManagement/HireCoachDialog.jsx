import React from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem, Alert, Autocomplete, TextField } from '@mui/material';
import PropTypes from 'prop-types';

const HireCoachDialog = ({
    open, teamName, users, selectedUser, onSelectedUserChange, selectedPosition, onSelectedPositionChange,
    processing, dialogError, onCancel, onHireInterim, onHire,
}) => (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Hire Coach for {teamName}</DialogTitle>
        <DialogContent>
            <Box sx={{ pt: 2 }}>
                <Autocomplete
                    options={users}
                    getOptionLabel={(option) => option.username}
                    value={selectedUser}
                    onChange={(event, newValue) => onSelectedUserChange(newValue)}
                    renderInput={(params) => (
                        <TextField {...params} label="Select User" placeholder="Start typing to search users..." fullWidth sx={{ mb: 2 }} />
                    )}
                    filterOptions={(options, { inputValue }) => {
                        const filterValue = inputValue.toLowerCase();
                        return options.filter((option) => option.username.toLowerCase().includes(filterValue));
                    }}
                />
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Coach Position</InputLabel>
                    <Select value={selectedPosition} onChange={(e) => onSelectedPositionChange(e.target.value)} label="Coach Position">
                        <MenuItem value="HEAD_COACH">Head Coach</MenuItem>
                        <MenuItem value="OFFENSIVE_COORDINATOR">Offensive Coordinator</MenuItem>
                        <MenuItem value="DEFENSIVE_COORDINATOR">Defensive Coordinator</MenuItem>
                    </Select>
                </FormControl>
                {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
            </Box>
        </DialogContent>
        <DialogActions>
            <Button onClick={onCancel} disabled={processing}>Cancel</Button>
            <Button onClick={onHireInterim} color="warning" variant="contained" disabled={processing}>Hire Interim Coach</Button>
            <Button onClick={onHire} color="primary" variant="contained" disabled={processing}>Hire Coach</Button>
        </DialogActions>
    </Dialog>
);

HireCoachDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    teamName: PropTypes.string,
    users: PropTypes.array.isRequired,
    selectedUser: PropTypes.object,
    onSelectedUserChange: PropTypes.func.isRequired,
    selectedPosition: PropTypes.string.isRequired,
    onSelectedPositionChange: PropTypes.func.isRequired,
    processing: PropTypes.bool,
    dialogError: PropTypes.string,
    onCancel: PropTypes.func.isRequired,
    onHireInterim: PropTypes.func.isRequired,
    onHire: PropTypes.func.isRequired,
};

export default HireCoachDialog;
