import React from 'react';
import { Box, TextField, Autocomplete, Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';

const ScrimmageDialog = ({ open, availableTeams, scrimmageTeams, onHomeTeamChange, onAwayTeamChange, onCancel, onSubmit, loading }) => (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Start Scrimmage</DialogTitle>
        <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Autocomplete
                    options={availableTeams}
                    getOptionLabel={(option) => option.name || ''}
                    value={availableTeams.find((team) => team.name === scrimmageTeams.homeTeam) || null}
                    onChange={(event, newValue) => onHomeTeamChange(newValue ? newValue.name : '')}
                    renderInput={(params) => <TextField {...params} label="Home Team" fullWidth />}
                    isOptionDisabled={(option) => option.name === scrimmageTeams.awayTeam}
                />
                <Autocomplete
                    options={availableTeams}
                    getOptionLabel={(option) => option.name || ''}
                    value={availableTeams.find((team) => team.name === scrimmageTeams.awayTeam) || null}
                    onChange={(event, newValue) => onAwayTeamChange(newValue ? newValue.name : '')}
                    renderInput={(params) => <TextField {...params} label="Away Team" fullWidth />}
                    isOptionDisabled={(option) => option.name === scrimmageTeams.homeTeam}
                />
            </Box>
        </DialogContent>
        <DialogActions>
            <Button onClick={onCancel}>Cancel</Button>
            <Button onClick={onSubmit} variant="contained" disabled={loading || !scrimmageTeams.homeTeam || !scrimmageTeams.awayTeam}>
                {loading ? <CircularProgress size={20} /> : 'Start Scrimmage'}
            </Button>
        </DialogActions>
    </Dialog>
);

ScrimmageDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    availableTeams: PropTypes.array.isRequired,
    scrimmageTeams: PropTypes.shape({
        homeTeam: PropTypes.string,
        awayTeam: PropTypes.string,
        scrimmageType: PropTypes.string,
    }).isRequired,
    onHomeTeamChange: PropTypes.func.isRequired,
    onAwayTeamChange: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    loading: PropTypes.bool,
};

export default ScrimmageDialog;
