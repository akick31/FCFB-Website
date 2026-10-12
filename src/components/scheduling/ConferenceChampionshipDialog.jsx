import React from 'react';
import { Box, TextField, Autocomplete, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from '@mui/material';
import PostseasonTeamOption from './PostseasonTeamOption';
import {
    btnPrimarySx,
    ctrlSx,
    labelSx,
    selectSx,
    dialogPaperSx,
    dialogTitleSx,
    autocompleteSx,
} from './postseasonStyles';

const ConferenceChampionshipDialog = ({
    open,
    onClose,
    conference,
    onConferenceChange,
    onHomeChange,
    onAwayChange,
    conferences,
    teams,
    awayTeam,
    homeTeam,
    teamMap,
    onSubmit,
}) => (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: dialogPaperSx }}>
        <DialogTitle sx={dialogTitleSx}>Add Conference Championship Game</DialogTitle>
        <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', mt: '6px' }}>
                <Alert severity="info">Week 13 · Conference Championship</Alert>

                <Box>
                    <Box component="label" sx={labelSx}>
                        Conference
                    </Box>
                    <Box
                        component="select"
                        value={conference}
                        onChange={(e) => {
                            onConferenceChange(e.target.value);
                            onHomeChange(null);
                            onAwayChange(null);
                        }}
                        sx={selectSx}
                    >
                        <option value="">Select conference...</option>
                        {conferences.map((c) => (
                            <option key={c.code} value={c.code}>
                                {c.label}
                            </option>
                        ))}
                    </Box>
                </Box>

                <Autocomplete
                    options={teams.filter((t) => t.name !== awayTeam?.name)}
                    getOptionLabel={(option) => option.name || ''}
                    value={homeTeam}
                    onChange={(_, v) => onHomeChange(v)}
                    disabled={!conference}
                    sx={autocompleteSx}
                    renderInput={(params) => <TextField {...params} label="Home Team" size="small" />}
                    renderOption={(props, option) => (
                        <PostseasonTeamOption key={props.key} optionProps={props} team={option} teamMap={teamMap} />
                    )}
                    isOptionEqualToValue={(option, value) => option.name === value?.name}
                />

                <Autocomplete
                    options={teams.filter((t) => t.name !== homeTeam?.name)}
                    getOptionLabel={(option) => option.name || ''}
                    value={awayTeam}
                    onChange={(_, v) => onAwayChange(v)}
                    disabled={!conference}
                    sx={autocompleteSx}
                    renderInput={(params) => <TextField {...params} label="Away Team" size="small" />}
                    renderOption={(props, option) => (
                        <PostseasonTeamOption key={props.key} optionProps={props} team={option} teamMap={teamMap} />
                    )}
                    isOptionEqualToValue={(option, value) => option.name === value?.name}
                />
            </Box>
        </DialogContent>
        <DialogActions sx={{ px: '20px', pb: '18px' }}>
            <Box component="button" type="button" onClick={onClose} sx={ctrlSx}>
                Cancel
            </Box>
            <Box
                component="button"
                type="button"
                onClick={onSubmit}
                disabled={!homeTeam || !awayTeam}
                sx={{
                    ...btnPrimarySx,
                    opacity: !homeTeam || !awayTeam ? 0.6 : 1,
                    pointerEvents: !homeTeam || !awayTeam ? 'none' : 'auto',
                }}
            >
                Schedule CCG
            </Box>
        </DialogActions>
    </Dialog>
);

export default ConferenceChampionshipDialog;
