import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Alert, Snackbar, CircularProgress } from '@mui/material';
import { Lock as LockIcon, LockOpen as LockOpenIcon, FactCheck as FactCheckIcon } from '@mui/icons-material';
import AdminLayout from '../../components/layout/AdminLayout';
import SegTabs from '../../components/ui/SegTabs';
import { getAllTeams } from '../../api/teamApi';
import { getAllVenues } from '../../api/venueApi';
import { useTeamsMap } from '../../hooks/useTeamsMap';
import { getCurrentSeasonOrUpcoming, getAllSeasons, lockSchedule, unlockSchedule } from '../../api/seasonApi';
import { useConferencesMap, activeConferenceList } from '../../hooks/useConferencesMap';
import { camelOrSnakeField } from '../../utils/fieldHelper';
import PostseasonAdminTab from '../../components/scheduling/PostseasonAdminTab';
import ConferenceScheduleAdminTab from '../../components/scheduling/ConferenceScheduleAdminTab';
import TeamScheduleAdminTab from '../../components/scheduling/TeamScheduleAdminTab';
import AddGameDialog from '../../components/scheduling/AddGameDialog';
import MoveGameDialog from '../../components/scheduling/MoveGameDialog';
import GenerateConferenceScheduleDialog from '../../components/scheduling/GenerateConferenceScheduleDialog';
import OocScheduleDialog from '../../components/scheduling/OocScheduleDialog';
import CreateSeasonDialog from '../../components/scheduling/CreateSeasonDialog';
import ValidateScheduleDialog from '../../components/scheduling/ValidateScheduleDialog';
import useAddGameDialog from '../../hooks/useAddGameDialog';
import useMoveGameDialog from '../../hooks/useMoveGameDialog';
import useSeasonCreationJob from '../../hooks/useSeasonCreationJob';
import useOocScheduleDialog from '../../hooks/useOocScheduleDialog';
import useValidateScheduleDialog from '../../hooks/useValidateScheduleDialog';
import useScheduleLock from '../../hooks/useScheduleLock';
import useAdminScheduleData from '../../hooks/useAdminScheduleData';
import useConferenceGeneration from '../../hooks/useConferenceGeneration';
import useConferenceRuleActions from '../../hooks/useConferenceRuleActions';
const EXCLUDED_ADMIN_CONFERENCES = ['FBS_INDEPENDENT'];

const selectSx = {
    border: '1px solid var(--line)',
    background: 'var(--surface)',
    color: 'var(--text)',
    borderRadius: 'var(--r-sm)',
    px: '10px',
    height: '38px',
    boxSizing: 'border-box',
    font: 'inherit',
    fontSize: '0.82rem',
    cursor: 'pointer',
    '& option': { background: 'var(--surface)', color: 'var(--text)' },
};
const ctrlSx = {
    border: '1px solid var(--line)',
    background: 'var(--surface-2)',
    color: 'var(--text-muted)',
    borderRadius: 'var(--r-sm)',
    px: '12px',
    height: '38px',
    boxSizing: 'border-box',
    font: 'inherit',
    fontSize: '0.78rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' },
};
const ctrlLockedSx = {
    ...ctrlSx,
    color: 'var(--live)',
    borderColor: 'color-mix(in srgb, var(--live) 40%, var(--line))',
};
const ctrlUnlockedSx = {
    ...ctrlSx,
    color: 'var(--field)',
    borderColor: 'color-mix(in srgb, var(--field) 40%, var(--line))',
};

const Scheduling = () => {
    useConferencesMap();
    const isMountedRef = useRef(true);
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const [searchParams, setSearchParams] = useSearchParams();
    const tab = searchParams.get('tab') || 'conference';
    const setTab = (nextTab) => {
        const next = new URLSearchParams(searchParams);
        next.set('tab', nextTab);
        setSearchParams(next, { replace: true });
    };
    const selectedConference = searchParams.get('conference') || 'ACC';
    const setSelectedConference = (conf) => {
        const next = new URLSearchParams(searchParams);
        next.set('conference', conf);
        setSearchParams(next, { replace: true });
    };

    const [season, setSeason] = useState(null);
    const [allSeasons, setAllSeasons] = useState([]);
    const { scheduleLocked, lockStatusKnown, lockError, setScheduleLocked } = useScheduleLock(season);
    const [allTeams, setAllTeams] = useState([]);
    const [venueNames, setVenueNames] = useState([]);
    const [loading, setLoading] = useState(true);

    const [conferenceTeams, setConferenceTeams] = useState([]);

    const [selectedTeamState, setSelectedTeamState] = useState(null);

    const selectedTeam = selectedTeamState;
    const {
        allSeasonSchedule,
        conferenceSchedule,
        confLoading: conferenceLoading,
        teamFullSchedule,
        teamLoading,
        postseasonSchedule,
        postseasonLoading,
        numConferenceGames,
        setNumConferenceGames,
        protectedRivalries,
        setProtectedRivalries,
        divisions,
        setDivisions,
        refreshAllSeasonSchedule,
        fetchConferenceSchedule,
        fetchTeamSchedule,
        fetchPostseasonSchedule,
    } = useAdminScheduleData({ season, selectedConference, selectedTeam, tab });

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const { generateDialogOpen, setGenerateDialogOpen, generationLoading, handleGenerateConferenceSchedule } =
        useConferenceGeneration({
            season,
            selectedConference,
            scheduleLocked,
            conferenceTeams,
            numConferenceGames,
            protectedRivalries,
            divisions,
            showSnackbar,
            fetchConferenceSchedule,
            refreshAllSeasonSchedule,
            isMountedRef,
        });
    const { addRivalry, removeRivalry, updateRivalry, toggleDivisions, updateDivision, handleSaveConferenceRules } =
        useConferenceRuleActions({
            selectedConference,
            numConferenceGames,
            protectedRivalries,
            setProtectedRivalries,
            divisions,
            setDivisions,
            showSnackbar,
        });

    const confLoading = conferenceLoading || generationLoading;

    const setSelectedTeam = (team) => {
        setSelectedTeamState(team);
        const next = new URLSearchParams(searchParams);
        if (team?.name) {
            next.set('team', team.name);
        } else {
            next.delete('team');
        }
        setSearchParams(next, { replace: true });
    };

    useEffect(() => {
        if (allTeams.length === 0 || selectedTeamState) {
            return;
        }
        const urlTeamName = searchParams.get('team');
        if (!urlTeamName) {
            return;
        }
        const found = allTeams.find((t) => t.name === urlTeamName);
        if (found) {
            setSelectedTeamState(found);
        }
    }, [allTeams]);

    const teamMap = useTeamsMap();

    useEffect(() => {
        let active = true;
        const init = async () => {
            try {
                setLoading(true);
                const [teamsData, currentSeason, seasonsData, venuesData] = await Promise.all([
                    getAllTeams(),
                    getCurrentSeasonOrUpcoming(),
                    getAllSeasons(),
                    getAllVenues().catch(() => []),
                ]);
                if (!active) {
                    return;
                }
                setAllTeams(teamsData);
                setVenueNames(venuesData.map((v) => v.name).filter(Boolean));
                const seasonNumbers = seasonsData.map((s) => s.season_number || s.seasonNumber);
                setAllSeasons(seasonNumbers);
                setSeason(currentSeason);
            } catch (err) {
                if (!active) {
                    return;
                }
                console.error('Error initializing scheduling page:', err);
                showSnackbar('Failed to load data', 'error');
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };
        init();
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (lockError) {
            setSnackbar({
                open: true,
                message: 'Unable to verify schedule lock. Editing is disabled. Reload to retry.',
                severity: 'error',
            });
        }
    }, [lockError]);

    const handleToggleLock = async () => {
        if (!lockStatusKnown) {
            return;
        }
        try {
            if (scheduleLocked) {
                await unlockSchedule(season);
                setScheduleLocked(false);
                showSnackbar(`Schedule for Season ${season} unlocked`);
            } else {
                await lockSchedule(season);
                setScheduleLocked(true);
                showSnackbar(`Schedule for Season ${season} locked`);
            }
        } catch (err) {
            console.error('Error toggling schedule lock:', err);
            showSnackbar('Failed to update schedule lock: ' + err.message, 'error');
        }
    };

    useEffect(() => {
        if (allTeams.length > 0 && selectedConference) {
            const filtered = allTeams
                .filter((t) => t.conference === selectedConference && t.active)
                .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            setConferenceTeams(filtered);
        }
    }, [allTeams, selectedConference]);

    const refreshAfterScheduleChange = () => {
        refreshAllSeasonSchedule();
        if (tab === 'conference') {
            fetchConferenceSchedule();
        } else if (tab === 'team' && selectedTeam) {
            fetchTeamSchedule();
        } else if (tab === 'postseason') {
            fetchPostseasonSchedule();
        }
    };

    const teamWeekOccupiedAll = useMemo(() => {
        const occupied = new Set();
        allSeasonSchedule.forEach((game) => {
            const home = camelOrSnakeField(game, 'homeTeam', 'home_team');
            const away = camelOrSnakeField(game, 'awayTeam', 'away_team');
            const week = game.week;
            if (home && week) {
                occupied.add(`${home}|${week}`);
            }
            if (away && week) {
                occupied.add(`${away}|${week}`);
            }
        });
        return occupied;
    }, [allSeasonSchedule]);

    const isConferenceScheduleComplete = useMemo(() => {
        if (conferenceTeams.length === 0) {
            return false;
        }
        const gameCounts = {};
        conferenceSchedule.forEach((game) => {
            const home = camelOrSnakeField(game, 'homeTeam', 'home_team');
            const away = camelOrSnakeField(game, 'awayTeam', 'away_team');
            if (home) {
                gameCounts[home] = (gameCounts[home] || 0) + 1;
            }
            if (away) {
                gameCounts[away] = (gameCounts[away] || 0) + 1;
            }
        });
        return conferenceTeams.every((t) => (gameCounts[t.name] || 0) >= numConferenceGames);
    }, [conferenceTeams, conferenceSchedule, numConferenceGames]);

    const hasGamesPlayed = useMemo(() => {
        return allSeasonSchedule.some((game) => {
            const started = camelOrSnakeField(game, 'started', 'started');
            const finished = camelOrSnakeField(game, 'finished', 'finished');
            return started || finished;
        });
    }, [allSeasonSchedule]);

    const adminConferences = useMemo(() => {
        return activeConferenceList().filter((c) => !EXCLUDED_ADMIN_CONFERENCES.includes(c.code));
    }, []);

    const handleSeasonCreated = async (num) => {
        const seasonsData = await getAllSeasons();
        if (!isMountedRef.current) {
            return;
        }
        const seasonNumbers = seasonsData.map((s) => s.season_number || s.seasonNumber);
        setAllSeasons(seasonNumbers);
        setSeason(num);
    };

    const handleOocGenerated = async () => {
        await refreshAllSeasonSchedule();
        if (selectedTeam && tab === 'team') {
            fetchTeamSchedule();
        }
    };

    const addGameDialog = useAddGameDialog({
        scheduleLocked,
        season,
        teamMap,
        onSuccess: refreshAfterScheduleChange,
        showSnackbar,
    });

    const moveDialog = useMoveGameDialog({
        scheduleLocked,
        teamWeekOccupiedAll,
        onSuccess: refreshAfterScheduleChange,
        showSnackbar,
    });

    const seasonCreationJob = useSeasonCreationJob({
        isMountedRef,
        onSeasonCreated: handleSeasonCreated,
        showSnackbar,
    });

    const oocDialog = useOocScheduleDialog({
        scheduleLocked,
        season,
        onSuccess: handleOocGenerated,
        showSnackbar,
    });

    const validateDialog = useValidateScheduleDialog({ season, showSnackbar });

    const handleEmptyCellClick = (teamName, weekNum) => {
        if (teamWeekOccupiedAll.has(`${teamName}|${weekNum}`)) {
            showSnackbar(`${teamName} already has a game scheduled in Week ${weekNum}`, 'warning');
            return;
        }
        addGameDialog.openForCell(
            teamName,
            weekNum,
            isConferenceScheduleComplete ? 'OUT_OF_CONFERENCE' : 'CONFERENCE_GAME'
        );
    };

    if (loading) {
        return (
            <AdminLayout title="Scheduling">
                <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress size={48} />
                </Box>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout
            title="Scheduling"
            controls={
                <>
                    <Box
                        component="select"
                        value={season || ''}
                        onChange={(e) => setSeason(Number(e.target.value))}
                        sx={selectSx}
                    >
                        {allSeasons.map((s) => (
                            <option key={s} value={s}>
                                Season {s}
                            </option>
                        ))}
                    </Box>
                    <Box
                        component="button"
                        type="button"
                        onClick={() => {
                            const maxSeason = allSeasons.length > 0 ? Math.max(...allSeasons) : 0;
                            seasonCreationJob.openDialog(maxSeason + 1);
                        }}
                        sx={ctrlSx}
                    >
                        + New season
                    </Box>
                    <Box
                        component="button"
                        type="button"
                        onClick={handleToggleLock}
                        disabled={!lockStatusKnown}
                        title={
                            scheduleLocked
                                ? 'Schedule is locked (click to unlock)'
                                : 'Schedule is unlocked (click to lock)'
                        }
                        sx={{
                            ...(scheduleLocked ? ctrlLockedSx : ctrlUnlockedSx),
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                    >
                        {scheduleLocked ? <LockIcon sx={{ fontSize: 15 }} /> : <LockOpenIcon sx={{ fontSize: 15 }} />}
                        {scheduleLocked ? 'Locked' : 'Unlocked'}
                    </Box>
                    <Box
                        component="button"
                        type="button"
                        disabled={scheduleLocked}
                        onClick={oocDialog.openDialog}
                        sx={{
                            ...ctrlSx,
                            opacity: scheduleLocked ? 0.6 : 1,
                            cursor: scheduleLocked ? 'default' : 'pointer',
                        }}
                    >
                        Auto-generate OOC schedule
                    </Box>
                    <Box
                        component="button"
                        type="button"
                        onClick={validateDialog.handleValidateSchedule}
                        sx={{ ...ctrlSx, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                        <FactCheckIcon sx={{ fontSize: 15 }} />
                        Validate schedule
                    </Box>
                </>
            }
        >
            <Box sx={{ color: 'var(--text-muted)', fontSize: '0.85rem', mb: '16px' }}>
                Season {season}: manage conference, team, and postseason schedules
            </Box>

            {scheduleLocked && (
                <Alert severity="warning" sx={{ mb: '16px' }}>
                    The schedule for Season {season} is locked. Unlock it to make changes. Postseason entries are exempt
                    from schedule lock.
                </Alert>
            )}

            <Box sx={{ mb: '16px' }}>
                <SegTabs
                    value={tab}
                    onChange={setTab}
                    options={[
                        { value: 'conference', label: 'Conference Schedule' },
                        { value: 'team', label: 'Team' },
                        { value: 'postseason', label: 'Postseason' },
                    ]}
                />
            </Box>

            {tab === 'conference' && (
                <ConferenceScheduleAdminTab
                    selectedConference={selectedConference}
                    onConferenceChange={setSelectedConference}
                    adminConferences={adminConferences}
                    conferenceSchedule={conferenceSchedule}
                    conferenceTeams={conferenceTeams}
                    confLoading={confLoading}
                    scheduleLocked={scheduleLocked}
                    teamMap={teamMap}
                    allSeasonSchedule={allSeasonSchedule}
                    teamWeekOccupiedAll={teamWeekOccupiedAll}
                    onAddGameManually={() =>
                        addGameDialog.openManually(
                            isConferenceScheduleComplete ? 'OUT_OF_CONFERENCE' : 'CONFERENCE_GAME'
                        )
                    }
                    onGenerateSchedule={() => setGenerateDialogOpen(true)}
                    onEmptyCellClick={handleEmptyCellClick}
                    onFilledCellClick={(cell, weekNum) => moveDialog.openForCell(cell, weekNum)}
                    onGameDrop={moveDialog.handleGameDrop}
                    numConferenceGames={numConferenceGames}
                    onNumConferenceGamesChange={setNumConferenceGames}
                    protectedRivalries={protectedRivalries}
                    onAddRivalry={addRivalry}
                    onRemoveRivalry={removeRivalry}
                    onUpdateRivalry={updateRivalry}
                    divisions={divisions}
                    onToggleDivisions={toggleDivisions}
                    onUpdateDivision={updateDivision}
                    hasGamesPlayed={hasGamesPlayed}
                    onSaveConferenceRules={handleSaveConferenceRules}
                />
            )}

            {tab === 'team' && (
                <TeamScheduleAdminTab
                    allTeams={allTeams}
                    selectedTeam={selectedTeam}
                    onTeamChange={setSelectedTeam}
                    teamFullSchedule={teamFullSchedule}
                    teamLoading={teamLoading}
                    scheduleLocked={scheduleLocked}
                    teamMap={teamMap}
                    onAddGameForTeam={() => addGameDialog.openForTeam(selectedTeam)}
                    onAddGameForTeamWeek={(weekNum) => addGameDialog.openForTeam(selectedTeam, weekNum)}
                    onMoveGame={(game) => moveDialog.openForGame(game)}
                    onDeleteGame={moveDialog.handleDeleteGame}
                />
            )}

            {tab === 'postseason' && (
                <PostseasonAdminTab
                    season={season}
                    postseasonSchedule={postseasonSchedule}
                    postseasonLoading={postseasonLoading}
                    allTeams={allTeams}
                    teamMap={teamMap}
                    venueNames={venueNames}
                    onRefresh={fetchPostseasonSchedule}
                    onShowSnackbar={showSnackbar}
                    onOpenAddGameDialog={(gameType, week) => addGameDialog.openForPostseason(gameType, week)}
                />
            )}

            <AddGameDialog
                open={addGameDialog.addGameDialogOpen}
                onClose={() => addGameDialog.setAddGameDialogOpen(false)}
                dialog={addGameDialog}
                allTeams={allTeams}
                teamMap={teamMap}
                teamWeekOccupiedAll={teamWeekOccupiedAll}
                venueNames={venueNames}
            />

            <MoveGameDialog
                open={moveDialog.moveDialogOpen}
                onClose={() => moveDialog.setMoveDialogOpen(false)}
                moveGameData={moveDialog.moveGameData}
                moveToWeek={moveDialog.moveToWeek}
                onWeekChange={moveDialog.setMoveToWeek}
                teamWeekOccupiedAll={teamWeekOccupiedAll}
                onDelete={moveDialog.handleDeleteFromMoveDialog}
                onMove={moveDialog.handleMoveGame}
                editNeutralSite={moveDialog.editNeutralSite}
                onEditNeutralSiteChange={moveDialog.setEditNeutralSite}
                editVenue={moveDialog.editVenue}
                onEditVenueChange={moveDialog.setEditVenue}
                savingEdits={moveDialog.savingEdits}
                onSaveEdits={moveDialog.handleSaveEdits}
                scheduleLocked={scheduleLocked}
            />

            <GenerateConferenceScheduleDialog
                open={generateDialogOpen}
                onClose={() => setGenerateDialogOpen(false)}
                selectedConference={selectedConference}
                season={season}
                conferenceTeams={conferenceTeams}
                numConferenceGames={numConferenceGames}
                protectedRivalries={protectedRivalries}
                confLoading={confLoading}
                onGenerate={handleGenerateConferenceSchedule}
            />

            <OocScheduleDialog
                open={oocDialog.oocDialogOpen}
                onClose={() => oocDialog.setOocDialogOpen(false)}
                season={season}
                oocLoading={oocDialog.oocLoading}
                oocResult={oocDialog.oocResult}
                onGenerate={oocDialog.handleGenerateOocSchedule}
            />

            <CreateSeasonDialog
                open={seasonCreationJob.createSeasonDialogOpen}
                onClose={() => seasonCreationJob.setCreateSeasonDialogOpen(false)}
                newSeasonNumber={seasonCreationJob.newSeasonNumber}
                onNewSeasonNumberChange={seasonCreationJob.setNewSeasonNumber}
                creatingSeasonLoading={seasonCreationJob.creatingSeasonLoading}
                createSeasonProgress={seasonCreationJob.createSeasonProgress}
                onSubmit={seasonCreationJob.handleCreateSeason}
            />

            <ValidateScheduleDialog
                open={validateDialog.validateDialogOpen}
                onClose={() => validateDialog.setValidateDialogOpen(false)}
                season={season}
                validating={validateDialog.validating}
                validationResult={validateDialog.validationResult}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </AdminLayout>
    );
};

export default Scheduling;
