import React from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import PropTypes from 'prop-types';
import TeamName from '../ui/TeamName';
import { camelOrSnakeField } from '../../utils/fieldHelper';
import { ROUND_LABELS, playoffWeekForRound } from '../../constants/playoffBracket';
import { dialogPaperSx, dialogTitleSx } from './postseasonStyles';
import { primaryButtonSx, secondaryButtonSx } from '../../styles/controls';

const PLACEHOLDERS = ['TBD', 'OPEN'];

const sidesOf = (game) =>
    [
        [
            camelOrSnakeField(game, 'awayTeam', 'away_team'),
            camelOrSnakeField(game, 'playoffAwaySeed', 'playoff_away_seed'),
        ],
        [
            camelOrSnakeField(game, 'homeTeam', 'home_team'),
            camelOrSnakeField(game, 'playoffHomeSeed', 'playoff_home_seed'),
        ],
    ].filter(([team]) => team && !PLACEHOLDERS.includes(team));

const choiceSx = (picked) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    p: '12px 14px',
    border: `1px solid ${picked ? 'var(--brand)' : 'var(--line)'}`,
    borderRadius: 'var(--r-sm)',
    background: picked ? 'color-mix(in srgb, var(--brand) 14%, var(--surface-2))' : 'var(--surface-2)',
    color: 'var(--text)',
    font: 'inherit',
    fontWeight: 700,
    textAlign: 'left',
    cursor: 'pointer',
});

const AdvanceWinnerDialog = ({ open, onClose, game, winner, onWinnerChange, onSubmit }) => {
    const currentRound = game ? camelOrSnakeField(game, 'playoffRound', 'playoff_round') || 1 : 1;
    const nextRound = currentRound + 1;
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: dialogPaperSx }}>
            <DialogTitle sx={dialogTitleSx}>Who won?</DialogTitle>
            <DialogContent>
                {game && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', mt: '4px' }}>
                        <Box sx={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            The winner moves on to {ROUND_LABELS[nextRound] || `round ${nextRound}`} (week{' '}
                            {playoffWeekForRound(nextRound)}).
                        </Box>
                        {sidesOf(game).map(([team, seed]) => (
                            <Box
                                key={team}
                                component="button"
                                type="button"
                                aria-pressed={winner === team}
                                onClick={() => onWinnerChange(team)}
                                sx={choiceSx(winner === team)}
                            >
                                <Box component="span" sx={{ color: 'var(--text-dim)', minWidth: 26 }}>
                                    #{seed}
                                </Box>
                                <TeamName name={team} size={24} />
                            </Box>
                        ))}
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ px: '20px', pb: '18px' }}>
                <Box component="button" type="button" onClick={onClose} sx={secondaryButtonSx}>
                    Cancel
                </Box>
                <Box component="button" type="button" onClick={onSubmit} disabled={!winner} sx={primaryButtonSx}>
                    Advance winner
                </Box>
            </DialogActions>
        </Dialog>
    );
};

AdvanceWinnerDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    game: PropTypes.object,
    winner: PropTypes.string,
    onWinnerChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
};

export default AdvanceWinnerDialog;
