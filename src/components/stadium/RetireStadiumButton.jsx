import React, { useState } from 'react';
import { Alert, Box, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import PropTypes from 'prop-types';
import TeamName from '../ui/TeamName';

import { getUpcomingStadiumGames, setStadiumActive } from '../../api/stadiumApi';
import { primaryButtonSx, secondaryButtonSx } from '../../styles/controls';

const RetireStadiumButton = ({ stadium, onChanged }) => {
    const [upcoming, setUpcoming] = useState(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    const apply = async () => {
        setBusy(true);
        setError(null);
        try {
            await setStadiumActive(stadium.name, !stadium.active);
            setUpcoming(null);
            onChanged();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const start = async () => {
        if (!stadium.active) {
            await apply();
            return;
        }
        setBusy(true);
        try {
            const games = await getUpcomingStadiumGames(stadium.name);
            setBusy(false);
            if (games.length) {
                setUpcoming(games);
            } else {
                await apply();
            }
        } catch (err) {
            setError(err.message);
            setBusy(false);
        }
    };

    return (
        <>
            <Box component="button" type="button" onClick={start} disabled={busy} sx={secondaryButtonSx}>
                {stadium.active ? 'Retire stadium' : 'Restore stadium'}
            </Box>
            <Dialog
                open={Boolean(upcoming) || Boolean(error)}
                onClose={() => (setUpcoming(null), setError(null))}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 800 }}>Retire {stadium.name}?</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {error && <Alert severity="error">{error}</Alert>}
                    {upcoming && (
                        <>
                            <Box sx={{ fontSize: '0.86rem' }}>
                                {upcoming.length} upcoming {upcoming.length === 1 ? 'game is' : 'games are'} scheduled
                                here:
                            </Box>
                            <Box component="ul" sx={{ m: 0, pl: '18px', fontSize: '0.82rem' }}>
                                {upcoming.slice(0, 8).map((game) => (
                                    <li key={`${game.season}-${game.week}-${game.home_team}-${game.away_team}`}>
                                        Season {game.season}, week {game.week}: <TeamName name={game.away_team} /> at{' '}
                                        <TeamName name={game.home_team} />
                                    </li>
                                ))}
                                {upcoming.length > 8 && <li>and {upcoming.length - 8} more</li>}
                            </Box>
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: '24px', pb: '16px', gap: '8px' }}>
                    <Box
                        component="button"
                        type="button"
                        onClick={() => (setUpcoming(null), setError(null))}
                        sx={secondaryButtonSx}
                    >
                        Keep it
                    </Box>
                    {upcoming && (
                        <Box component="button" type="button" onClick={apply} disabled={busy} sx={primaryButtonSx}>
                            Retire anyway
                        </Box>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
};

RetireStadiumButton.propTypes = {
    stadium: PropTypes.shape({ name: PropTypes.string.isRequired, active: PropTypes.bool.isRequired }).isRequired,
    onChanged: PropTypes.func.isRequired,
};

export default RetireStadiumButton;
