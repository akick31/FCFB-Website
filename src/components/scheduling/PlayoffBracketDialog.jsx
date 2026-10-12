import React from 'react';
import {
    Box,
    Grid,
    TextField,
    Autocomplete,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Divider,
} from '@mui/material';
import PostseasonTeamOption from './PostseasonTeamOption';
import Postseason from '../schedule/Postseason';
import { btnLiveSx, ctrlSx, dialogPaperSx, dialogTitleSx, autocompleteSx } from './postseasonStyles';

const PlayoffBracketDialog = ({
    open,
    onClose,
    existingGames,
    getAvailableTeams,
    teams,
    onTeamsChange,
    teamMap,
    previewScheduleEntries,
    onSubmit,
}) => (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth PaperProps={{ sx: dialogPaperSx }}>
        <DialogTitle sx={dialogTitleSx}>
            {existingGames.length > 0 ? 'Edit 24-Team Playoff Bracket' : 'Set Up 24-Team Playoff Bracket'}
        </DialogTitle>
        <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', mt: '6px' }}>
                <Alert severity="info">
                    24-team single elimination. Seeds 1-8 receive a first round bye. First round: #9 vs #24, #10 vs #23,
                    etc. Higher seed is home team. R1 = Week 14, R2 = Week 15, QF = Week 16, SF = Week 17, NCG = Week
                    18.
                </Alert>

                {existingGames.length > 0 && (
                    <Alert severity="warning">
                        Existing playoff games will be replaced. R1 and R2 placeholder games will be regenerated.
                    </Alert>
                )}

                <Divider />

                <Box sx={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text)' }}>
                    Fill in the bracket by seed (1 = best, 24 = worst)
                </Box>

                <Box sx={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    Each team can only appear once. Selected teams are automatically removed from other dropdowns.
                </Box>

                <Grid container spacing={1}>
                    {Array.from({ length: 24 }, (_, i) => (
                        <Grid item xs={12} sm={6} md={4} key={i}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {i < 8 && (
                                    <Box
                                        component="span"
                                        sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            minWidth: 42,
                                            height: 22,
                                            border: '1px solid var(--brand)',
                                            color: 'var(--brand)',
                                            borderRadius: 'var(--r-sm)',
                                            fontSize: '0.62rem',
                                            fontWeight: 800,
                                            letterSpacing: '0.05em',
                                        }}
                                    >
                                        BYE
                                    </Box>
                                )}
                                <Box
                                    component="span"
                                    sx={{
                                        fontWeight: 700,
                                        minWidth: 30,
                                        fontSize: '0.85rem',
                                        color: 'var(--text)',
                                    }}
                                >
                                    #{i + 1}
                                </Box>
                                <Autocomplete
                                    options={getAvailableTeams(i)}
                                    getOptionLabel={(option) => option.name || ''}
                                    value={teams[i]}
                                    onChange={(_, v) => {
                                        const updated = [...teams];
                                        updated[i] = v;
                                        onTeamsChange(updated);
                                    }}
                                    renderInput={(params) => (
                                        <TextField {...params} label={`Seed ${i + 1}`} size="small" />
                                    )}
                                    renderOption={(props, option) => (
                                        <PostseasonTeamOption
                                            key={props.key}
                                            optionProps={props}
                                            team={option}
                                            teamMap={teamMap}
                                        />
                                    )}
                                    sx={{ ...autocompleteSx, flex: 1 }}
                                    isOptionEqualToValue={(option, value) => option.name === value?.name}
                                />
                            </Box>
                        </Grid>
                    ))}
                </Grid>

                {previewScheduleEntries.length > 0 && (
                    <>
                        <Divider sx={{ my: '10px' }} />
                        <Box sx={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text)', mb: '4px' }}>
                            Bracket Preview
                        </Box>
                        <Postseason postseasonSchedule={previewScheduleEntries} teamMap={teamMap} />
                    </>
                )}
            </Box>
        </DialogContent>
        <DialogActions sx={{ px: '20px', pb: '18px' }}>
            <Box component="button" type="button" onClick={onClose} sx={ctrlSx}>
                Cancel
            </Box>
            <Box component="button" type="button" onClick={onSubmit} sx={btnLiveSx}>
                {existingGames.length > 0 ? 'Regenerate Bracket' : 'Finalize Bracket'}
            </Box>
        </DialogActions>
    </Dialog>
);

export default PlayoffBracketDialog;
