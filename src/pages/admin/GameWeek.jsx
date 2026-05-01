import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Paper,
    Chip,
    Alert,
    CircularProgress,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import {
    PlayArrow as StartIcon,
    CheckCircle as SuccessIcon,
    Replay as RetryIcon,
    Schedule as ScheduleIcon,
    SportsFootball as GameIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StyledCard from '../../components/ui/StyledCard';
import { useNavigate } from 'react-router-dom';
import { getCurrentSeason, getCurrentWeek } from '../../api/seasonApi';
import {
    getScheduleBySeasonAndWeek,
    startGameWeek,
    getGameWeekJobStatus,
    retryFailedGames,
} from '../../api/scheduleApi';
import { adminNavigationItems } from '../../config/adminNavigation.jsx';

const POLL_INTERVAL_MS = 3000; // Poll every 3 seconds

const GameWeek = () => {
    const navigate = useNavigate();
    const [season, setSeason] = useState(null);
    const [week, setWeek] = useState(null);
    const [selectedWeek, setSelectedWeek] = useState(null);
    const [loading, setLoading] = useState(true);
    const [weekSchedule, setWeekSchedule] = useState([]);
    const [scheduleLoading, setScheduleLoading] = useState(false);

    // Job tracking state
    const [activeJobId, setActiveJobId] = useState(null);
    const [jobData, setJobData] = useState(null);
    const [isStarting, setIsStarting] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

    const logContainerRef = useRef(null);
    const pollIntervalRef = useRef(null);

    // Initialize
    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                const [currentSeason, currentWeek] = await Promise.all([
                    getCurrentSeason(),
                    getCurrentWeek()
                ]);
                setSeason(currentSeason);
                setWeek(currentWeek);
                setSelectedWeek(currentWeek);
            } catch (err) {
                console.error('Error initializing game week page:', err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    // Fetch week schedule when season/selectedWeek available
    useEffect(() => {
        if (season && selectedWeek) {
            fetchWeekSchedule();
        }
    }, [season, selectedWeek]);

    // Auto-scroll log container when new logs arrive
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [jobData?.logs?.length]);

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, []);

    const fetchWeekSchedule = async () => {
        try {
            setScheduleLoading(true);
            const data = await getScheduleBySeasonAndWeek(season, selectedWeek);
            setWeekSchedule(data || []);
        } catch (err) {
            console.error('Error fetching week schedule:', err);
            setWeekSchedule([]);
        } finally {
            setScheduleLoading(false);
        }
    };

    const getGameStats = () => {
        const total = weekSchedule.length;
        const started = weekSchedule.filter(g => g.started).length;
        const finished = weekSchedule.filter(g => g.finished).length;
        const notStarted = weekSchedule.filter(g => !g.started).length;
        return { total, started, finished, notStarted };
    };

    // Start polling for job status
    const startPolling = useCallback((jobId) => {
        // Clear any existing interval
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
        }

        const poll = async () => {
            try {
                const status = await getGameWeekJobStatus(jobId);
                setJobData(status);

                // If job is completed, stop polling and refresh schedule
                if (status.status === 'COMPLETED' || status.status === 'FAILED') {
                    clearInterval(pollIntervalRef.current);
                    pollIntervalRef.current = null;
                    setIsStarting(false);
                    // Refresh schedule data
                    await fetchWeekSchedule();
                }
            } catch (err) {
                console.error('Error polling job status:', err);
                // Don't stop polling on transient errors
            }
        };

        // Poll immediately, then at interval
        poll();
        pollIntervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
    }, [season, selectedWeek]);

    // Handle starting the week
    const handleStartWeek = async () => {
        setConfirmDialogOpen(false);
        setIsStarting(true);
        setJobData(null);

        try {
            const result = await startGameWeek(season, selectedWeek);
            const jobId = result.jobId;
            setActiveJobId(jobId);
            startPolling(jobId);
        } catch (err) {
            console.error('Error starting week:', err);
            setIsStarting(false);
            setJobData({
                status: 'FAILED',
                logs: [{
                    homeTeam: '',
                    awayTeam: '',
                    status: 'FAILED',
                    message: `Failed to start week: ${err.message}`,
                    timestamp: new Date().toLocaleTimeString(),
                    index: 0,
                }],
                totalGames: 0,
                startedGames: 0,
                failedGames: 0,
            });
        }
    };

    // Handle retrying failed games
    const handleRetryFailed = async () => {
        if (!activeJobId) return;

        setIsStarting(true);

        try {
            const result = await retryFailedGames(activeJobId);
            const newJobId = result.jobId;
            setActiveJobId(newJobId);
            setJobData(null);
            startPolling(newJobId);
        } catch (err) {
            console.error('Error retrying failed games:', err);
            setIsStarting(false);
        }
    };

    const navigationItems = adminNavigationItems;
    const handleNavigationChange = (item) => navigate(item.path);
    const stats = getGameStats();

    const isJobComplete = jobData && (jobData.status === 'COMPLETED' || jobData.status === 'FAILED');
    const hasFailedGames = jobData && jobData.failedGames > 0 && isJobComplete;
    const progressPercent = jobData && jobData.totalGames > 0
        ? Math.round((jobData.currentIndex / jobData.totalGames) * 100)
        : 0;

    if (loading) {
        return (
            <DashboardLayout
                title="Game Week"
                navigationItems={navigationItems}
                onNavigationChange={handleNavigationChange}
                hideHeader={true}
                textColor="primary.main"
            >
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <CircularProgress size={60} />
                </Box>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="Game Week"
            navigationItems={navigationItems}
            onNavigationChange={handleNavigationChange}
            hideHeader={true}
            textColor="primary.main"
        >
            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                        Start Game Week
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Manage and start games for the current week
                    </Typography>
                </Box>

                {/* Current Season/Week Info */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StyledCard hover={false}>
                            <Box sx={{ textAlign: 'center' }}>
                                <ScheduleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                                <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                    {season || '—'}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Current Season
                                </Typography>
                            </Box>
                        </StyledCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StyledCard hover={false}>
                            <Box sx={{ textAlign: 'center' }}>
                                <GameIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                    Current Week: <strong>{week || '—'}</strong>
                                </Typography>
                                <FormControl size="small" fullWidth>
                                    <InputLabel>View Week</InputLabel>
                                    <Select
                                        value={selectedWeek || ''}
                                        label="View Week"
                                        onChange={(e) => {
                                            setSelectedWeek(e.target.value);
                                            setJobData(null);
                                            setActiveJobId(null);
                                        }}
                                    >
                                        {Array.from({ length: 18 }, (_, i) => i + 1).map(w => (
                                            <MenuItem key={w} value={w}>
                                                Week {w}{w === week ? ' (current)' : ''}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </StyledCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StyledCard hover={false}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                    {stats.total}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Total Games
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
                                    <Chip label={`${stats.notStarted} pending`} size="small" color="warning" variant="outlined" />
                                    <Chip label={`${stats.started} started`} size="small" color="success" variant="outlined" />
                                </Box>
                            </Box>
                        </StyledCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StyledCard hover={false}>
                            <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Button
                                    variant="contained"
                                    color="success"
                                    size="large"
                                    startIcon={isStarting ? <CircularProgress size={20} color="inherit" /> : <StartIcon />}
                                    onClick={() => setConfirmDialogOpen(true)}
                                    disabled={isStarting || stats.notStarted === 0}
                                    fullWidth
                                    sx={{
                                        py: 2,
                                        fontSize: '1.1rem',
                                        fontWeight: 700,
                                    }}
                                >
                                    {isStarting ? 'Starting...' : stats.notStarted === 0 ? 'All Games Started' : `Start Week ${selectedWeek}`}
                                </Button>
                                {hasFailedGames && (
                                    <Button
                                        variant="outlined"
                                        color="warning"
                                        startIcon={<RetryIcon />}
                                        onClick={handleRetryFailed}
                                        disabled={isStarting}
                                        fullWidth
                                    >
                                        Retry {jobData.failedGames} Failed
                                    </Button>
                                )}
                                {stats.notStarted === 0 && stats.total > 0 && (
                                    <Typography variant="caption" sx={{ color: 'success.main', display: 'block' }}>
                                        All games have been started!
                                    </Typography>
                                )}
                            </Box>
                        </StyledCard>
                    </Grid>
                </Grid>

                {/* Progress & Logs */}
                {jobData && (
                    <StyledCard hover={false} sx={{ mb: 4 }}>
                        <Box sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                    Game Start Progress
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Chip
                                        label={jobData.status}
                                        size="small"
                                        color={
                                            jobData.status === 'COMPLETED' ? 'success'
                                            : jobData.status === 'IN_PROGRESS' ? 'info'
                                            : jobData.status === 'FAILED' ? 'error'
                                            : 'default'
                                        }
                                    />
                                    {jobData.totalGames > 0 && (
                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                                            {jobData.startedGames} started / {jobData.failedGames} failed / {jobData.totalGames} total
                                        </Typography>
                                    )}
                                </Box>
                            </Box>

                            {/* Progress bar */}
                            {jobData.status === 'IN_PROGRESS' && (
                                <Box sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            Processing game {jobData.currentIndex} of {jobData.totalGames}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                            {progressPercent}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={progressPercent}
                                        sx={{ height: 8, borderRadius: 4 }}
                                    />
                                </Box>
                            )}

                            {isJobComplete && jobData.status === 'COMPLETED' && (
                                <Alert
                                    severity={jobData.failedGames > 0 ? 'warning' : 'success'}
                                    sx={{ mb: 2 }}
                                >
                                    {jobData.failedGames > 0
                                        ? `Week ${selectedWeek} processing complete. ${jobData.startedGames} started, ${jobData.failedGames} failed. You can retry the failed games.`
                                        : `Week ${selectedWeek} started successfully! All ${jobData.startedGames} games started.`
                                    }
                                </Alert>
                            )}

                            {/* Log Console */}
                            <Paper
                                ref={logContainerRef}
                                variant="outlined"
                                sx={{
                                    maxHeight: 400,
                                    overflow: 'auto',
                                    p: 2,
                                    backgroundColor: '#1e293b',
                                    borderRadius: 2,
                                    fontFamily: 'monospace',
                                }}
                            >
                                {jobData.logs && jobData.logs.map((log, idx) => (
                                    <Typography
                                        key={idx}
                                        variant="body2"
                                        sx={{
                                            fontFamily: 'monospace',
                                            fontSize: '0.8rem',
                                            color: log.status === 'SUCCESS' ? '#4ade80'
                                                : log.status === 'FAILED' ? '#f87171'
                                                : '#94a3b8',
                                            mb: 0.3,
                                            lineHeight: 1.6,
                                        }}
                                    >
                                        <Box component="span" sx={{ color: '#64748b', mr: 1 }}>
                                            [{log.timestamp}]
                                        </Box>
                                        <Box component="span" sx={{ color: '#818cf8', mr: 1 }}>
                                            [{log.index}/{jobData.totalGames}]
                                        </Box>
                                        {log.status === 'SUCCESS' ? '[OK]' : '[FAIL]'}{' '}
                                        {log.homeTeam} vs {log.awayTeam} — {log.message}
                                    </Typography>
                                ))}
                                {jobData.status === 'IN_PROGRESS' && (
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontFamily: 'monospace',
                                            fontSize: '0.8rem',
                                            color: '#94a3b8',
                                            mt: 0.5,
                                        }}
                                    >
                                        Processing... (updates every {POLL_INTERVAL_MS / 1000}s)
                                    </Typography>
                                )}
                                {jobData.logs?.length === 0 && jobData.status === 'PENDING' && (
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontFamily: 'monospace',
                                            fontSize: '0.8rem',
                                            color: '#94a3b8',
                                        }}
                                    >
                                        Job queued, waiting to start...
                                    </Typography>
                                )}
                            </Paper>
                        </Box>
                    </StyledCard>
                )}

                {/* Week Schedule Table */}
                <StyledCard hover={false}>
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
                            Week {selectedWeek} Games
                        </Typography>

                        {scheduleLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700 }}>Home Team</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Away Team</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Game Type</TableCell>
                                            <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {weekSchedule.sort((a, b) => {
                                            // Sort: not started first, then started, then finished
                                            if (a.started !== b.started) return a.started ? 1 : -1;
                                            if (a.finished !== b.finished) return a.finished ? 1 : -1;
                                            return 0;
                                        }).map((game, idx) => (
                                            <TableRow key={game.id || idx} hover>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        {game.homeTeam || game.home_team}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        {game.awayTeam || game.away_team}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {game.gameType || game.game_type || '—'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    {game.finished ? (
                                                        <Chip
                                                            icon={<SuccessIcon />}
                                                            label="Finished"
                                                            size="small"
                                                            color="default"
                                                        />
                                                    ) : game.started ? (
                                                        <Chip
                                                            icon={<GameIcon />}
                                                            label="In Progress"
                                                            size="small"
                                                            color="success"
                                                        />
                                                    ) : (
                                                        <Chip
                                                            label="Not Started"
                                                            size="small"
                                                            color="warning"
                                                            variant="outlined"
                                                        />
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {weekSchedule.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                                                    No games scheduled for Week {selectedWeek}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>
                </StyledCard>

                {/* Confirm Dialog */}
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
                        <Button variant="contained" color="success" onClick={handleStartWeek}>
                            Start Week {selectedWeek}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </DashboardLayout>
    );
};

export default GameWeek;
