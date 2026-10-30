import React from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import FormField from '../admin/form/FormField';
import TeamSelect from '../ui/TeamSelect';

const ScrimmageDialog = ({
    open,
    availableTeams,
    scrimmageTeams,
    onHomeTeamChange,
    onAwayTeamChange,
    onCancel,
    onSubmit,
    loading,
}) => (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Start Scrimmage</DialogTitle>
        <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormField label="Home team">
                    <TeamSelect
                        value={scrimmageTeams.homeTeam}
                        onChange={onHomeTeamChange}
                        teams={availableTeams.map((team) => team.name)}
                        exclude={scrimmageTeams.awayTeam}
                        ariaLabel="Home team"
                    />
                </FormField>
                <FormField label="Away team">
                    <TeamSelect
                        value={scrimmageTeams.awayTeam}
                        onChange={onAwayTeamChange}
                        teams={availableTeams.map((team) => team.name)}
                        exclude={scrimmageTeams.homeTeam}
                        ariaLabel="Away team"
                    />
                </FormField>
            </Box>
        </DialogContent>
        <DialogActions>
            <Button onClick={onCancel}>Cancel</Button>
            <Button
                onClick={onSubmit}
                variant="contained"
                disabled={loading || !scrimmageTeams.homeTeam || !scrimmageTeams.awayTeam}
            >
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
