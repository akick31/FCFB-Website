import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import Panel from '../../components/ui/Panel';
import DataTable from '../../components/ui/DataTable';
import StatTile, { TileGrid } from '../../components/ui/StatTile';
import { getCurrentSeasonOrLatest, getCurrentWeekOrLatest } from '../../api/seasonApi';
import { getScheduleBySeasonAndWeek, startGameWeek, getGameWeekJobStatus, retryFailedGames } from '../../api/scheduleApi';
import { weekLabel } from '../../utils/formatText';

const POLL_INTERVAL_MS = 3000;

const selectSx = { width: '100%', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.82rem', cursor: 'pointer', '& option': { background: 'var(--surface-2)', color: 'var(--text)' } };
const btnPrimarySx = { border: 0, background: 'var(--field)', color: '#04231a', borderRadius: 'var(--r-sm)', px: '16px', py: '11px', font: 'inherit', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', width: '100%', '&:disabled': { opacity: 0.6, cursor: 'default' } };
const btnGhostSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--gold)', borderRadius: 'var(--r-sm)', px: '14px', py: '9px', font: 'inherit', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', width: '100%', '&:disabled': { opacity: 0.6, cursor: 'default' } };
const pillSx = { display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', px: '8px', py: '3px', borderRadius: 'var(--r-sm)', lineHeight: 1 };

const statusColor = (status) => {
    if (status === 'COMPLETED') return 'var(--field)';
    if (status === 'IN_PROGRESS') return 'var(--brand)';
    if (status === 'FAILED') return 'var(--live)';
    return 'var(--text-muted)';
};

const gameStatusInfo = (game) => {
    if (game.finished) return { label: 'Finished', color: 'var(--text-muted)' };
    if (game.started) return { label: 'In Progress', color: 'var(--field)' };
    return { label: 'Not Started', color: 'var(--gold)' };
};

const GameWeek = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [season, setSeason] = useState(() => (searchParams.get('season') ? Number(searchParams.get('season')) : null));
    const [week, setWeek] = useState(() => (searchParams.get('week') ? Number(searchParams.get('week')) : null));
    const [selectedWeek, setSelectedWeek] = useState(() => (searchParams.get('selectedWeek') ? Number(searchParams.get('selectedWeek')) : null));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [weekSchedule, setWeekSchedule] = useState([]);
    const [scheduleLoading, setScheduleLoading] = useState(false);

    const [activeJobId, setActiveJobId] = useState(null);
    const [jobData, setJobData] = useState(null);
    const [isStarting, setIsStarting] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [rankingsWarning, setRankingsWarning] = useState(null);

    const logContainerRef = useRef(null);
    const pollIntervalRef = useRef(null);

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                const [currentSeason, currentWeek] = await Promise.all([getCurrentSeasonOrLatest(), getCurrentWeekOrLatest()]);
                const resolvedSeason = searchParams.get('season') ? Number(searchParams.get('season')) : currentSeason;
                const resolvedWeek = searchParams.get('week') ? Number(searchParams.get('week')) : currentWeek;
                const resolvedSelectedWeek = searchParams.get('selectedWeek') ? Number(searchParams.get('selectedWeek')) : currentWeek;
                setSeason(resolvedSeason);
                setWeek(resolvedWeek);
                setSelectedWeek(resolvedSelectedWeek);
                setSearchParams({
                    season: String(resolvedSeason),
                    week: String(resolvedWeek),
                    selectedWeek: String(resolvedSelectedWeek),
                }, { replace: true });
            } catch (err) {
                console.error('Error initializing game week page:', err);
                setError(err.message || 'Failed to load current season and week');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const fetchWeekSchedule = useCallback(async () => {
        try {
            setScheduleLoading(true);
            const schedule = await getScheduleBySeasonAndWeek(season, selectedWeek);
            setWeekSchedule(schedule || []);
        } catch (err) {
            console.error('Error fetching week schedule:', err);
            setError(err.message || 'Failed to load week schedule');
            setWeekSchedule([]);
        } finally {
            setScheduleLoading(false);
        }
    }, [season, selectedWeek]);

    useEffect(() => {
        if (season && selectedWeek) fetchWeekSchedule();
    }, [season, selectedWeek, fetchWeekSchedule]);

    useEffect(() => {
        if (logContainerRef.current) logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }, [jobData?.logs?.length]);

    useEffect(() => () => { if (pollIntervalRef.current) clearInterval(pollIntervalRef.current); }, []);

    const getGameStats = () => {
        const total = weekSchedule.length;
        const started = weekSchedule.filter((g) => g.started).length;
        const notStarted = weekSchedule.filter((g) => !g.started).length;
        return { total, started, notStarted };
    };

    const startPolling = useCallback((jobId) => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

        const poll = async () => {
            try {
                const status = await getGameWeekJobStatus(jobId);
                setJobData(status);
                if (status.status === 'COMPLETED' || status.status === 'FAILED') {
                    clearInterval(pollIntervalRef.current);
                    pollIntervalRef.current = null;
                    setIsStarting(false);
                    await fetchWeekSchedule();
                }
            } catch (err) {
                console.error('Error polling job status:', err);
            }
        };

        poll();
        pollIntervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
    }, [fetchWeekSchedule]);

    const handleStartWeek = async () => {
        setConfirmDialogOpen(false);
        setIsStarting(true);
        setJobData(null);

        try {
            const startResult = await startGameWeek(season, selectedWeek);
            setActiveJobId(startResult.jobId);
            startPolling(startResult.jobId);
        } catch (err) {
            console.error('Error starting week:', err);
            setIsStarting(false);
            if (err.status === 409) {
                setRankingsWarning(err.message);
                return;
            }
            setJobData({
                status: 'FAILED',
                logs: [{ homeTeam: '', awayTeam: '', status: 'FAILED', message: `Failed to start week: ${err.message}`, timestamp: new Date().toLocaleTimeString(), index: 0 }],
                totalGames: 0,
                startedGames: 0,
                failedGames: 0,
            });
        }
    };

    const handleRetryFailed = async () => {
        if (!activeJobId) return;
        setIsStarting(true);
        try {
            const retryResult = await retryFailedGames(activeJobId);
            setActiveJobId(retryResult.jobId);
            setJobData(null);
            startPolling(retryResult.jobId);
        } catch (err) {
            console.error('Error retrying failed games:', err);
            setIsStarting(false);
        }
    };

    const stats = getGameStats();
    const isJobComplete = jobData && (jobData.status === 'COMPLETED' || jobData.status === 'FAILED');
    const hasFailedGames = jobData && jobData.failedGames > 0 && isJobComplete;
    const progressPercent = jobData && jobData.totalGames > 0 ? Math.round((jobData.currentIndex / jobData.totalGames) * 100) : 0;

    if (loading) {
        return (
            <AdminLayout title="Game Week">
                <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Game Week">
            {error && <Alert severity="error" sx={{ mb: '16px' }}>{error}</Alert>}
            <TileGrid minTile={190} sx={{ mb: '16px' }}>
                <StatTile label="Current season" value={season || '-'} />
                <Box sx={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r)', px: '15px', py: '14px' }}>
                    <Box component="small" sx={{ color: 'var(--text-dim)', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800, display: 'block', mb: '8px' }}>
                        Viewing week {week ? `(current: ${week})` : ''}
                    </Box>
                    <Box
                        component="select"
                        value={selectedWeek || ''}
                        onChange={(e) => {
                            if (pollIntervalRef.current) { clearInterval(pollIntervalRef.current); pollIntervalRef.current = null; }
                            const nextWeek = Number(e.target.value);
                            setSelectedWeek(nextWeek);
                            setJobData(null);
                            setActiveJobId(null);
                            setIsStarting(false);
                            const next = new URLSearchParams(searchParams);
                            next.set('season', String(season));
                            next.set('week', String(week));
                            next.set('selectedWeek', String(nextWeek));
                            setSearchParams(next, { replace: true });
                        }}
                        sx={selectSx}
                    >
                        {Array.from({ length: 18 }, (_, i) => i + 1).map((w) => (
                            <option key={w} value={w}>{weekLabel(w)}{w === week ? ' (current)' : ''}</option>
                        ))}
                    </Box>
                </Box>
                <StatTile label="Total games" value={stats.total} caption={`${stats.notStarted} pending, ${stats.started} started`} />
                <Box sx={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r)', px: '15px', py: '14px', display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
                    <Box component="button" type="button" onClick={() => setConfirmDialogOpen(true)} disabled={isStarting || stats.notStarted === 0} sx={btnPrimarySx}>
                        {isStarting ? 'Starting...' : stats.notStarted === 0 ? 'All games started' : `Start week ${selectedWeek}`}
                    </Box>
                    {hasFailedGames && (
                        <Box component="button" type="button" onClick={handleRetryFailed} disabled={isStarting} sx={btnGhostSx}>
                            Retry {jobData.failedGames} failed
                        </Box>
                    )}
                </Box>
            </TileGrid>

            {jobData && (
                <Panel header="Game start progress" sx={{ mb: '16px' }}>
                    <Box sx={{ p: '16px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '12px', flexWrap: 'wrap', gap: '8px' }}>
                            <Box component="span" sx={{ ...pillSx, background: 'var(--surface-2)', color: statusColor(jobData.status) }}>{jobData.status}</Box>
                            {jobData.totalGames > 0 && (
                                <Box sx={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                                    {jobData.startedGames} started / {jobData.failedGames} failed / {jobData.totalGames} total
                                </Box>
                            )}
                        </Box>

                        {jobData.status === 'IN_PROGRESS' && (
                            <Box sx={{ mb: '14px' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '4px', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                                    <span>Processing game {jobData.currentIndex} of {jobData.totalGames}</span>
                                    <span>{progressPercent}%</span>
                                </Box>
                                <Box sx={{ height: 8, borderRadius: 4, background: 'var(--surface-2)', overflow: 'hidden' }}>
                                    <Box sx={{ height: '100%', width: `${progressPercent}%`, background: 'var(--brand)', transition: 'width 0.3s' }} />
                                </Box>
                            </Box>
                        )}

                        {isJobComplete && jobData.status === 'COMPLETED' && (
                            <Alert severity={jobData.failedGames > 0 ? 'warning' : 'success'} sx={{ mb: '14px' }}>
                                {jobData.failedGames > 0
                                    ? `Week ${selectedWeek} processing complete. ${jobData.startedGames} started, ${jobData.failedGames} failed. You can retry the failed games.`
                                    : `Week ${selectedWeek} started successfully! All ${jobData.startedGames} games started.`}
                            </Alert>
                        )}

                        <Box ref={logContainerRef} sx={{ maxHeight: 400, overflow: 'auto', p: '14px', background: 'var(--brand-ink, #08151f)', borderRadius: 'var(--r-sm)', border: '1px solid var(--line)', fontFamily: 'monospace' }}>
                            {jobData.logs && jobData.logs.map((log, idx) => (
                                <Box key={idx} sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: log.status === 'SUCCESS' ? '#4ade80' : log.status === 'FAILED' ? '#f87171' : '#94a3b8', mb: '3px', lineHeight: 1.6 }}>
                                    <Box component="span" sx={{ color: '#64748b', mr: '8px' }}>[{log.timestamp}]</Box>
                                    <Box component="span" sx={{ color: '#818cf8', mr: '8px' }}>[{log.index}/{jobData.totalGames}]</Box>
                                    {log.status === 'SUCCESS' ? '[OK]' : '[FAIL]'} {log.homeTeam} vs {log.awayTeam}: {log.message}
                                </Box>
                            ))}
                            {jobData.status === 'IN_PROGRESS' && (
                                <Box sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#94a3b8', mt: '4px' }}>
                                    Processing... (updates every {POLL_INTERVAL_MS / 1000}s)
                                </Box>
                            )}
                            {jobData.logs?.length === 0 && jobData.status === 'PENDING' && (
                                <Box sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#94a3b8' }}>Job queued, waiting to start...</Box>
                            )}
                        </Box>
                    </Box>
                </Panel>
            )}

            <Panel header={`Week ${selectedWeek} games`}>
                {scheduleLoading ? (
                    <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
                ) : weekSchedule.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>No games scheduled for Week {selectedWeek}.</Box>
                ) : (
                    <DataTable minWidth={560}>
                        <thead>
                            <tr>
                                <th className="lft stick">Home team</th>
                                <th className="lft">Away team</th>
                                <th className="lft">Game type</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...weekSchedule].sort((a, b) => {
                                if (a.started !== b.started) return a.started ? 1 : -1;
                                if (a.finished !== b.finished) return a.finished ? 1 : -1;
                                return 0;
                            }).map((game, idx) => {
                                const status = gameStatusInfo(game);
                                return (
                                    <tr key={game.id || idx}>
                                        <td className="lft stick">{game.homeTeam || game.home_team}</td>
                                        <td className="lft">{game.awayTeam || game.away_team}</td>
                                        <td className="lft">{game.gameType || game.game_type || '-'}</td>
                                        <td>
                                            <Box component="span" sx={{ ...pillSx, background: 'var(--surface-2)', color: status.color }}>{status.label}</Box>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </DataTable>
                )}
            </Panel>

            <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
                <DialogTitle>Start Game Week {selectedWeek}?</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        This will start all {stats.notStarted} unstarted games for Week {selectedWeek}, Season {season}.
                    </Typography>
                    <Alert severity="info" sx={{ mb: 1 }}>
                        Games will be started with smart pacing (~3s between each game, 60s cooldown every 25 games) to respect Discord rate limits.
                    </Alert>
                    <Alert severity="success">
                        You can track progress in real-time and retry any failed games after completion.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="success" onClick={handleStartWeek}>Start Week {selectedWeek}</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={Boolean(rankingsWarning)} onClose={() => setRankingsWarning(null)}>
                <DialogTitle>Rankings not uploaded</DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mt: 1 }}>{rankingsWarning}</Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRankingsWarning(null)}>Cancel</Button>
                    <Button variant="contained" onClick={() => { window.location.href = '/admin/rankings'; }}>Upload Rankings</Button>
                </DialogActions>
            </Dialog>
        </AdminLayout>
    );
};

export default GameWeek;
