import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Alert, CircularProgress } from '@mui/material';
import AdminLayout from '../../components/layout/AdminLayout';
import GameEditDialog from '../../components/admin/GameEditDialog';
import Panel from '../../components/ui/Panel';
import SelectPill from '../../components/ui/SelectPill';
import ScrimmageDialog from '../../components/gameManagement/ScrimmageDialog';
import StartGameDialog from '../../components/gameManagement/StartGameDialog';
import StartWeekConfirmDialog from '../../components/gameManagement/StartWeekConfirmDialog';
import ChewAllConfirmDialog from '../../components/gameManagement/ChewAllConfirmDialog';
import GamesTable from '../../components/gameManagement/GamesTable';
import useFitCount from '../../hooks/useFitCount';
import {
    startGame,
    startScrimmage,
    startOvertimeGame,
    markAllGamesAsChewMode,
    endAllOngoingGames,
} from '../../api/gameApi';
import { getCurrentSeasonOrLatest, getCurrentWeekOrLatest, getAllSeasons } from '../../api/seasonApi';
import { getAllTeams } from '../../api/teamApi';
import { isRealTeam } from '../../utils/teamDataUtils';
import useFilteredGames from '../../hooks/useFilteredGames';
import useGameWeekStarter from '../../hooks/useGameWeekStarter';
import { GAME_TYPES, GAME_STATUSES, GAME_TYPE_DESCRIPTIONS, GAME_STATUS_DESCRIPTIONS } from '../../constants/gameEnums';
import { weekLabel } from '../../utils/formatText';
import { compact, primaryButtonSx, secondaryButtonSx } from '../../styles/controls';

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
const pillHeightSx = { height: '38px', boxSizing: 'border-box' };

const GameManagement = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [initSeason, setInitSeason] = useState(null);
    const [initWeek, setInitWeek] = useState(null);
    const [filterSeasons, setFilterSeasons] = useState([]);

    const [scrimmageDialogOpen, setScrimmageDialogOpen] = useState(false);
    const [scrimmageTeams, setScrimmageTeams] = useState({ homeTeam: '', awayTeam: '', scrimmageType: 'Standard' });
    const [availableTeams, setAvailableTeams] = useState([]);
    const [startGameDialogOpen, setStartGameDialogOpen] = useState(false);
    const [chewAllDialogOpen, setChewAllDialogOpen] = useState(false);
    const [startGameData, setStartGameData] = useState({
        subdivision: 'FCFB',
        homeTeam: '',
        awayTeam: '',
        tvChannel: 'ABC',
        gameType: 'Out of Conference',
    });

    const [fitRef, fitPageSize] = useFitCount({ rowHeight: 40 });
    const {
        filters,
        filteredGames,
        gamesLoading,
        currentPage,
        totalGames,
        pageSize,
        pageCount,
        handleFilterChange,
        handlePageChange,
        refetch: refetchGames,
    } = useFilteredGames(initSeason, initWeek, setError, fitPageSize);

    const [searchParams, setSearchParams] = useSearchParams();
    const editing = searchParams.get('edit');

    const closeEditor = () => {
        setSearchParams({}, { replace: true });
        refetchGames();
    };

    const {
        selectedStartSeason,
        setSelectedStartSeason,
        selectedStartWeek,
        setSelectedStartWeek,
        jobData,
        isStarting,
        confirmDialogOpen,
        setConfirmDialogOpen,
        stats,
        handleStartWeek,
        handleStartWeekSelectionChange,
        handleRetryFailed,
    } = useGameWeekStarter(initSeason, initWeek, setError);

    useEffect(() => {
        let active = true;
        const initDefaults = async () => {
            const allSeasonsPromise = getAllSeasons().catch(() => []);
            let season;
            let week;
            try {
                [season, week] = await Promise.all([getCurrentSeasonOrLatest(), getCurrentWeekOrLatest()]);
            } catch (err) {
                if (!active) {
                    return;
                }
                console.error('Failed to fetch current season/week:', err);
                setError('Failed to load current season/week');
                return;
            }
            if (!active) {
                return;
            }

            const allSeasons = await allSeasonsPromise;
            if (!active) {
                return;
            }
            const seasonNumbers = allSeasons
                .map((entry) => entry.season_number ?? entry.seasonNumber)
                .filter((value) => value != null)
                .sort((a, b) => b - a);
            setFilterSeasons(seasonNumbers.length > 0 ? seasonNumbers : [season].filter(Boolean));

            setInitSeason(season);
            setInitWeek(week);
        };
        initDefaults();
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;
        getAllTeams()
            .then((teams) => {
                if (active) {
                    setAvailableTeams(teams.filter(isRealTeam));
                }
            })
            .catch((err) => {
                if (!active) {
                    return;
                }
                console.error('Failed to load teams:', err);
                setError('Failed to load teams');
            });
        return () => {
            active = false;
        };
    }, []);

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
        setStartGameData({
            subdivision: 'FCFB',
            homeTeam: '',
            awayTeam: '',
            tvChannel: 'ABC',
            gameType: 'Out of Conference',
        });
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
            setStartGameData({
                subdivision: 'FCFB',
                homeTeam: '',
                awayTeam: '',
                tvChannel: 'ABC',
                gameType: 'Out of Conference',
            });
            setStartGameDialogOpen(false);
        } catch (err) {
            setError(`Failed to start game: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllAsChewMode = async () => {
        setChewAllDialogOpen(false);
        setLoading(true);
        setError(null);
        try {
            await markAllGamesAsChewMode();
            setSuccess('All ongoing games marked as chew mode!');
        } catch (err) {
            setError(`Failed to mark games as chew mode: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEndAllGames = async () => {
        if (filteredGames.length === 0) {
            setError('No games to end');
            return;
        }
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

    return (
        <AdminLayout title="Game Management">
            {error && (
                <Alert severity="error" sx={{ mb: '16px' }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: '16px' }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            {selectedStartSeason && selectedStartWeek && (
                <Panel header="Game week" sx={{ mb: '16px' }}>
                    <Box sx={{ p: '12px 16px' }}>
                        <Box sx={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <SelectPill
                                label="Season"
                                value={selectedStartSeason || ''}
                                onChange={(value) => {
                                    setSelectedStartSeason(Number(value));
                                    handleStartWeekSelectionChange(Number(value), selectedStartWeek);
                                }}
                                options={Array.from({ length: initSeason || 1 }, (_, i) => ({
                                    value: i + 1,
                                    label: `Season ${i + 1}`,
                                }))}
                                sx={pillHeightSx}
                            />
                            <SelectPill
                                label="Week"
                                value={selectedStartWeek || ''}
                                onChange={(value) => {
                                    setSelectedStartWeek(Number(value));
                                    handleStartWeekSelectionChange(selectedStartSeason, Number(value));
                                }}
                                options={Array.from({ length: initWeek || 18 }, (_, i) => ({
                                    value: i + 1,
                                    label: weekLabel(i + 1),
                                }))}
                                sx={pillHeightSx}
                            />
                            <Box
                                component="button"
                                type="button"
                                onClick={() => setConfirmDialogOpen(true)}
                                disabled={isStarting || (stats.notStarted === 0 && stats.total > 0)}
                                sx={{ ...primaryButtonSx, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                            >
                                {isStarting && <CircularProgress size={16} sx={{ color: '#fff' }} />}
                                {isStarting ? 'Starting...' : `Start week ${selectedStartWeek}`}
                            </Box>
                            {jobData &&
                                jobData.failedGames > 0 &&
                                (jobData.status === 'COMPLETED' || jobData.status === 'FAILED') && (
                                    <Box
                                        component="button"
                                        type="button"
                                        onClick={handleRetryFailed}
                                        disabled={isStarting}
                                        sx={{ ...secondaryButtonSx, color: 'var(--gold)' }}
                                    >
                                        Retry {jobData.failedGames} failed
                                    </Box>
                                )}
                            <Box sx={{ flex: 1 }} />
                            <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <Box
                                    component="span"
                                    sx={{ ...pillSx, background: 'var(--surface-2)', color: 'var(--text-muted)' }}
                                >
                                    {stats.total} games
                                </Box>
                                <Box
                                    component="span"
                                    sx={{ ...pillSx, background: 'var(--surface-2)', color: 'var(--field)' }}
                                >
                                    {stats.started} started
                                </Box>
                                <Box
                                    component="span"
                                    sx={{ ...pillSx, background: 'var(--surface-2)', color: 'var(--gold)' }}
                                >
                                    {stats.notStarted} waiting
                                </Box>
                            </Box>
                        </Box>

                        {jobData && jobData.logs && jobData.logs.length > 0 && (
                            <Box
                                sx={{
                                    mt: '14px',
                                    maxHeight: 200,
                                    overflow: 'auto',
                                    background: 'var(--brand-ink, #08151f)',
                                    border: '1px solid var(--line)',
                                    borderRadius: 'var(--r-sm)',
                                    p: '10px',
                                }}
                            >
                                {jobData.logs.slice(-10).map((log, idx) => (
                                    <Box
                                        key={idx}
                                        sx={{
                                            fontFamily: 'monospace',
                                            fontSize: '0.72rem',
                                            color: '#94a3b8',
                                            lineHeight: 1.6,
                                        }}
                                    >
                                        [{log.timestamp}] {log.homeTeam} vs {log.awayTeam}: {log.status} - {log.message}
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
                </Panel>
            )}

            <Panel
                header={`Games (${filteredGames.length})`}
                more={
                    <Box sx={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <Box
                            component="button"
                            type="button"
                            onClick={openStartGameDialog}
                            disabled={loading}
                            sx={compact(primaryButtonSx)}
                        >
                            + Start game
                        </Box>
                        <Box
                            component="button"
                            type="button"
                            onClick={() => openScrimmageDialog('Standard')}
                            disabled={loading}
                            sx={compact(secondaryButtonSx)}
                        >
                            Scrimmage
                        </Box>
                        <Box
                            component="button"
                            type="button"
                            onClick={() => openScrimmageDialog('Overtime')}
                            disabled={loading}
                            sx={compact(secondaryButtonSx)}
                        >
                            OT scrimmage
                        </Box>
                        <Box
                            component="button"
                            type="button"
                            onClick={refetchGames}
                            disabled={gamesLoading}
                            sx={compact(secondaryButtonSx)}
                        >
                            &#8635; Refresh
                        </Box>
                        <Box
                            component="button"
                            type="button"
                            onClick={() => setChewAllDialogOpen(true)}
                            disabled={loading}
                            sx={compact(secondaryButtonSx)}
                        >
                            Chew all
                        </Box>
                        <Box
                            component="button"
                            type="button"
                            onClick={handleEndAllGames}
                            disabled={loading}
                            sx={compact({ ...secondaryButtonSx, color: 'var(--live)' })}
                        >
                            End all
                        </Box>
                    </Box>
                }
            >
                <Box sx={{ p: '16px 16px 0', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <SelectPill
                        label="Season"
                        value={filters.season || ''}
                        onChange={(v) => handleFilterChange('season', v ? Number(v) : '')}
                        options={[
                            { value: '', label: 'All seasons' },
                            ...filterSeasons.map((s) => ({ value: s, label: `Season ${s}` })),
                        ]}
                        sx={pillHeightSx}
                    />
                    <SelectPill
                        label="Week"
                        value={filters.week || ''}
                        onChange={(v) => handleFilterChange('week', v ? Number(v) : '')}
                        options={[
                            { value: '', label: 'All weeks' },
                            ...Array.from({ length: initWeek || 18 }, (_, i) => ({
                                value: i + 1,
                                label: weekLabel(i + 1),
                            })),
                        ]}
                        sx={pillHeightSx}
                    />
                    <SelectPill
                        label="Type"
                        value={filters.gameType || 'ALL'}
                        onChange={(v) => handleFilterChange('gameType', v)}
                        options={[
                            { value: 'ALL', label: 'All types' },
                            ...GAME_TYPES.map((t) => ({ value: t, label: GAME_TYPE_DESCRIPTIONS[t] })),
                        ]}
                        sx={pillHeightSx}
                    />
                    <SelectPill
                        label="Status"
                        value={filters.gameStatus || 'ALL'}
                        onChange={(v) => handleFilterChange('gameStatus', v)}
                        options={[
                            { value: 'ALL', label: 'All statuses' },
                            ...GAME_STATUSES.map((s) => ({ value: s, label: GAME_STATUS_DESCRIPTIONS[s] })),
                        ]}
                        sx={pillHeightSx}
                    />
                </Box>

                <Box ref={fitRef}>
                    <GamesTable
                        games={filteredGames}
                        loading={gamesLoading}
                        currentPage={currentPage}
                        pageSize={pageSize}
                        totalGames={totalGames}
                        pageCount={pageCount}
                        onPageChange={handlePageChange}
                        onEditGame={(gameId) => setSearchParams({ edit: String(gameId) })}
                    />
                </Box>
            </Panel>

            {editing && <GameEditDialog gameId={editing} onClose={closeEditor} />}

            <ChewAllConfirmDialog
                open={chewAllDialogOpen}
                processing={loading}
                onCancel={() => setChewAllDialogOpen(false)}
                onConfirm={handleMarkAllAsChewMode}
            />

            <StartWeekConfirmDialog
                open={confirmDialogOpen}
                season={selectedStartSeason}
                week={selectedStartWeek}
                stats={stats}
                onCancel={() => setConfirmDialogOpen(false)}
                onConfirm={handleStartWeek}
            />

            <ScrimmageDialog
                open={scrimmageDialogOpen}
                availableTeams={availableTeams}
                scrimmageTeams={scrimmageTeams}
                onHomeTeamChange={(name) => setScrimmageTeams((prev) => ({ ...prev, homeTeam: name }))}
                onAwayTeamChange={(name) => setScrimmageTeams((prev) => ({ ...prev, awayTeam: name }))}
                onCancel={handleScrimmageCancel}
                onSubmit={handleScrimmageSubmit}
                loading={loading}
            />

            <StartGameDialog
                open={startGameDialogOpen}
                availableTeams={availableTeams}
                startGameData={startGameData}
                onFieldChange={(field, value) => setStartGameData((prev) => ({ ...prev, [field]: value }))}
                onCancel={handleStartGameCancel}
                onSubmit={handleStartGameSubmit}
                loading={loading}
            />
        </AdminLayout>
    );
};

export default GameManagement;
