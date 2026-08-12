import React from 'react';
import { Box, TextField, Autocomplete, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress } from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';
import TeamMark from '../ui/TeamMark';
import { isRealTeam } from '../../utils/teamDataUtils';
import { formatGameType, weekLabel } from '../../utils/formatText';

const TOTAL_WEEKS = 12;

const selectSx = { border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.82rem', cursor: 'pointer', '& option': { background: 'var(--surface)', color: 'var(--text)' } };
const ctrlSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '12px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' } };
const labelSx = { display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: 'var(--text-dim)', mb: '5px' };
const inputSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.82rem', width: '100%' };
const btnPrimarySx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '16px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', '&:disabled': { opacity: 0.6, cursor: 'default' } };
const dialogPaperSx = { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)' };
const dialogTitleSx = { color: 'var(--text)', fontWeight: 800, fontSize: '1.05rem' };
const autocompleteSx = { '& .MuiOutlinedInput-root': { borderRadius: 'var(--r-sm)' } };
const errorTextSx = { mt: '4px', fontSize: '0.7rem', color: 'var(--live)' };
const hintTextSx = { fontSize: '0.72rem', color: 'var(--text-dim)' };

const AddGameDialog = ({ open, onClose, dialog, allTeams, teamMap, teamWeekOccupiedAll, venueNames = [] }) => {
    const {
        addGameWeek, setAddGameWeek,
        addGameHome, addGameAway,
        addGameType, setAddGameType,
        addGamePlayoffRound, setAddGamePlayoffRound,
        addGameHomeSeed, setAddGameHomeSeed,
        addGameAwaySeed, setAddGameAwaySeed,
        addGameBowlName, setAddGameBowlName,
        addGameLogo, setAddGameLogo,
        addGameLogoPreview, setAddGameLogoPreview,
        uploadingLogo,
        addGameNeutralSite, setAddGameNeutralSite,
        addGameVenue, setAddGameVenue,
        isImplicitNeutralSite, isNeutralSite,
        handleBowlNameBlur,
        handleHomeChange, handleAwayChange,
        handleUploadLogo,
        handleAddGame,
    } = dialog;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: dialogPaperSx }}>
            <DialogTitle sx={dialogTitleSx}>Add {formatGameType(addGameType)}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', mt: '6px' }}>
                    {addGameType !== 'BOWL' && addGameType !== 'PLAYOFFS' && addGameType !== 'CONFERENCE_CHAMPIONSHIP' && addGameType !== 'NATIONAL_CHAMPIONSHIP' && (
                        <Box>
                            <Box component="label" sx={labelSx}>Week</Box>
                            <Box component="select" value={addGameWeek} onChange={(e) => setAddGameWeek(Number(e.target.value))} sx={{ ...selectSx, width: '100%' }}>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>{weekLabel(i + 1)}</option>
                                ))}
                            </Box>
                        </Box>
                    )}
                    {addGameType === 'BOWL' && (
                        <Alert severity="info" sx={{ py: 0.5 }}>
                            Bowl games are always scheduled for Week 14
                        </Alert>
                    )}

                    <Autocomplete
                        options={allTeams.filter(t => {
                            if (!t.active || !isRealTeam(t)) return false;
                            if (addGameWeek && addGameWeek <= TOTAL_WEEKS) {
                                return !teamWeekOccupiedAll.has(`${t.name}|${addGameWeek}`);
                            }
                            return true;
                        })}
                        getOptionLabel={(option) => option.name || ''}
                        value={addGameHome}
                        onChange={(_, v) => handleHomeChange(v)}
                        sx={autocompleteSx}
                        renderInput={(params) => (
                            <TextField {...params} label="Home Team" size="small" />
                        )}
                        renderOption={(props, option) => {
                            const { key, ...otherProps } = props;
                            return (
                                <Box component="li" key={key} {...otherProps} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TeamMark team={teamMap[option.name] || { name: option.name, abbreviation: option.abbreviation }} size={20} />
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
                                opts = allTeams.filter(t => t.active && isRealTeam(t) && t.conference !== addGameHome?.conference);
                            } else if (addGameType === 'CONFERENCE_GAME') {
                                opts = allTeams.filter(t => t.active && isRealTeam(t) && t.conference === addGameHome?.conference && t.name !== addGameHome?.name);
                            } else {
                                opts = allTeams.filter(t => t.active && isRealTeam(t));
                            }
                            if (addGameWeek && addGameWeek <= TOTAL_WEEKS) {
                                opts = opts.filter(t => !teamWeekOccupiedAll.has(`${t.name}|${addGameWeek}`));
                            }
                            return opts;
                        })()}
                        getOptionLabel={(option) => option.name || ''}
                        value={addGameAway}
                        onChange={(_, v) => handleAwayChange(v)}
                        sx={autocompleteSx}
                        renderInput={(params) => (
                            <TextField {...params} label="Away Team" size="small" />
                        )}
                        renderOption={(props, option) => {
                            const { key, ...otherProps } = props;
                            return (
                                <Box component="li" key={key} {...otherProps} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TeamMark team={teamMap[option.name] || { name: option.name, abbreviation: option.abbreviation }} size={20} />
                                    <Box component="span" sx={{ fontSize: '0.85rem' }}>{option.name}</Box>
                                </Box>
                            );
                        }}
                        isOptionEqualToValue={(option, value) => option.name === value?.name}
                    />

                    {(addGameType === 'CONFERENCE_GAME' || addGameType === 'OUT_OF_CONFERENCE') && (
                        <Box component="label" sx={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <Box component="input" type="checkbox" checked={addGameNeutralSite} onChange={(e) => setAddGameNeutralSite(e.target.checked)} />
                            <Box component="span" sx={{ fontSize: '0.85rem' }}>Neutral site game</Box>
                        </Box>
                    )}

                    {isImplicitNeutralSite && (
                        <Alert severity="info" sx={{ py: 0.5 }}>
                            {formatGameType(addGameType)} games are always played at a neutral site
                        </Alert>
                    )}

                    {isNeutralSite && (
                        <Box>
                            <Box component="label" sx={labelSx}>Venue</Box>
                            <Autocomplete
                                freeSolo
                                options={venueNames}
                                inputValue={addGameVenue}
                                onInputChange={(_, v) => setAddGameVenue(v || '')}
                                sx={autocompleteSx}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        size="small"
                                        placeholder="e.g., Mercedes-Benz Stadium, Atlanta, GA"
                                        error={!addGameVenue.trim()}
                                        helperText={!addGameVenue.trim() ? 'Venue is required for a neutral site game' : ' '}
                                    />
                                )}
                            />
                        </Box>
                    )}

                    {addGameType === 'BOWL' && (
                        <Box>
                            <Box component="label" sx={labelSx}>Bowl game name</Box>
                            <Box
                                component="input"
                                value={addGameBowlName}
                                onChange={(e) => setAddGameBowlName(e.target.value)}
                                onBlur={handleBowlNameBlur}
                                placeholder="e.g., Rose Bowl, Sugar Bowl, etc."
                                sx={{ ...inputSx, borderColor: (!addGameBowlName || addGameBowlName.trim() === '') ? 'var(--live)' : 'var(--line)' }}
                            />
                            {(!addGameBowlName || addGameBowlName.trim() === '') && <Box sx={errorTextSx}>Bowl game name is required</Box>}
                        </Box>
                    )}

                    {addGameType === 'BOWL' && (
                        <Box>
                            <Box component="label" sx={labelSx}>Bowl game logo URL</Box>
                            <Box
                                component="input"
                                value={addGameLogo || ''}
                                onChange={(e) => {
                                    setAddGameLogo(e.target.value);
                                    setAddGameLogoPreview(e.target.value);
                                }}
                                placeholder="https://example.com/bowl-logo.png"
                                sx={inputSx}
                            />
                            <Box sx={{ ...hintTextSx, mt: '4px' }}>Paste a direct link to the bowl game logo (PNG recommended)</Box>
                            {addGameLogoPreview && (
                                <Box sx={{ mt: '12px', display: 'flex', justifyContent: 'center' }}>
                                    <Avatar
                                        src={addGameLogoPreview}
                                        sx={{ width: 100, height: 100 }}
                                        variant="rounded"
                                    />
                                </Box>
                            )}
                        </Box>
                    )}
                    {(addGameType === 'PLAYOFFS' || addGameType === 'CONFERENCE_CHAMPIONSHIP' || addGameType === 'NATIONAL_CHAMPIONSHIP') && (
                        <Box>
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="logo-upload-button"
                                type="file"
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (file) await handleUploadLogo(file);
                                }}
                            />
                            <Box component="label" htmlFor="logo-upload-button" sx={{ ...ctrlSx, width: '100%', justifyContent: 'center', gap: '8px', opacity: uploadingLogo ? 0.6 : 1, pointerEvents: uploadingLogo ? 'none' : 'auto' }}>
                                {uploadingLogo ? <CircularProgress size={14} /> : <UploadIcon sx={{ fontSize: 16 }} />}
                                {uploadingLogo ? 'Uploading...' : addGameLogo ? 'Change Logo' : 'Upload Postseason Game Logo'}
                            </Box>
                            {addGameLogoPreview && (
                                <Box sx={{ mt: '12px', display: 'flex', justifyContent: 'center' }}>
                                    <Avatar
                                        src={addGameLogoPreview}
                                        sx={{ width: 100, height: 100 }}
                                        variant="rounded"
                                    />
                                </Box>
                            )}
                            {addGameLogo && !addGameLogoPreview && (
                                <Alert severity="info" sx={{ mt: '8px' }}>
                                    Logo uploaded: {addGameLogo}
                                </Alert>
                            )}
                        </Box>
                    )}

                    {addGameType !== 'BOWL' && (
                        <Box>
                            <Box component="label" sx={labelSx}>Game type</Box>
                            <Box component="select" value={addGameType} onChange={(e) => setAddGameType(e.target.value)} sx={{ ...selectSx, width: '100%' }}>
                                <option value="CONFERENCE_GAME">Conference Game</option>
                                <option value="OUT_OF_CONFERENCE">Out of Conference</option>
                                <option value="CONFERENCE_CHAMPIONSHIP">Conference Championship</option>
                                <option value="BOWL">Bowl</option>
                                <option value="PLAYOFFS">Playoffs</option>
                                <option value="NATIONAL_CHAMPIONSHIP">National Championship</option>
                            </Box>
                        </Box>
                    )}

                    {(addGameType === 'PLAYOFFS' || addGameType === 'NATIONAL_CHAMPIONSHIP') && (
                        <>
                            <Box>
                                <Box component="label" sx={labelSx}>Playoff round</Box>
                                <Box
                                    component="select"
                                    value={addGamePlayoffRound || ''}
                                    onChange={(e) => {
                                        const round = e.target.value ? parseInt(e.target.value) : null;
                                        setAddGamePlayoffRound(round);
                                        if (round) {
                                            const calculatedWeek = 13 + round;
                                            setAddGameWeek(calculatedWeek);
                                        }
                                    }}
                                    sx={{ ...selectSx, width: '100%' }}
                                >
                                    <option value="">Select round...</option>
                                    <option value={1}>1 - First Round (Week 14)</option>
                                    <option value={2}>2 - Second Round (Week 15)</option>
                                    <option value={3}>3 - Quarterfinals (Week 16)</option>
                                    <option value={4}>4 - Semifinals (Week 17)</option>
                                    <option value={5}>5 - National Championship (Week 18)</option>
                                </Box>
                            </Box>
                            {addGamePlayoffRound && (
                                <Alert severity="info" sx={{ py: 0.5 }}>
                                    Week {13 + addGamePlayoffRound} (calculated from round {addGamePlayoffRound})
                                </Alert>
                            )}
                            <Box sx={{ display: 'flex', gap: '14px' }}>
                                <Box sx={{ flex: 1 }}>
                                    <Box component="label" sx={labelSx}>Home seed</Box>
                                    <Box component="input" type="number" value={addGameHomeSeed || ''} onChange={(e) => setAddGameHomeSeed(parseInt(e.target.value) || null)} sx={inputSx} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Box component="label" sx={labelSx}>Away seed</Box>
                                    <Box component="input" type="number" value={addGameAwaySeed || ''} onChange={(e) => setAddGameAwaySeed(parseInt(e.target.value) || null)} sx={inputSx} />
                                </Box>
                            </Box>
                        </>
                    )}

                </Box>
            </DialogContent>
            <DialogActions sx={{ px: '20px', pb: '18px' }}>
                <Box component="button" type="button" onClick={onClose} sx={ctrlSx}>Cancel</Box>
                <Box component="button" type="button" onClick={handleAddGame} sx={btnPrimarySx}>Add Game</Box>
            </DialogActions>
        </Dialog>
    );
};

AddGameDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    dialog: PropTypes.object.isRequired,
    allTeams: PropTypes.array.isRequired,
    teamMap: PropTypes.object.isRequired,
    teamWeekOccupiedAll: PropTypes.instanceOf(Set).isRequired,
    venueNames: PropTypes.arrayOf(PropTypes.string),
};

export default AddGameDialog;
