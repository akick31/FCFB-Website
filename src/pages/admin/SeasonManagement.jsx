import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/ui/Panel';
import DataTable from '../../components/ui/DataTable';
import StatTile, { TileGrid } from '../../components/ui/StatTile';
import {
    getAllSeasons,
    startSeason,
    endSeason,
    setCurrentSeason,
    updateCurrentWeek,
    lockSchedule,
    unlockSchedule,
} from '../../api/seasonApi';
import { getCurrentOffseason, startOffseason, endOffseason } from '../../api/offseasonApi';
import { validateSchedule } from '../../api/scheduleApi';

const camelOrSnakeField = (obj, camel, snake) => obj?.[camel] ?? obj?.[snake];

const inputSx = {
    border: '1px solid var(--line)',
    background: 'var(--surface-2)',
    color: 'var(--text)',
    borderRadius: 'var(--r-sm)',
    px: '10px',
    height: '38px',
    boxSizing: 'border-box',
    font: 'inherit',
    fontSize: '0.82rem',
};
const ctrlSx = {
    border: '1px solid var(--line)',
    background: 'var(--surface-2)',
    color: 'var(--text-muted)',
    borderRadius: 'var(--r-sm)',
    px: '14px',
    height: '38px',
    boxSizing: 'border-box',
    font: 'inherit',
    fontSize: '0.8rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' },
    '&:disabled': { opacity: 0.6, cursor: 'default' },
};
const btnPrimarySx = {
    border: 0,
    background: 'var(--brand-deep)',
    color: '#fff',
    borderRadius: 'var(--r-sm)',
    px: '16px',
    height: '38px',
    boxSizing: 'border-box',
    font: 'inherit',
    fontSize: '0.82rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    '&:disabled': { opacity: 0.6, cursor: 'default' },
};
const btnDangerSx = { ...btnPrimarySx, background: 'var(--live)' };
const dialogPaperSx = { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)' };
const dialogTitleSx = { color: 'var(--text)', fontWeight: 800, fontSize: '1.05rem' };
const pillSx = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '0.62rem',
    fontWeight: 800,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    px: '8px',
    py: '3px',
    borderRadius: 'var(--r-sm)',
    lineHeight: 1,
};

const SeasonManagement = () => {
    const [seasons, setSeasons] = useState([]);
    const [offseason, setOffseasonState] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);

    const [weekInput, setWeekInput] = useState('');
    const [startDialogOpen, setStartDialogOpen] = useState(false);
    const [startError, setStartError] = useState(null);
    const [endDialogOpen, setEndDialogOpen] = useState(false);
    const [validateDialogOpen, setValidateDialogOpen] = useState(false);
    const [validating, setValidating] = useState(false);
    const [validationResult, setValidationResult] = useState(null);

    const scopeRef = useRef(null);
    const weekRevisionRef = useRef(0);
    const validationRequestRef = useRef(null);

    const loadData = useCallback(async (scope = scopeRef.current, weekRevision = weekRevisionRef.current) => {
        if (!scope.active) {
            return;
        }
        const request = {};
        scope.request = request;
        setError(null);
        try {
            const [seasonsData, offseasonData] = await Promise.all([getAllSeasons(), getCurrentOffseason()]);
            if (!scope.active || scope.request !== request) {
                return;
            }
            const sorted = [...seasonsData].sort(
                (a, b) =>
                    camelOrSnakeField(b, 'seasonNumber', 'season_number') -
                    camelOrSnakeField(a, 'seasonNumber', 'season_number')
            );
            setSeasons(sorted);
            setOffseasonState(offseasonData);
            const current = sorted.find((s) => camelOrSnakeField(s, 'currentSeason', 'current_season'));
            if (current && weekRevisionRef.current === weekRevision) {
                setWeekInput(String(camelOrSnakeField(current, 'currentWeek', 'current_week') ?? ''));
            }
        } catch (err) {
            if (scope.active && scope.request === request) {
                console.error('Failed to load season data');
                setError(err.message || 'Failed to load season data');
            }
        } finally {
            if (scope.active && scope.request === request) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        const scope = { active: true };
        scopeRef.current = scope;
        loadData(scope);
        return () => {
            scope.active = false;
        };
    }, [loadData]);

    const currentSeason = seasons.find((s) => camelOrSnakeField(s, 'currentSeason', 'current_season'));
    const pendingSeason =
        seasons.find(
            (s) =>
                !camelOrSnakeField(s, 'currentSeason', 'current_season') &&
                !camelOrSnakeField(s, 'startDate', 'start_date')
        ) || (currentSeason ? null : seasons[0]);
    const isOffseason = Boolean(camelOrSnakeField(offseason, 'startDate', 'start_date'));

    const runAction = async (action) => {
        const scope = scopeRef.current;
        const weekRevision = weekRevisionRef.current;
        setBusy(true);
        setError(null);
        try {
            await action();
            if (!scope.active) {
                return false;
            }
            await loadData(scope, weekRevision);
            return scope.active;
        } catch (err) {
            if (scope.active) {
                console.error('Season action failed');
                setError(err.message || 'Action failed');
            }
            return false;
        } finally {
            if (scope.active) {
                setBusy(false);
            }
        }
    };

    const handleSaveWeek = () => {
        if (!currentSeason) {
            return;
        }
        const week = parseInt(weekInput, 10);
        if (!week || week < 1) {
            setError('Enter a valid week number');
            return;
        }
        runAction(() => updateCurrentWeek(camelOrSnakeField(currentSeason, 'seasonNumber', 'season_number'), week));
    };

    const handleNextWeek = () => {
        if (!currentSeason) {
            return;
        }
        const seasonNumber = camelOrSnakeField(currentSeason, 'seasonNumber', 'season_number');
        const nextWeek = (camelOrSnakeField(currentSeason, 'currentWeek', 'current_week') ?? 0) + 1;
        runAction(() => updateCurrentWeek(seasonNumber, nextWeek));
    };

    const handleToggleOffseason = () => {
        runAction(() => (isOffseason ? endOffseason() : startOffseason()));
    };

    const handleSetCurrent = (seasonNumber) => {
        runAction(() => setCurrentSeason(seasonNumber));
    };

    const handleToggleLock = (season) => {
        const seasonNumber = camelOrSnakeField(season, 'seasonNumber', 'season_number');
        const locked = camelOrSnakeField(season, 'scheduleLocked', 'schedule_locked');
        runAction(() => (locked ? unlockSchedule(seasonNumber) : lockSchedule(seasonNumber)));
    };

    const closeValidation = () => {
        validationRequestRef.current = null;
        setValidateDialogOpen(false);
        setValidating(false);
    };

    const handleValidate = async () => {
        if (!pendingSeason) {
            return;
        }
        const scope = scopeRef.current;
        const request = {};
        validationRequestRef.current = request;
        const isCurrent = () => scope.active && validationRequestRef.current === request;
        setValidateDialogOpen(true);
        setValidating(true);
        setValidationResult(null);
        try {
            const result = await validateSchedule(camelOrSnakeField(pendingSeason, 'seasonNumber', 'season_number'));
            if (isCurrent()) {
                setValidationResult(result);
            }
        } catch (err) {
            if (isCurrent()) {
                console.error('Error validating schedule');
                setValidateDialogOpen(false);
                setError(err.message || 'Failed to validate schedule');
            }
        } finally {
            if (isCurrent()) {
                setValidating(false);
            }
        }
    };

    const handleStartSeason = async () => {
        const scope = scopeRef.current;
        const weekRevision = weekRevisionRef.current;
        setBusy(true);
        setStartError(null);
        try {
            await startSeason();
            if (scope.active) {
                setStartDialogOpen(false);
                await loadData(scope, weekRevision);
            }
        } catch (err) {
            if (scope.active) {
                console.error('Failed to start season');
                setStartError(err.message || 'Failed to start season');
            }
        } finally {
            if (scope.active) {
                setBusy(false);
            }
        }
    };

    const handleEndSeason = async () => {
        const ok = await runAction(() => endSeason());
        if (ok) {
            setEndDialogOpen(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout title="Season Management">
                <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Season Management">
            {error && (
                <Alert severity="error" sx={{ mb: '16px' }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <TileGrid minTile={170} sx={{ mb: '16px' }}>
                <StatTile
                    label="Current season"
                    value={currentSeason ? camelOrSnakeField(currentSeason, 'seasonNumber', 'season_number') : '-'}
                />
                <StatTile
                    label="Current week"
                    value={currentSeason ? camelOrSnakeField(currentSeason, 'currentWeek', 'current_week') : '-'}
                />
                <StatTile
                    label="Offseason"
                    value={isOffseason ? 'Yes' : 'No'}
                    caption={
                        isOffseason ? `Since ${camelOrSnakeField(offseason, 'startDate', 'start_date')}` : undefined
                    }
                />
                <StatTile
                    label="Pending season"
                    value={pendingSeason ? camelOrSnakeField(pendingSeason, 'seasonNumber', 'season_number') : 'None'}
                />
            </TileGrid>

            <Panel header="Current season controls" sx={{ mb: '16px' }}>
                <Box sx={{ p: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Box sx={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <Box>
                            <Box
                                sx={{
                                    display: 'block',
                                    fontSize: '0.68rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    fontWeight: 800,
                                    color: 'var(--text-dim)',
                                    mb: '5px',
                                }}
                            >
                                Current week
                            </Box>
                            <Box
                                component="input"
                                type="number"
                                min={1}
                                value={weekInput}
                                onChange={(e) => {
                                    weekRevisionRef.current += 1;
                                    setWeekInput(e.target.value);
                                }}
                                disabled={!currentSeason}
                                sx={{ ...inputSx, width: 120 }}
                            />
                        </Box>
                        <Box
                            component="button"
                            type="button"
                            onClick={handleSaveWeek}
                            disabled={busy || !currentSeason}
                            sx={ctrlSx}
                        >
                            Save week
                        </Box>
                        <Box
                            component="button"
                            type="button"
                            onClick={handleNextWeek}
                            disabled={busy || !currentSeason}
                            sx={btnPrimarySx}
                            title="Advance the current week by one and compute ranking metrics for the week that just finished"
                        >
                            Move to next week
                            {currentSeason
                                ? ` (→ ${(camelOrSnakeField(currentSeason, 'currentWeek', 'current_week') ?? 0) + 1})`
                                : ''}
                        </Box>
                        <Box
                            component="button"
                            type="button"
                            onClick={handleToggleOffseason}
                            disabled={busy}
                            sx={ctrlSx}
                        >
                            {isOffseason ? 'End offseason' : 'Start offseason'}
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            gap: '10px',
                            flexWrap: 'wrap',
                            borderTop: '1px solid var(--line-soft)',
                            pt: '16px',
                        }}
                    >
                        <Box
                            component="button"
                            type="button"
                            onClick={handleValidate}
                            disabled={!pendingSeason}
                            sx={ctrlSx}
                        >
                            Validate pending schedule
                        </Box>
                        <Box
                            component="button"
                            type="button"
                            onClick={() => {
                                setStartError(null);
                                setStartDialogOpen(true);
                            }}
                            disabled={!pendingSeason}
                            title={!pendingSeason ? 'No pending season to start' : ''}
                            sx={btnPrimarySx}
                        >
                            Start season
                            {pendingSeason
                                ? ` ${camelOrSnakeField(pendingSeason, 'seasonNumber', 'season_number')}`
                                : ''}
                        </Box>
                        <Box
                            component="button"
                            type="button"
                            onClick={() => setEndDialogOpen(true)}
                            disabled={!currentSeason}
                            sx={btnDangerSx}
                        >
                            End season
                            {currentSeason
                                ? ` ${camelOrSnakeField(currentSeason, 'seasonNumber', 'season_number')}`
                                : ''}
                        </Box>
                    </Box>
                </Box>
            </Panel>

            <Panel header="All seasons">
                <DataTable minWidth={780}>
                    <thead>
                        <tr>
                            <th className="lft stick">Season</th>
                            <th>Status</th>
                            <th>Week</th>
                            <th>Schedule</th>
                            <th className="lft">Start date</th>
                            <th className="lft">End date</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {seasons.map((season) => {
                            const seasonNumber = camelOrSnakeField(season, 'seasonNumber', 'season_number');
                            const isCurrent = camelOrSnakeField(season, 'currentSeason', 'current_season');
                            const isLocked = camelOrSnakeField(season, 'scheduleLocked', 'schedule_locked');
                            const isPending = !isCurrent && !camelOrSnakeField(season, 'startDate', 'start_date');
                            return (
                                <tr key={seasonNumber}>
                                    <td className="lft stick">
                                        <b>Season {seasonNumber}</b>
                                    </td>
                                    <td>
                                        <Box
                                            component="span"
                                            sx={{
                                                ...pillSx,
                                                background: 'var(--surface-2)',
                                                color: isCurrent
                                                    ? 'var(--field)'
                                                    : isPending
                                                      ? 'var(--gold)'
                                                      : 'var(--text-dim)',
                                            }}
                                        >
                                            {isCurrent ? 'Current' : isPending ? 'Pending' : 'Completed'}
                                        </Box>
                                    </td>
                                    <td>{camelOrSnakeField(season, 'currentWeek', 'current_week') ?? '-'}</td>
                                    <td>
                                        <Box
                                            component="button"
                                            type="button"
                                            onClick={() => handleToggleLock(season)}
                                            disabled={busy}
                                            sx={{
                                                ...ctrlSx,
                                                color: isLocked ? 'var(--live)' : 'var(--field)',
                                                height: 28,
                                                px: '10px',
                                                fontSize: '0.72rem',
                                            }}
                                        >
                                            {isLocked ? 'Locked' : 'Unlocked'}
                                        </Box>
                                    </td>
                                    <td className="lft">
                                        {camelOrSnakeField(season, 'startDate', 'start_date') || '-'}
                                    </td>
                                    <td className="lft">{camelOrSnakeField(season, 'endDate', 'end_date') || '-'}</td>
                                    <td>
                                        {!isCurrent && (
                                            <Box
                                                component="button"
                                                type="button"
                                                onClick={() => handleSetCurrent(seasonNumber)}
                                                disabled={busy}
                                                sx={{ ...ctrlSx, height: 28, px: '10px', fontSize: '0.72rem' }}
                                            >
                                                Set current
                                            </Box>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </DataTable>
            </Panel>

            <Dialog
                open={validateDialogOpen}
                onClose={closeValidation}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: dialogPaperSx }}
            >
                <DialogTitle sx={dialogTitleSx}>
                    Validate{' '}
                    {pendingSeason ? `Season ${camelOrSnakeField(pendingSeason, 'seasonNumber', 'season_number')}` : ''}{' '}
                    Schedule
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', mt: '6px' }}>
                        {validating ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <CircularProgress size={18} />
                                <Box sx={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                                    Checking every active team&apos;s schedule…
                                </Box>
                            </Box>
                        ) : (
                            validationResult &&
                            (validationResult.valid ? (
                                <Alert severity="success">
                                    Every active team has a game scheduled in every week (1-12). This season is ready to
                                    start.
                                </Alert>
                            ) : (
                                <>
                                    <Alert severity="warning">
                                        {validationResult.incompleteTeams.length} team
                                        {validationResult.incompleteTeams.length > 1 ? 's are' : ' is'} missing games.
                                    </Alert>
                                    <Box
                                        sx={{
                                            maxHeight: 320,
                                            overflowY: 'auto',
                                            border: '1px solid var(--line)',
                                            borderRadius: 'var(--r-sm)',
                                        }}
                                    >
                                        {validationResult.incompleteTeams.map((gap) => (
                                            <Box
                                                key={gap.team}
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    gap: '12px',
                                                    px: '12px',
                                                    py: '8px',
                                                    fontSize: '0.82rem',
                                                    borderBottom: '1px solid var(--line-soft)',
                                                    '&:last-of-type': { borderBottom: 0 },
                                                }}
                                            >
                                                <Box component="b">{gap.team}</Box>
                                                <Box sx={{ color: 'var(--live)' }}>
                                                    Missing week{gap.missingWeeks.length > 1 ? 's' : ''}{' '}
                                                    {gap.missingWeeks.join(', ')}
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </>
                            ))
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: '20px', pb: '18px' }}>
                    <Box component="button" type="button" onClick={closeValidation} sx={ctrlSx}>
                        Close
                    </Box>
                </DialogActions>
            </Dialog>

            <Dialog
                open={startDialogOpen}
                onClose={() => !busy && setStartDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: dialogPaperSx }}
            >
                <DialogTitle sx={dialogTitleSx}>
                    Start Season{' '}
                    {pendingSeason ? camelOrSnakeField(pendingSeason, 'seasonNumber', 'season_number') : ''}?
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', mt: '6px' }}>
                        <Alert severity="info">
                            This checks that the schedule is locked and every active team has a full week 1-12 schedule,
                            resets win/loss records, and ends the offseason. It cannot be undone from here.
                        </Alert>
                        {startError && <Alert severity="error">{startError}</Alert>}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: '20px', pb: '18px' }}>
                    <Box
                        component="button"
                        type="button"
                        onClick={() => setStartDialogOpen(false)}
                        disabled={busy}
                        sx={ctrlSx}
                    >
                        Cancel
                    </Box>
                    <Box component="button" type="button" onClick={handleStartSeason} disabled={busy} sx={btnPrimarySx}>
                        {busy ? 'Starting…' : 'Start season'}
                    </Box>
                </DialogActions>
            </Dialog>

            <Dialog
                open={endDialogOpen}
                onClose={() => !busy && setEndDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: dialogPaperSx }}
            >
                <DialogTitle sx={dialogTitleSx}>
                    End Season {currentSeason ? camelOrSnakeField(currentSeason, 'seasonNumber', 'season_number') : ''}?
                </DialogTitle>
                <DialogContent>
                    <Alert severity="warning">
                        This marks the season as complete and starts the offseason. Use this only for manual correction;
                        a finished National Championship game normally ends the season automatically.
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ px: '20px', pb: '18px' }}>
                    <Box
                        component="button"
                        type="button"
                        onClick={() => setEndDialogOpen(false)}
                        disabled={busy}
                        sx={ctrlSx}
                    >
                        Cancel
                    </Box>
                    <Box component="button" type="button" onClick={handleEndSeason} disabled={busy} sx={btnDangerSx}>
                        {busy ? 'Ending…' : 'End season'}
                    </Box>
                </DialogActions>
            </Dialog>
        </AdminLayout>
    );
};

export default SeasonManagement;
