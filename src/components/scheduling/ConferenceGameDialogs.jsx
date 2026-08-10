import React from 'react';
import { Box, TextField, Autocomplete, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import PropTypes from 'prop-types';
import TeamMark from '../ui/TeamMark';
import { isRealTeam } from '../../utils/teamDataUtils';
import { field } from '../../utils/fieldHelper';
import { weekLabel } from '../../utils/formatText';

const TOTAL_WEEKS = 12;

const selectSx = { border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.82rem', cursor: 'pointer', '& option': { background: 'var(--surface)', color: 'var(--text)' } };
const ctrlSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '12px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' } };
const inputSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.82rem', width: '100%' };
const btnPrimarySx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '16px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' };
const dialogPaperSx = { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)' };
const dialogTitleSx = { color: 'var(--text)', fontWeight: 800, fontSize: '1.05rem' };
const autocompleteSx = { '& .MuiOutlinedInput-root': { borderRadius: 'var(--r-sm)' } };
const errorTextSx = { mt: '4px', fontSize: '0.7rem', color: 'var(--live)' };
const labelSx = { display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: 'var(--text-dim)', mb: '5px' };

const ConferenceGameDialogs = ({ editor, allTeams, teamsMap }) => {
    const {
        addGameDialogOpen, setAddGameDialogOpen,
        addGameWeek, setAddGameWeek,
        addGameType, setAddGameType,
        addGameHome, addGameAway,
        addGameNeutralSite, setAddGameNeutralSite,
        addGameVenue, setAddGameVenue,
        handleAddGameHomeChange, handleAddGameAwayChange, handleAddGame,
        teamWeekOccupiedAll,
        moveDialogOpen, setMoveDialogOpen,
        moveGameData, setMoveGameData,
        moveToWeek, setMoveToWeek,
        handleMoveGame, handleDeleteGame,
    } = editor;

    return (
        <>
            <Dialog open={addGameDialogOpen} onClose={() => setAddGameDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: dialogPaperSx }}>
                <DialogTitle sx={dialogTitleSx}>Add Game</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', mt: '6px' }}>
                        <Box>
                            <Box component="label" sx={labelSx}>Week</Box>
                            <Box component="select" value={addGameWeek} onChange={(e) => setAddGameWeek(Number(e.target.value))} sx={{ ...selectSx, width: '100%' }}>
                                {Array.from({ length: TOTAL_WEEKS }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>{weekLabel(i + 1)}</option>
                                ))}
                            </Box>
                        </Box>

                        <Autocomplete
                            options={allTeams.filter((t) => {
                                if (!t.active || !isRealTeam(t)) return false;
                                if (addGameWeek) return !teamWeekOccupiedAll.has(`${t.name}|${addGameWeek}`);
                                return true;
                            })}
                            getOptionLabel={(option) => option.name || ''}
                            value={addGameHome}
                            onChange={(_, v) => handleAddGameHomeChange(v)}
                            sx={autocompleteSx}
                            renderInput={(params) => <TextField {...params} label="Home Team" size="small" />}
                            renderOption={(props, option) => {
                                const { key, ...otherProps } = props;
                                return (
                                    <Box component="li" key={key} {...otherProps} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <TeamMark team={teamsMap[option.name] || { name: option.name, abbreviation: option.abbreviation }} size={20} />
                                        <Box component="span" sx={{ fontSize: '0.85rem' }}>{option.name}</Box>
                                    </Box>
                                );
                            }}
                            isOptionEqualToValue={(option, value) => option.name === value?.name}
                        />

                        <Autocomplete
                            options={(() => {
                                let opts;
                                if (addGameType === 'OUT_OF_CONFERENCE') {
                                    opts = allTeams.filter((t) => t.active && isRealTeam(t) && t.conference !== addGameHome?.conference);
                                } else {
                                    opts = allTeams.filter((t) => t.active && isRealTeam(t) && t.conference === addGameHome?.conference && t.name !== addGameHome?.name);
                                }
                                if (addGameWeek) opts = opts.filter((t) => !teamWeekOccupiedAll.has(`${t.name}|${addGameWeek}`));
                                return opts;
                            })()}
                            getOptionLabel={(option) => option.name || ''}
                            value={addGameAway}
                            onChange={(_, v) => handleAddGameAwayChange(v)}
                            sx={autocompleteSx}
                            renderInput={(params) => <TextField {...params} label="Away Team" size="small" />}
                            renderOption={(props, option) => {
                                const { key, ...otherProps } = props;
                                return (
                                    <Box component="li" key={key} {...otherProps} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <TeamMark team={teamsMap[option.name] || { name: option.name, abbreviation: option.abbreviation }} size={20} />
                                        <Box component="span" sx={{ fontSize: '0.85rem' }}>{option.name}</Box>
                                    </Box>
                                );
                            }}
                            isOptionEqualToValue={(option, value) => option.name === value?.name}
                        />

                        <Box component="label" sx={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <Box component="input" type="checkbox" checked={addGameNeutralSite} onChange={(e) => setAddGameNeutralSite(e.target.checked)} />
                            <Box component="span" sx={{ fontSize: '0.85rem' }}>Neutral site game</Box>
                        </Box>

                        {addGameNeutralSite && (
                            <Box>
                                <Box component="label" sx={labelSx}>Venue</Box>
                                <Box
                                    component="input"
                                    value={addGameVenue}
                                    onChange={(e) => setAddGameVenue(e.target.value)}
                                    placeholder="e.g., Mercedes-Benz Stadium, Atlanta, GA"
                                    sx={{ ...inputSx, borderColor: !addGameVenue.trim() ? 'var(--live)' : 'var(--line)' }}
                                />
                                {!addGameVenue.trim() && <Box sx={errorTextSx}>Venue is required for a neutral site game</Box>}
                            </Box>
                        )}

                        <Box>
                            <Box component="label" sx={labelSx}>Game type</Box>
                            <Box component="select" value={addGameType} onChange={(e) => setAddGameType(e.target.value)} sx={{ ...selectSx, width: '100%' }}>
                                <option value="CONFERENCE_GAME">Conference Game</option>
                                <option value="OUT_OF_CONFERENCE">Out of Conference</option>
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: '20px', pb: '18px' }}>
                    <Box component="button" type="button" onClick={() => setAddGameDialogOpen(false)} sx={ctrlSx}>Cancel</Box>
                    <Box component="button" type="button" onClick={handleAddGame} sx={btnPrimarySx}>Add Game</Box>
                </DialogActions>
            </Dialog>

            <Dialog open={moveDialogOpen} onClose={() => setMoveDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: dialogPaperSx }}>
                <DialogTitle sx={dialogTitleSx}>Move or Remove Game</DialogTitle>
                <DialogContent>
                    {moveGameData && (() => {
                        const home = field(moveGameData, 'homeTeam', 'home_team') || moveGameData.opponent;
                        const away = field(moveGameData, 'awayTeam', 'away_team') || '';
                        return (
                            <Box sx={{ mt: '6px' }}>
                                <Box sx={{ mb: '14px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    {home} vs {away || moveGameData.opponent} (Week {moveGameData.week})
                                </Box>
                                <Box>
                                    <Box component="label" sx={labelSx}>Move to week</Box>
                                    <Box component="select" value={moveToWeek} onChange={(e) => setMoveToWeek(Number(e.target.value))} sx={{ ...selectSx, width: '100%' }}>
                                        {Array.from({ length: TOTAL_WEEKS }, (_, i) => {
                                            const weekNum = i + 1;
                                            const homeOccupied = teamWeekOccupiedAll.has(`${home}|${weekNum}`);
                                            const awayOccupied = away && teamWeekOccupiedAll.has(`${away}|${weekNum}`);
                                            const isOccupied = homeOccupied || awayOccupied;
                                            const isCurrentWeek = weekNum === moveGameData.week;
                                            if (isOccupied && !isCurrentWeek) return null;
                                            return <option key={weekNum} value={weekNum}>Week {weekNum}</option>;
                                        })}
                                    </Box>
                                </Box>
                            </Box>
                        );
                    })()}
                </DialogContent>
                <DialogActions sx={{ px: '20px', pb: '18px' }}>
                    {moveGameData && (
                        <Box
                            component="button" type="button"
                            onClick={() => {
                                if (moveGameData?.id) {
                                    handleDeleteGame(moveGameData.id);
                                    setMoveDialogOpen(false);
                                    setMoveGameData(null);
                                }
                            }}
                            sx={{ ...ctrlSx, color: 'var(--live)', mr: 'auto' }}
                        >
                            Delete Game
                        </Box>
                    )}
                    <Box component="button" type="button" onClick={() => setMoveDialogOpen(false)} sx={ctrlSx}>Cancel</Box>
                    <Box component="button" type="button" onClick={handleMoveGame} sx={btnPrimarySx}>Move</Box>
                </DialogActions>
            </Dialog>
        </>
    );
};

ConferenceGameDialogs.propTypes = {
    editor: PropTypes.object.isRequired,
    allTeams: PropTypes.array.isRequired,
    teamsMap: PropTypes.object.isRequired,
};

export default ConferenceGameDialogs;
