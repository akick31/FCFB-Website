import React from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from '@mui/material';
import { camelOrSnakeField } from '../../utils/fieldHelper';
import { ROUND_LABELS, playoffWeekForRound } from '../../constants/playoffBracket';
import { btnPrimarySx, ctrlSx, labelSx, selectSx, dialogPaperSx, dialogTitleSx } from './postseasonStyles';

const AdvanceWinnerDialog = ({ open, onClose, game, winner, onWinnerChange, onSubmit }) => {
    const currentRound = game ? camelOrSnakeField(game, 'playoffRound', 'playoff_round') || 1 : 1;
    const nextRound = currentRound + 1;
    const nextWeek = playoffWeekForRound(nextRound);
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: dialogPaperSx }}>
            <DialogTitle sx={dialogTitleSx}>Advance Winner to Next Round</DialogTitle>
            <DialogContent>
                {game && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', mt: '6px' }}>
                        <Alert severity="info">
                            Select the winner to advance them to {ROUND_LABELS[nextRound] || `Round ${nextRound}`} (Week{' '}
                            {nextWeek}).
                        </Alert>

                        <Box sx={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)' }}>
                            Current Game: #{camelOrSnakeField(game, 'playoffHomeSeed', 'playoff_home_seed')}{' '}
                            {camelOrSnakeField(game, 'homeTeam', 'home_team')} vs #
                            {camelOrSnakeField(game, 'playoffAwaySeed', 'playoff_away_seed')}{' '}
                            {camelOrSnakeField(game, 'awayTeam', 'away_team')}
                        </Box>

                        <Box>
                            <Box component="label" sx={labelSx}>
                                Winner
                            </Box>
                            <Box
                                component="select"
                                value={winner}
                                onChange={(e) => onWinnerChange(e.target.value)}
                                sx={selectSx}
                            >
                                <option value="">Select winner...</option>
                                {camelOrSnakeField(game, 'homeTeam', 'home_team') &&
                                    camelOrSnakeField(game, 'homeTeam', 'home_team') !== 'TBD' &&
                                    camelOrSnakeField(game, 'homeTeam', 'home_team') !== 'OPEN' && (
                                        <option value={camelOrSnakeField(game, 'homeTeam', 'home_team')}>
                                            #{camelOrSnakeField(game, 'playoffHomeSeed', 'playoff_home_seed')}{' '}
                                            {camelOrSnakeField(game, 'homeTeam', 'home_team')}
                                        </option>
                                    )}
                                {camelOrSnakeField(game, 'awayTeam', 'away_team') &&
                                    camelOrSnakeField(game, 'awayTeam', 'away_team') !== 'TBD' &&
                                    camelOrSnakeField(game, 'awayTeam', 'away_team') !== 'OPEN' && (
                                        <option value={camelOrSnakeField(game, 'awayTeam', 'away_team')}>
                                            #{camelOrSnakeField(game, 'playoffAwaySeed', 'playoff_away_seed')}{' '}
                                            {camelOrSnakeField(game, 'awayTeam', 'away_team')}
                                        </option>
                                    )}
                            </Box>
                        </Box>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ px: '20px', pb: '18px' }}>
                <Box component="button" type="button" onClick={onClose} sx={ctrlSx}>
                    Cancel
                </Box>
                <Box component="button" type="button" onClick={onSubmit} sx={btnPrimarySx}>
                    Advance Team
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default AdvanceWinnerDialog;
