import React from 'react';
import {
    Box,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Button,
    CircularProgress,
} from '@mui/material';
import PropTypes from 'prop-types';
import FormField from '../admin/form/FormField';
import TeamSelect from '../ui/TeamSelect';

const TV_CHANNELS = [
    'ABC',
    'CBS',
    'ESPN',
    'ESPN2',
    'FOX',
    'FS1',
    'FS2',
    'NBC',
    'ACC Network',
    'Big Ten Network',
    'CBS Sports Network',
    'The CW',
    'ESPNU',
    'ESPN+',
    'SEC Network',
    'Pac-12 Network',
    'TNT',
    'Peacock',
    'ESPNEWS',
];

const StartGameDialog = ({ open, availableTeams, startGameData, onFieldChange, onCancel, onSubmit, loading }) => (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
        <DialogTitle>Start New Game</DialogTitle>
        <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="subtitle2">Game Configuration</Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                        select
                        label="Subdivision"
                        value={startGameData.subdivision}
                        onChange={(e) => onFieldChange('subdivision', e.target.value)}
                        sx={{ flex: '1 1 150px' }}
                        SelectProps={{ native: true }}
                    >
                        <option value="FCFB">FCFB</option>
                        <option value="FBS">FBS</option>
                        <option value="FCS">FCS</option>
                    </TextField>
                    <TextField
                        select
                        label="Game Type"
                        value={startGameData.gameType}
                        onChange={(e) => onFieldChange('gameType', e.target.value)}
                        sx={{ flex: '1 1 200px' }}
                        SelectProps={{ native: true }}
                    >
                        <option value="Out of Conference">Out of Conference</option>
                        <option value="Conference Game">Conference Game</option>
                        <option value="Conference Championship">Conference Championship</option>
                        <option value="Bowl Game">Bowl Game</option>
                        <option value="Playoff Game">Playoff Game</option>
                        <option value="National Championship">National Championship</option>
                        <option value="Scrimmage">Scrimmage</option>
                    </TextField>
                    <TextField
                        select
                        label="TV Channel"
                        value={startGameData.tvChannel}
                        onChange={(e) => onFieldChange('tvChannel', e.target.value)}
                        sx={{ flex: '1 1 150px' }}
                        SelectProps={{ native: true }}
                    >
                        {TV_CHANNELS.map((channel) => (
                            <option key={channel} value={channel}>
                                {channel}
                            </option>
                        ))}
                    </TextField>
                </Box>

                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                    Team Selection
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: '1 1 220px' }}>
                        <FormField label="Home team">
                            <TeamSelect
                                value={startGameData.homeTeam}
                                onChange={(value) => onFieldChange('homeTeam', value)}
                                teams={availableTeams.map((team) => team.name)}
                                exclude={startGameData.awayTeam}
                                ariaLabel="Home team"
                            />
                        </FormField>
                    </Box>
                    <Box sx={{ flex: '1 1 220px' }}>
                        <FormField label="Away team">
                            <TeamSelect
                                value={startGameData.awayTeam}
                                onChange={(value) => onFieldChange('awayTeam', value)}
                                teams={availableTeams.map((team) => team.name)}
                                exclude={startGameData.homeTeam}
                                ariaLabel="Away team"
                            />
                        </FormField>
                    </Box>
                </Box>
            </Box>
        </DialogContent>
        <DialogActions>
            <Button onClick={onCancel}>Cancel</Button>
            <Button
                onClick={onSubmit}
                variant="contained"
                disabled={loading || !startGameData.homeTeam || !startGameData.awayTeam}
            >
                {loading ? <CircularProgress size={20} /> : 'Start Game'}
            </Button>
        </DialogActions>
    </Dialog>
);

StartGameDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    availableTeams: PropTypes.array.isRequired,
    startGameData: PropTypes.shape({
        subdivision: PropTypes.string,
        homeTeam: PropTypes.string,
        awayTeam: PropTypes.string,
        tvChannel: PropTypes.string,
        gameType: PropTypes.string,
    }).isRequired,
    onFieldChange: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    loading: PropTypes.bool,
};

export default StartGameDialog;
