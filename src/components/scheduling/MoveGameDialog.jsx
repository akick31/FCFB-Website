import React from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import VenueField from './VenueField';
import { camelOrSnakeField } from '../../utils/fieldHelper';
import { labelSx, primaryButtonSx, secondaryButtonSx, selectSx } from '../../styles/controls';

const TOTAL_WEEKS = 12;

const dialogPaperSx = { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)' };
const dialogTitleSx = { color: 'var(--text)', fontWeight: 800, fontSize: '1.05rem' };

const MoveGameDialog = ({
    open,
    onClose,
    moveGameData,
    moveToWeek,
    onWeekChange,
    teamWeekOccupiedAll,
    onDelete,
    onMove,
    editNeutralSite,
    onEditNeutralSiteChange,
    editVenue,
    onEditVenueChange,
    savingEdits,
    onSaveEdits,
    scheduleLocked,
}) => (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: dialogPaperSx }}>
        <DialogTitle sx={dialogTitleSx}>Move or Remove Game</DialogTitle>
        <DialogContent>
            {moveGameData &&
                (() => {
                    const home = camelOrSnakeField(moveGameData, 'homeTeam', 'home_team') || moveGameData.opponent;
                    const away = camelOrSnakeField(moveGameData, 'awayTeam', 'away_team') || '';
                    return (
                        <Box sx={{ mt: '6px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <Box sx={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                {home} vs {away || moveGameData.opponent} (Week {moveGameData.week})
                            </Box>
                            <Box>
                                <Box component="label" sx={labelSx}>
                                    Move to week
                                </Box>
                                <Box
                                    component="select"
                                    value={moveToWeek}
                                    onChange={(e) => onWeekChange(Number(e.target.value))}
                                    sx={{ ...selectSx, width: '100%' }}
                                >
                                    {Array.from({ length: TOTAL_WEEKS }, (_, i) => {
                                        const weekNum = i + 1;
                                        const homeOccupied = teamWeekOccupiedAll.has(`${home}|${weekNum}`);
                                        const awayOccupied = away && teamWeekOccupiedAll.has(`${away}|${weekNum}`);
                                        const isOccupied = homeOccupied || awayOccupied;
                                        const isCurrentWeek = weekNum === moveGameData.week;
                                        if (isOccupied && !isCurrentWeek) {
                                            return null;
                                        }
                                        return (
                                            <option key={weekNum} value={weekNum}>
                                                Week {weekNum}
                                            </option>
                                        );
                                    })}
                                </Box>
                            </Box>

                            {scheduleLocked && (
                                <Alert severity="warning" sx={{ py: 0.5 }}>
                                    The schedule is locked. Unlock it to change neutral site status or venue.
                                </Alert>
                            )}

                            <Box
                                component="label"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: scheduleLocked ? 'default' : 'pointer',
                                    opacity: scheduleLocked ? 0.6 : 1,
                                }}
                            >
                                <Box
                                    component="input"
                                    type="checkbox"
                                    checked={editNeutralSite}
                                    disabled={scheduleLocked}
                                    onChange={(e) => onEditNeutralSiteChange(e.target.checked)}
                                />
                                <Box component="span" sx={{ fontSize: '0.85rem' }}>
                                    Neutral site game
                                </Box>
                            </Box>

                            {editNeutralSite && (
                                <Box>
                                    <Box component="label" sx={labelSx}>
                                        Venue
                                    </Box>
                                    <VenueField
                                        value={editVenue}
                                        onChange={onEditVenueChange}
                                        disabled={scheduleLocked}
                                        error={!editVenue.trim()}
                                        helperText={
                                            !editVenue.trim() ? 'Venue is required for a neutral site game' : ''
                                        }
                                    />
                                </Box>
                            )}

                            <Box
                                component="button"
                                type="button"
                                onClick={onSaveEdits}
                                disabled={scheduleLocked || savingEdits}
                                sx={{ ...secondaryButtonSx, justifyContent: 'center' }}
                            >
                                {savingEdits ? 'Saving...' : 'Save neutral site / venue'}
                            </Box>
                        </Box>
                    );
                })()}
        </DialogContent>
        <DialogActions sx={{ px: '20px', pb: '18px' }}>
            {moveGameData && (
                <Box
                    component="button"
                    type="button"
                    onClick={onDelete}
                    sx={{ ...secondaryButtonSx, color: 'var(--live)', mr: 'auto' }}
                >
                    Delete Game
                </Box>
            )}
            <Box component="button" type="button" onClick={onClose} sx={secondaryButtonSx}>
                Cancel
            </Box>
            <Box component="button" type="button" onClick={onMove} sx={primaryButtonSx}>
                Move
            </Box>
        </DialogActions>
    </Dialog>
);

MoveGameDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    moveGameData: PropTypes.object,
    moveToWeek: PropTypes.number.isRequired,
    onWeekChange: PropTypes.func.isRequired,
    teamWeekOccupiedAll: PropTypes.instanceOf(Set).isRequired,
    onDelete: PropTypes.func.isRequired,
    onMove: PropTypes.func.isRequired,
    editNeutralSite: PropTypes.bool.isRequired,
    onEditNeutralSiteChange: PropTypes.func.isRequired,
    editVenue: PropTypes.string.isRequired,
    onEditVenueChange: PropTypes.func.isRequired,
    savingEdits: PropTypes.bool,
    onSaveEdits: PropTypes.func.isRequired,
    scheduleLocked: PropTypes.bool,
};

export default MoveGameDialog;
