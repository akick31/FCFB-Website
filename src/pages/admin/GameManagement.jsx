import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, TextField, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, Typography, Button } from '@mui/material';
import AdminLayout from '../../components/layout/AdminLayout';
import { Link } from 'react-router-dom';
import Panel from '../../components/ui/Panel';
import DataTable from '../../components/ui/DataTable';
import SelectPill from '../../components/ui/SelectPill';
import Pager from '../../components/ui/Pager';
import {
    startGame,
    startScrimmage,
    startOvertimeGame,
    markAllGamesAsChewMode,
    endAllOngoingGames,
    getFilteredGames
} from '../../api/gameApi';
import { getCurrentSeasonOrLatest, getCurrentWeekOrLatest, getAllSeasons } from '../../api/seasonApi';
import { getAllTeams } from '../../api/teamApi';
import { isRealTeam } from '../../utils/teamDataUtils';
import { getScheduleBySeasonAndWeek, startGameWeek, getGameWeekJobStatus, retryFailedGames } from '../../api/scheduleApi';
import { GAME_TYPES, GAME_STATUSES, GAME_TYPE_DESCRIPTIONS, GAME_STATUS_DESCRIPTIONS } from '../../constants/gameEnums';

const POLL_INTERVAL_MS = 3000;

const selectSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.82rem', cursor: 'pointer', '& option': { background: 'var(--surface-2)', color: 'var(--text)' } };
const btnPrimarySx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '16px', py: '11px', font: 'inherit', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', width: '100%', '&:disabled': { opacity: 0.6, cursor: 'default' } };
const btnGhostSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '14px', py: '10px', font: 'inherit', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', width: '100%', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' }, '&:disabled': { opacity: 0.6, cursor: 'default' } };
const pillSx = { display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', px: '8px', py: '3px', borderRadius: 'var(--r-sm)', lineHeight: 1 };
const pillHeightSx = { height: '38px', boxSizing: 'border-box' };
const editBtnSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '10px', py: '5px', font: 'inherit', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' } };

const GameManagement = () => {
    const [loading, setLoading] = useState(false);
    const [gamesLoading, setGamesLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [filteredGames, setFilteredGames] = useState([]);
    const [filters, setFilters] = useState({ season: null, week: null, gameType: null, gameStatus: null });

    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(50);
    const [totalGames, setTotalGames] = useState(0);
    const [scrimmageDialogOpen, setScrimmageDialogOpen] = useState(false);
    const [scrimmageTeams, setScrimmageTeams] = useState({ homeTeam: '', awayTeam: '', scrimmageType: 'Standard' });
    const [availableTeams, setAvailableTeams] = useState([]);
    const [startGameDialogOpen, setStartGameDialogOpen] = useState(false);
    const [startGameData, setStartGameData] = useState({ subdivision: 'FCFB', homeTeam: '', awayTeam: '', tvChannel: 'ABC', gameType: 'Out of Conference' });

    const [currentSeason, setCurrentSeason] = useState(null);
    const [currentWeek, setCurrentWeek] = useState(null);
    const [filterSeasons, setFilterSeasons] = useState([]);
    const [selectedStartSeason, setSelectedStartSeason] = useState(null);
    const [selectedStartWeek, setSelectedStartWeek] = useState(null);
    const [weekSchedule, setWeekSchedule] = useState([]);
    const [activeJobId, setActiveJobId] = useState(null);
    const [jobData, setJobData] = useState(null);
    const [isStarting, setIsStarting] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const pollIntervalRef = useRef(null);

    useEffect(() => () => { if (pollIntervalRef.current) clearInterval(pollIntervalRef.current); }, []);

    const fetchGames = useCallback(async (overrideFilters, page = currentPage) => {
        const f = overrideFilters || filters;
        if (!f.season || !f.week) return;
        setGamesLoading(true);
        try {
            const response = await getFilteredGames({
                filters: [], season: f.season, week: f.week, gameType: f.gameType, gameStatus: f.gameStatus,
                sort: 'MOST_TIME_REMAINING', page, size: pageSize,
            });
            const allGames = response.content || [];
            setTotalGames(response.totalElements || allGames.length);
            setFilteredGames(allGames);
        } catch (err) {
            console.error('Failed to load games:', err);
            setError('Failed to load games');
        } finally {
            setGamesLoading(false);
        }
    }, [filters, currentPage, pageSize]);

    useEffect(() => {
        const initDefaults = async () => {
            let season;
            let week;
            try {
                [season, week] = await Promise.all([getCurrentSeasonOrLatest(), getCurrentWeekOrLatest()]);
            } catch (err) {
                console.error('Failed to fetch current season/week:', err);
                season = 11;
                week = 1;
            }

            const allSeasons = await getAllSeasons().catch(() => []);
            const seasonNumbers = allSeasons
                .map((entry) => entry.season_number ?? entry.seasonNumber)
                .filter((value) => value != null)
                .sort((a, b) => b - a);
            setFilterSeasons(seasonNumbers.length > 0 ? seasonNumbers : [season].filter(Boolean));

            setCurrentSeason(season);
            setCurrentWeek(week);
            setSelectedStartSeason(season);
            setSelectedStartWeek(week);
            if (season && week) {
                try {
                    const schedule = await getScheduleBySeasonAndWeek(season, week);
                    setWeekSchedule(schedule || []);
                } catch (err) {
                    console.error('Failed to load week schedule:', err);
                    setError('Failed to load week schedule');
                }
            }
            const nextFilters = { season, week, gameType: null, gameStatus: null };
            setFilters(nextFilters);
            fetchGames(nextFilters, 0);
        };
        initDefaults();
    }, []);

    useEffect(() => {
        getAllTeams()
            .then((teams) => setAvailableTeams(teams.filter(isRealTeam)))
            .catch((err) => { console.error('Failed to load teams:', err); setError('Failed to load teams'); });
    }, []);

    const getGameStats = () => {
        const total = weekSchedule.length;
        const started = weekSchedule.filter(g => g.started).length;
        const notStarted = weekSchedule.filter(g => !g.started).length;
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
                    const schedule = await getScheduleBySeasonAndWeek(selectedStartSeason, selectedStartWeek);
                    setWeekSchedule(schedule || []);
                }
            } catch (err) {
                console.error('Error polling job status:', err);
            }
        };
        poll();
        pollIntervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
    }, [selectedStartSeason, selectedStartWeek]);

    const handleStartWeek = async () => {
        setConfirmDialogOpen(false);
        setIsStarting(true);
        setJobData(null);
        try {
            const startResult = await startGameWeek(selectedStartSeason, selectedStartWeek);
            setActiveJobId(startResult.jobId);
            startPolling(startResult.jobId);
        } catch (err) {
            console.error('Error starting week:', err);
            setIsStarting(false);
            setError(`Failed to start week: ${err.message}`);
        }
    };

    const handleStartWeekSelectionChange = async (season, week) => {
        if (!season || !week) return;
        try {
            const schedule = await getScheduleBySeasonAndWeek(season, week);
            setWeekSchedule(schedule || []);
        } catch (err) {
            console.error('Failed to load schedule:', err);
            setError('Failed to load schedule');
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
            setError(`Failed to retry: ${err.message}`);
        }
    };

    const handleFilterChange = (field, value) => {
        const next = { ...filters, [field]: value === '' || value === 'ALL' ? null : value };
        setFilters(next);
        setCurrentPage(0);
        fetchGames(next, 0);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchGames(filters, page);
    };

    const openStartGameDialog = async () => {
        try {
            const teams = await getAllTeams();
            setAvailableTeams(teams.filter(isRealTeam));
            setStartGameDialogOpen(true);
        } catch (err) {
            setError(`Failed to load teams: ${err.message}`);
        }
    };

    const openScrimmageDialog = async (scrimmageType = 'Standard') => {
        try {
            const teams = await getAllTeams();
            setAvailableTeams(teams.filter(isRealTeam));
            setScrimmageTeams((prev) => ({ ...prev, scrimmageType }));
            setScrimmageDialogOpen(true);
        } catch (err) {
            setError(`Failed to load teams: ${err.message}`);
        }
    };

    const handleScrimmageSubmit = async () => {
        if (!scrimmageTeams.homeTeam || !scrimmageTeams.awayTeam) {
            setError('Please select both home and away teams');
            return;
        }
        if (scrimmageTeams.homeTeam === scrimmageTeams.awayTeam) {
            setError('Home and away teams must be different');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const startRequest = {
                homeTeam: scrimmageTeams.homeTeam,
                awayTeam: scrimmageTeams.awayTeam,
                gameType: 'SCRIMMAGE',
                season: filters.season,
                week: filters.week,
                homeOffensivePlaybook: 'PRO',
                awayOffensivePlaybook: 'PRO',
                homeDefensivePlaybook: 'FOUR_THREE',
                awayDefensivePlaybook: 'FOUR_THREE',
            };
            if (scrimmageTeams.scrimmageType === 'Overtime') {
                await startOvertimeGame(startRequest);
                setSuccess('Overtime scrimmage started successfully!');
            } else {
                await startScrimmage(startRequest);
                setSuccess('Standard scrimmage started successfully!');
            }
            setScrimmageTeams({ homeTeam: '', awayTeam: '', scrimmageType: 'Standard' });
            setScrimmageDialogOpen(false);
        } catch (err) {
            setError(`Failed to start scrimmage: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleScrimmageCancel = () => {
        setScrimmageTeams({ homeTeam: '', awayTeam: '', scrimmageType: 'Standard' });
        setScrimmageDialogOpen(false);
    };

    const handleStartGameCancel = () => {
        setStartGameData({ subdivision: 'FCFB', homeTeam: '', awayTeam: '', tvChannel: 'ABC', gameType: 'Out of Conference' });
        setStartGameDialogOpen(false);
    };

    const handleStartGameSubmit = async () => {
        if (!startGameData.homeTeam || !startGameData.awayTeam) {
            setError('Please select both home and away teams');
            return;
        }
        if (startGameData.homeTeam === startGameData.awayTeam) {
            setError('Home and away teams must be different');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await startGame({ ...startGameData });
            setSuccess('Game started successfully!');
            setStartGameData({ subdivision: 'FCFB', homeTeam: '', awayTeam: '', tvChannel: 'ABC', gameType: 'Out of Conference' });
            setStartGameDialogOpen(false);
        } catch (err) {
            setError(`Failed to start game: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllAsChewMode = async () => {
        if (filteredGames.length === 0) { setError('No games to mark as chew mode'); return; }
        setLoading(true);
        setError(null);
        try {
            await markAllGamesAsChewMode();
            setSuccess('All games marked as chew mode!');
        } catch (err) {
            setError(`Failed to mark games as chew mode: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEndAllGames = async () => {
        if (filteredGames.length === 0) { setError('No games to end'); return; }
        setLoading(true);
        setError(null);
        try {
            await endAllOngoingGames();
            setSuccess('All games ended successfully!');
        } catch (err) {
            setError(`Failed to end all games: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const stats = getGameStats();
    const pageCount = Math.ceil(totalGames / pageSize);

    return (
        <AdminLayout title="Game Management">
            {error && <Alert severity="error" sx={{ mb: '16px' }} onClose={() => setError(null)}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: '16px' }} onClose={() => setSuccess(null)}>{success}</Alert>}

            {selectedStartSeason && selectedStartWeek && (
                <Panel header="Start game week" sx={{ mb: '16px' }}>
                    <Box sx={{ p: '16px' }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between', mb: '14px' }}>
                            <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <Box component="select" value={selectedStartSeason || ''} onChange={(e) => { setSelectedStartSeason(Number(e.target.value)); handleStartWeekSelectionChange(Number(e.target.value), selectedStartWeek); }} sx={selectSx}>
                                    {Array.from({ length: currentSeason || 1 }, (_, i) => i + 1).map((s) => <option key={s} value={s}>Season {s}</option>)}
                                </Box>
                                <Box component="select" value={selectedStartWeek || ''} onChange={(e) => { setSelectedStartWeek(Number(e.target.value)); handleStartWeekSelectionChange(selectedStartSeason, Number(e.target.value)); }} sx={selectSx}>
                                    {Array.from({ length: currentWeek || 18 }, (_, i) => i + 1).map((w) => <option key={w} value={w}>Week {w}</option>)}
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: '8px' }}>
                                <Box component="span" sx={{ ...pillSx, background: 'var(--surface-2)', color: 'var(--text-muted)' }}>{stats.total} total</Box>
                                <Box component="span" sx={{ ...pillSx, background: 'var(--surface-2)', color: 'var(--field)' }}>{stats.started} started</Box>
                                <Box component="span" sx={{ ...pillSx, background: 'var(--surface-2)', color: 'var(--gold)' }}>{stats.notStarted} not started</Box>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <Box component="button" type="button" onClick={() => setConfirmDialogOpen(true)} disabled={isStarting} sx={{ ...btnPrimarySx, width: 'auto', minWidth: 200, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                {isStarting && <CircularProgress size={16} sx={{ color: '#fff' }} />}
                                {isStarting ? 'Starting...' : `Start Week ${selectedStartWeek}`}
                            </Box>
                            {stats.notStarted === 0 && stats.total > 0 && (
                                <Box component="span" sx={{ ...pillSx, background: 'transparent', color: 'var(--field)', border: '1px solid color-mix(in srgb, var(--field) 55%, var(--line))' }}>All games started</Box>
                            )}
                            {jobData && jobData.failedGames > 0 && (jobData.status === 'COMPLETED' || jobData.status === 'FAILED') && (
                                <Box component="button" type="button" onClick={handleRetryFailed} disabled={isStarting} sx={{ ...btnGhostSx, width: 'auto', color: 'var(--gold)' }}>
                                    Retry {jobData.failedGames} failed
                                </Box>
                            )}
                        </Box>

                        {jobData && jobData.logs && jobData.logs.length > 0 && (
                            <Box sx={{ mt: '14px', maxHeight: 200, overflow: 'auto', background: 'var(--brand-ink, #08151f)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', p: '10px' }}>
                                {jobData.logs.slice(-10).map((log, idx) => (
                                    <Box key={idx} sx={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.6 }}>
                                        [{log.timestamp}] {log.homeTeam} vs {log.awayTeam}: {log.status} - {log.message}
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
                </Panel>
            )}

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: '16px', mb: '16px' }}>
                <Panel header="Create new game">
                    <Box sx={{ p: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <Box component="button" type="button" onClick={openStartGameDialog} disabled={loading} sx={btnPrimarySx}>Start game</Box>
                        <Box component="button" type="button" onClick={() => openScrimmageDialog('Standard')} disabled={loading} sx={btnPrimarySx}>Start scrimmage</Box>
                        <Box component="button" type="button" onClick={() => openScrimmageDialog('Overtime')} disabled={loading} sx={btnPrimarySx}>Start overtime scrimmage</Box>
                    </Box>
                </Panel>

                <Panel header="Quick actions">
                    <Box sx={{ p: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <Box component="button" type="button" onClick={() => fetchGames(filters, currentPage)} disabled={gamesLoading} sx={btnGhostSx}>&#8635; Refresh games</Box>
                        <Box component="button" type="button" onClick={handleMarkAllAsChewMode} disabled={loading} sx={btnGhostSx}>Put all games in chew mode</Box>
                        <Box component="button" type="button" onClick={handleEndAllGames} disabled={loading} sx={{ ...btnGhostSx, color: 'var(--live)' }}>End all ongoing games</Box>
                    </Box>
                </Panel>
            </Box>

            <Panel
                header={`Games (${filteredGames.length})`}
            >
                <Box sx={{ p: '16px 16px 0', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <SelectPill label="Season" value={filters.season || ''} onChange={(v) => handleFilterChange('season', v ? Number(v) : '')} options={[{ value: '', label: 'All seasons' }, ...filterSeasons.map((s) => ({ value: s, label: `Season ${s}` }))]} sx={pillHeightSx} />
                    <SelectPill label="Week" value={filters.week || ''} onChange={(v) => handleFilterChange('week', v ? Number(v) : '')} options={[{ value: '', label: 'All weeks' }, ...Array.from({ length: currentWeek || 18 }, (_, i) => ({ value: i + 1, label: `Week ${i + 1}` }))]} sx={pillHeightSx} />
                    <SelectPill label="Type" value={filters.gameType || 'ALL'} onChange={(v) => handleFilterChange('gameType', v)} options={[{ value: 'ALL', label: 'All types' }, ...GAME_TYPES.map((t) => ({ value: t, label: GAME_TYPE_DESCRIPTIONS[t] }))]} sx={pillHeightSx} />
                    <SelectPill label="Status" value={filters.gameStatus || 'ALL'} onChange={(v) => handleFilterChange('gameStatus', v)} options={[{ value: 'ALL', label: 'All statuses' }, ...GAME_STATUSES.map((s) => ({ value: s, label: GAME_STATUS_DESCRIPTIONS[s] }))]} sx={pillHeightSx} />
                </Box>

                {gamesLoading ? (
                    <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
                ) : filteredGames.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>No games found.</Box>
                ) : (
                    <Box sx={{ p: '16px' }}>
                        <DataTable minWidth={720}>
                            <thead>
                                <tr>
                                    <th className="lft stick">Teams</th>
                                    <th className="lft">Score</th>
                                    <th>Quarter</th>
                                    <th>Clock</th>
                                    <th className="lft">Game type</th>
                                    <th className="lft">Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredGames.map((game) => (
                                    <tr key={game.game_id || game.gameId}>
                                        <td className="lft stick">{game.awayTeam || game.away_team} @ {game.homeTeam || game.home_team}</td>
                                        <td className="lft">{game.awayScore || game.away_score || 0} - {game.homeScore || game.home_score || 0}</td>
                                        <td>{game.quarter || 1}</td>
                                        <td>{game.clock || game.game_clock || '00:00'}</td>
                                        <td className="lft">
                                            <Box component="span" sx={{ ...pillSx, background: 'var(--surface-2)', color: 'var(--brand)' }}>{GAME_TYPE_DESCRIPTIONS[game.gameType || game.game_type] || 'Unknown'}</Box>
                                        </td>
                                        <td className="lft">
                                            <Box component="span" sx={{ ...pillSx, background: 'var(--surface-2)', color: game.gameStatus === 'IN_PROGRESS' ? 'var(--field)' : 'var(--text-muted)' }}>{GAME_STATUS_DESCRIPTIONS[game.gameStatus || game.game_status] || 'Unknown'}</Box>
                                        </td>
                                        <td>
                                            <Box component={Link} to={`/admin/edit-game/${game.game_id}`} sx={{ ...editBtnSx, textDecoration: 'none', display: 'inline-block' }}>Edit</Box>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </DataTable>

                        {totalGames > pageSize && (
                            <>
                                <Box sx={{ color: 'var(--text-dim)', fontSize: '0.76rem', mt: '10px' }}>
                                    Showing {Math.min(currentPage * pageSize + 1, totalGames)} to {Math.min((currentPage + 1) * pageSize, totalGames)} of {totalGames} games
                                </Box>
                                <Pager page={currentPage} pageCount={pageCount} onChange={handlePageChange} />
                            </>
                        )}
                    </Box>
                )}
            </Panel>

            <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
                <DialogTitle>Start Game Week {selectedStartWeek}?</DialogTitle>
                <DialogContent>
                    {stats.notStarted === 0 && stats.total > 0 ? (
                        <>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                All games for Week {selectedStartWeek}, Season {selectedStartSeason} have already been started.
                            </Typography>
                            <Alert severity="info">
                                Clicking &quot;Start Week&quot; will attempt to start any games that may have failed previously or were missed.
                            </Alert>
                        </>
                    ) : (
                        <>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                This will start all {stats.notStarted} unstarted games for Week {selectedStartWeek}, Season {selectedStartSeason}.
                            </Typography>
                            <Alert severity="info" sx={{ mb: 1 }}>
                                Games will be started with smart pacing (~3s between each game, 60s cooldown every 25 games) to respect Discord rate limits.
                            </Alert>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="success" onClick={handleStartWeek}>Start Week {selectedStartWeek}</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={scrimmageDialogOpen} onClose={handleScrimmageCancel} maxWidth="sm" fullWidth>
                <DialogTitle>Start Scrimmage</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Autocomplete
                            options={availableTeams}
                            getOptionLabel={(option) => option.name || ''}
                            value={availableTeams.find(team => team.name === scrimmageTeams.homeTeam) || null}
                            onChange={(event, newValue) => setScrimmageTeams(prev => ({ ...prev, homeTeam: newValue ? newValue.name : '' }))}
                            renderInput={(params) => <TextField {...params} label="Home Team" fullWidth />}
                            isOptionDisabled={(option) => option.name === scrimmageTeams.awayTeam}
                        />
                        <Autocomplete
                            options={availableTeams}
                            getOptionLabel={(option) => option.name || ''}
                            value={availableTeams.find(team => team.name === scrimmageTeams.awayTeam) || null}
                            onChange={(event, newValue) => setScrimmageTeams(prev => ({ ...prev, awayTeam: newValue ? newValue.name : '' }))}
                            renderInput={(params) => <TextField {...params} label="Away Team" fullWidth />}
                            isOptionDisabled={(option) => option.name === scrimmageTeams.homeTeam}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleScrimmageCancel}>Cancel</Button>
                    <Button onClick={handleScrimmageSubmit} variant="contained" disabled={loading || !scrimmageTeams.homeTeam || !scrimmageTeams.awayTeam}>
                        {loading ? <CircularProgress size={20} /> : 'Start Scrimmage'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={startGameDialogOpen} onClose={handleStartGameCancel} maxWidth="md" fullWidth>
                <DialogTitle>Start New Game</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="subtitle2">Game Configuration</Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <TextField select label="Subdivision" value={startGameData.subdivision} onChange={(e) => setStartGameData(prev => ({ ...prev, subdivision: e.target.value }))} sx={{ flex: '1 1 150px' }} SelectProps={{ native: true }}>
                                <option value="FCFB">FCFB</option>
                                <option value="FBS">FBS</option>
                                <option value="FCS">FCS</option>
                            </TextField>
                            <TextField select label="Game Type" value={startGameData.gameType} onChange={(e) => setStartGameData(prev => ({ ...prev, gameType: e.target.value }))} sx={{ flex: '1 1 200px' }} SelectProps={{ native: true }}>
                                <option value="Out of Conference">Out of Conference</option>
                                <option value="Conference Game">Conference Game</option>
                                <option value="Conference Championship">Conference Championship</option>
                                <option value="Bowl Game">Bowl Game</option>
                                <option value="Playoff Game">Playoff Game</option>
                                <option value="National Championship">National Championship</option>
                                <option value="Scrimmage">Scrimmage</option>
                            </TextField>
                            <TextField select label="TV Channel" value={startGameData.tvChannel} onChange={(e) => setStartGameData(prev => ({ ...prev, tvChannel: e.target.value }))} sx={{ flex: '1 1 150px' }} SelectProps={{ native: true }}>
                                {['ABC', 'CBS', 'ESPN', 'ESPN2', 'FOX', 'FS1', 'FS2', 'NBC', 'ACC Network', 'Big Ten Network', 'CBS Sports Network', 'The CW', 'ESPNU', 'ESPN+', 'SEC Network', 'Pac-12 Network', 'TNT', 'Peacock', 'ESPNEWS'].map((channel) => (
                                    <option key={channel} value={channel}>{channel}</option>
                                ))}
                            </TextField>
                        </Box>

                        <Typography variant="subtitle2" sx={{ mt: 1 }}>Team Selection</Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Autocomplete
                                sx={{ flex: '1 1 220px' }}
                                options={availableTeams}
                                getOptionLabel={(option) => option.name || ''}
                                value={availableTeams.find(team => team.name === startGameData.homeTeam) || null}
                                onChange={(event, newValue) => setStartGameData(prev => ({ ...prev, homeTeam: newValue ? newValue.name : '' }))}
                                renderInput={(params) => <TextField {...params} label="Home Team" fullWidth />}
                                isOptionDisabled={(option) => option.name === startGameData.awayTeam}
                            />
                            <Autocomplete
                                sx={{ flex: '1 1 220px' }}
                                options={availableTeams}
                                getOptionLabel={(option) => option.name || ''}
                                value={availableTeams.find(team => team.name === startGameData.awayTeam) || null}
                                onChange={(event, newValue) => setStartGameData(prev => ({ ...prev, awayTeam: newValue ? newValue.name : '' }))}
                                renderInput={(params) => <TextField {...params} label="Away Team" fullWidth />}
                                isOptionDisabled={(option) => option.name === startGameData.homeTeam}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleStartGameCancel}>Cancel</Button>
                    <Button onClick={handleStartGameSubmit} variant="contained" disabled={loading || !startGameData.homeTeam || !startGameData.awayTeam}>
                        {loading ? <CircularProgress size={20} /> : 'Start Game'}
                    </Button>
                </DialogActions>
            </Dialog>
        </AdminLayout>
    );
};

export default GameManagement;
