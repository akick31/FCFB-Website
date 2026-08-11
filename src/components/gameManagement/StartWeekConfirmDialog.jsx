import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Alert, Button } from '@mui/material';
import PropTypes from 'prop-types';

const StartWeekConfirmDialog = ({ open, season, week, stats, onCancel, onConfirm }) => (
    <Dialog open={open} onClose={onCancel}>
        <DialogTitle>Start Game Week {week}?</DialogTitle>
        <DialogContent>
            {stats.notStarted === 0 && stats.total > 0 ? (
                <>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        All games for Week {week}, Season {season} have already been started.
                    </Typography>
                    <Alert severity="info">
                        Clicking &quot;Start Week&quot; will attempt to start any games that may have failed previously or were missed.
                    </Alert>
                </>
            ) : (
                <>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        This will start all {stats.notStarted} unstarted games for Week {week}, Season {season}.
                    </Typography>
                    <Alert severity="info" sx={{ mb: 1 }}>
                        Games will be started with smart pacing (~3s between each game, 60s cooldown every 25 games) to respect Discord rate limits.
                    </Alert>
                </>
            )}
        </DialogContent>
        <DialogActions>
            <Button onClick={onCancel}>Cancel</Button>
            <Button variant="contained" color="success" onClick={onConfirm}>Start Week {week}</Button>
        </DialogActions>
    </Dialog>
);

StartWeekConfirmDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    season: PropTypes.number,
    week: PropTypes.number,
    stats: PropTypes.shape({
        total: PropTypes.number.isRequired,
        started: PropTypes.number.isRequired,
        notStarted: PropTypes.number.isRequired,
    }).isRequired,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
};

export default StartWeekConfirmDialog;
