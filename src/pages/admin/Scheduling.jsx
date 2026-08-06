import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Box,
    TextField,
    Autocomplete,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Snackbar,
    CircularProgress,
} from '@mui/material';
import { CloudUpload as UploadIcon, Lock as LockIcon, LockOpen as LockOpenIcon, FactCheck as FactCheckIcon } from '@mui/icons-material';
import AdminLayout from '../../components/layout/AdminLayout';
import SegTabs from '../../components/ui/SegTabs';
import TeamMark from '../../components/ui/TeamMark';
import { getAllTeams } from '../../api/teamApi';
import { isRealTeam } from '../../utils/teamDataUtils';
import { useTeamsMap } from '../../hooks/useTeamsMap';
import {
    getScheduleBySeasonAndTeam,
    getScheduleBySeason,
    getConferenceSchedule,
    getPostseasonSchedule,
    createScheduleEntry,
    deleteScheduleEntry,
    moveGame,
    generateConferenceSchedule,
    generateAllConferenceSchedules,
    generateOutOfConferenceSchedule,
    pollScheduleGenJobStatus,
    saveConferenceRules,
    getConferenceRules,
    validateSchedule,
} from '../../api/scheduleApi';
import { getCurrentSeasonOrLatest, getAllSeasons, isScheduleLocked, lockSchedule, unlockSchedule, createSeasonForScheduling } from '../../api/seasonApi';
import { uploadPostseasonLogo } from '../../api/uploadApi';
import { useConferencesMap, activeConferenceList } from '../../components/constants/conferences';
import { formatGameType, formatConference } from '../../utils/formatText';
import { field } from '../../utils/fieldHelper';
import PostseasonAdminTab from '../../components/scheduling/PostseasonAdminTab';
import ConferenceScheduleAdminTab from '../../components/scheduling/ConferenceScheduleAdminTab';
import TeamScheduleAdminTab from '../../components/scheduling/TeamScheduleAdminTab';

const TOTAL_WEEKS = 12;
const DEFAULT_CONFERENCE_GAMES = 9;

const EXCLUDED_ADMIN_CONFERENCES = ['FBS_INDEPENDENT'];

const selectSx = { border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.82rem', cursor: 'pointer', '& option': { background: 'var(--surface)', color: 'var(--text)' } };
const ctrlSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '12px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' } };
const ctrlLockedSx = { ...ctrlSx, color: 'var(--live)', borderColor: 'color-mix(in srgb, var(--live) 40%, var(--line))' };
const ctrlUnlockedSx = { ...ctrlSx, color: 'var(--field)', borderColor: 'color-mix(in srgb, var(--field) 40%, var(--line))' };
const labelSx = { display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: 'var(--text-dim)', mb: '5px' };
const inputSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.82rem', width: '100%' };
const btnPrimarySx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '16px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', '&:disabled': { opacity: 0.6, cursor: 'default' } };
const dialogPaperSx = { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)' };
const dialogTitleSx = { color: 'var(--text)', fontWeight: 800, fontSize: '1.05rem' };
const autocompleteSx = { '& .MuiOutlinedInput-root': { borderRadius: 'var(--r-sm)' } };
const errorTextSx = { mt: '4px', fontSize: '0.7rem', color: 'var(--live)' };
const hintTextSx = { fontSize: '0.72rem', color: 'var(--text-dim)' };

const Scheduling = () => {
    useConferencesMap();
    const isMountedRef = useRef(true);
    useEffect(() => {
        return () => { isMountedRef.current = false; };
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
    const [scheduleLocked, setScheduleLocked] = useState(false);
    const [allTeams, setAllTeams] = useState([]);
    const [loading, setLoading] = useState(true);

    const [allSeasonSchedule, setAllSeasonSchedule] = useState([]);

    const [conferenceSchedule, setConferenceSchedule] = useState([]);
    const [conferenceTeams, setConferenceTeams] = useState([]);
    const [confLoading, setConfLoading] = useState(false);

    const [numConferenceGames, setNumConferenceGames] = useState(DEFAULT_CONFERENCE_GAMES);
    const [protectedRivalries, setProtectedRivalries] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
    const [oocDialogOpen, setOocDialogOpen] = useState(false);
    const [oocLoading, setOocLoading] = useState(false);
    const [oocResult, setOocResult] = useState(null);
    const [validateDialogOpen, setValidateDialogOpen] = useState(false);
    const [validating, setValidating] = useState(false);
    const [validationResult, setValidationResult] = useState(null);
    const [selectedTeamState, setSelectedTeamState] = useState(null);
    const [teamFullSchedule, setTeamFullSchedule] = useState([]);
    const [teamLoading, setTeamLoading] = useState(false);

    const selectedTeam = selectedTeamState;
    const setSelectedTeam = (team) => {
        setSelectedTeamState(team);
        const next = new URLSearchParams(searchParams);
        if (team?.name) next.set('team', team.name); else next.delete('team');
        setSearchParams(next, { replace: true });
    };

    useEffect(() => {
        if (allTeams.length === 0 || selectedTeamState) return;
        const urlTeamName = searchParams.get('team');
        if (!urlTeamName) return;
        const found = allTeams.find((t) => t.name === urlTeamName);
        if (found) setSelectedTeamState(found);
    }, [allTeams]);

    const [postseasonSchedule, setPostseasonSchedule] = useState([]);
    const [postseasonLoading, setPostseasonLoading] = useState(false);

    const [addGameDialogOpen, setAddGameDialogOpen] = useState(false);
    const [addGameWeek, setAddGameWeek] = useState(1);
    const [addGameHome, setAddGameHome] = useState(null);
    const [addGameAway, setAddGameAway] = useState(null);
    const [addGameAnchorTeam, setAddGameAnchorTeam] = useState(null);
    const [addGameType, setAddGameType] = useState('CONFERENCE_GAME');
    const [addGameSubdivision, setAddGameSubdivision] = useState('FCFB');
    const [addGamePlayoffRound, setAddGamePlayoffRound] = useState(null);
    const [addGameHomeSeed, setAddGameHomeSeed] = useState(null);
    const [addGameAwaySeed, setAddGameAwaySeed] = useState(null);
    const [addGameBowlName, setAddGameBowlName] = useState('');
    const [addGameLogo, setAddGameLogo] = useState(null);
    const [addGameLogoPreview, setAddGameLogoPreview] = useState(null);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    const [moveDialogOpen, setMoveDialogOpen] = useState(false);
    const [moveGameData, setMoveGameData] = useState(null);
    const [moveToWeek, setMoveToWeek] = useState(1);

    const [createSeasonDialogOpen, setCreateSeasonDialogOpen] = useState(false);
    const [newSeasonNumber, setNewSeasonNumber] = useState('');

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const teamMap = useTeamsMap();

    useEffect(() => {
        if (addGameDialogOpen) {
            if (addGameType === 'BOWL') {
                setAddGameWeek(14);
                setAddGameSubdivision('FCFB');
                setAddGameBowlName('');
            } else if (addGameType === 'PLAYOFFS' || addGameType === 'NATIONAL_CHAMPIONSHIP') {
                if (addGamePlayoffRound) {
                    setAddGameWeek(13 + addGamePlayoffRound);
                }
                setAddGameSubdivision('FCFB');
            }
        }
    }, [addGameDialogOpen, addGameType, addGamePlayoffRound]);

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                const [teamsData, currentSeason, seasonsData] = await Promise.all([
                    getAllTeams(),
                    getCurrentSeasonOrLatest(),
                    getAllSeasons()
                ]);
                setAllTeams(teamsData);
                const seasonNumbers = seasonsData.map(s => s.season_number || s.seasonNumber);
                setAllSeasons(seasonNumbers);
                setSeason(currentSeason);
            } catch (err) {
                console.error('Error initializing scheduling page:', err);
                showSnackbar('Failed to load data', 'error');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    useEffect(() => {
        const checkLock = async () => {
            if (!season) return;
            try {
                const locked = await isScheduleLocked(season);
                setScheduleLocked(locked);
            } catch (err) {
                console.error('Error checking schedule lock:', err);
                setScheduleLocked(false);
            }
        };
        checkLock();
    }, [season]);

    const handleToggleLock = async () => {
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
            const filtered = allTeams.filter(
                t => t.conference === selectedConference && t.active
            ).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            setConferenceTeams(filtered);
        }
    }, [allTeams, selectedConference]);

    useEffect(() => {
        if (season) {
            const fetchAll = async () => {
                try {
                    const schedule = await getScheduleBySeason(season);
                    setAllSeasonSchedule(schedule || []);
                } catch (err) {
                    console.error('Error fetching full season schedule:', err);
                    setAllSeasonSchedule([]);
                }
            };
            fetchAll();
        }
    }, [season]);

    useEffect(() => {
        if (season && selectedConference && tab === 'conference') {
            fetchConferenceSchedule();
            loadConferenceRules();
        }
    }, [season, selectedConference, tab]);

    const loadConferenceRules = async () => {
        if (!selectedConference) return;
        try {
            const rules = await getConferenceRules(selectedConference);
            if (rules) {
                setNumConferenceGames(rules.numConferenceGames || DEFAULT_CONFERENCE_GAMES);
                setProtectedRivalries(rules.protectedRivalries || []);
                setDivisions(rules.divisions || []);
            } else {
                setNumConferenceGames(DEFAULT_CONFERENCE_GAMES);
                setProtectedRivalries([]);
                setDivisions([]);
            }
        } catch (err) {
            console.error('Error loading conference rules:', err);
            setNumConferenceGames(DEFAULT_CONFERENCE_GAMES);
            setProtectedRivalries([]);
            setDivisions([]);
        }
    };

    useEffect(() => {
        if (season && selectedTeam && tab === 'team') {
            fetchTeamSchedule();
        }
    }, [season, selectedTeam, tab]);

    useEffect(() => {
        if (season && tab === 'postseason') {
            fetchPostseasonSchedule();
        }
    }, [season, tab]);

    const refreshAllSeasonSchedule = async () => {
        try {
            const schedule = await getScheduleBySeason(season);
            setAllSeasonSchedule(schedule || []);
        } catch (err) {
            console.error('Error refreshing full season schedule:', err);
        }
    };

    const fetchConferenceSchedule = async () => {
        try {
            setConfLoading(true);
            const schedule = await getConferenceSchedule(season, selectedConference);
            setConferenceSchedule(schedule || []);
        } catch (err) {
            console.error('Error fetching conference schedule:', err);
            setConferenceSchedule([]);
        } finally {
            setConfLoading(false);
        }
    };

    const fetchTeamSchedule = async () => {
        try {
            setTeamLoading(true);
            const schedule = await getScheduleBySeasonAndTeam(season, selectedTeam.name);
            setTeamFullSchedule((schedule || []).sort((a, b) => (a.week || 0) - (b.week || 0)));
        } catch (err) {
            console.error('Error fetching schedule:', err);
            setTeamFullSchedule([]);
        } finally {
            setTeamLoading(false);
        }
    };

    const fetchPostseasonSchedule = async () => {
        try {
            setPostseasonLoading(true);
            const schedule = await getPostseasonSchedule(season);
            setPostseasonSchedule(schedule || []);
        } catch (err) {
            console.error('Error fetching postseason schedule:', err);
            setPostseasonSchedule([]);
        } finally {
            setPostseasonLoading(false);
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleEmptyCellClick = (teamName, weekNum) => {
        if (teamWeekOccupiedAll.has(`${teamName}|${weekNum}`)) {
            showSnackbar(`${teamName} already has a game scheduled in Week ${weekNum}`, 'warning');
            return;
        }
        setAddGameType('CONFERENCE_GAME');
        setAddGameWeek(weekNum);
        setAddGameHome(teamMap[teamName] || { name: teamName });
        setAddGameAway(null);
        setAddGameAnchorTeam(teamName);
        setAddGameDialogOpen(true);
    };

    const handleAddGameHomeChange = (team) => {
        setAddGameHome(team);
        if (addGameAnchorTeam && team?.name !== addGameAnchorTeam && addGameAway?.name !== addGameAnchorTeam) {
            setAddGameAway(teamMap[addGameAnchorTeam] || { name: addGameAnchorTeam });
        }
    };

    const handleAddGameAwayChange = (team) => {
        setAddGameAway(team);
        if (addGameAnchorTeam && team?.name !== addGameAnchorTeam && addGameHome?.name !== addGameAnchorTeam) {
            setAddGameHome(teamMap[addGameAnchorTeam] || { name: addGameAnchorTeam });
        }
    };

    const handleAddGame = async () => {
        if (!addGameHome || !addGameAway) {
            showSnackbar('Please fill in all fields', 'error');
            return;
        }

        let finalWeek = addGameWeek;
        let finalSubdivision = addGameSubdivision;
        let finalGameType = addGameType;

        if (addGameType === 'BOWL') {
            if (!addGameBowlName || addGameBowlName.trim() === '') {
                showSnackbar('Bowl game name is required', 'error');
                return;
            }
            finalWeek = 14;
            finalSubdivision = 'FCFB';
            finalGameType = 'BOWL';
        } else if (addGameType === 'PLAYOFFS' || addGameType === 'NATIONAL_CHAMPIONSHIP') {
            if (!addGamePlayoffRound) {
                showSnackbar('Please enter a playoff round', 'error');
                return;
            }
            finalWeek = 13 + addGamePlayoffRound;
            finalSubdivision = 'FCFB';
        }

        if (!finalWeek) {
            showSnackbar('Please fill in all fields', 'error');
            return;
        }

        try {
            await createScheduleEntry({
                season,
                week: finalWeek,
                subdivision: finalSubdivision,
                homeTeam: addGameHome.name || addGameHome,
                awayTeam: addGameAway.name || addGameAway,
                gameType: finalGameType,
                playoffRound: addGamePlayoffRound,
                playoffHomeSeed: addGameHomeSeed,
                playoffAwaySeed: addGameAwaySeed,
                postseasonGameName: addGameType === 'BOWL' ? addGameBowlName : null,
                postseasonGameLogo: (addGameType === 'BOWL' || addGameType === 'PLAYOFFS' || addGameType === 'CONFERENCE_CHAMPIONSHIP' || addGameType === 'NATIONAL_CHAMPIONSHIP') ? addGameLogo : null,
            });
            showSnackbar('Game added successfully');
            setAddGameDialogOpen(false);
            setAddGameHome(null);
            setAddGameAway(null);
            setAddGamePlayoffRound(null);
            setAddGameHomeSeed(null);
            setAddGameAwaySeed(null);
            setAddGameBowlName('');
            setAddGameLogo(null);
            setAddGameLogoPreview(null);
            refreshAllSeasonSchedule();
            if (tab === 'conference') fetchConferenceSchedule();
            else if (tab === 'team' && selectedTeam) fetchTeamSchedule();
            else if (tab === 'postseason') fetchPostseasonSchedule();
        } catch (err) {
            console.error('Error adding game:', err);
            showSnackbar('Failed to add game: ' + err.message, 'error');
        }
    };

    const handleDeleteGame = async (gameId) => {
        try {
            await deleteScheduleEntry(gameId);
            showSnackbar('Game removed successfully');
            refreshAllSeasonSchedule();
            if (tab === 'conference') fetchConferenceSchedule();
            else if (tab === 'team' && selectedTeam) fetchTeamSchedule();
            else if (tab === 'postseason') fetchPostseasonSchedule();
        } catch (err) {
            console.error('Error deleting game:', err);
            showSnackbar('Failed to remove game: ' + err.message, 'error');
        }
    };

    const moveGameToWeek = async (gameData, targetWeek) => {
        if (!gameData || !targetWeek) return;
        const home = field(gameData, 'homeTeam', 'home_team') || gameData.opponent;
        const away = field(gameData, 'awayTeam', 'away_team') || '';
        const homeOccupied = home && teamWeekOccupiedAll.has(`${home}|${targetWeek}`);
        const awayOccupied = away && teamWeekOccupiedAll.has(`${away}|${targetWeek}`);
        if ((homeOccupied || awayOccupied) && targetWeek !== gameData.week) {
            showSnackbar(`Cannot move: a team already has a game scheduled in Week ${targetWeek}`, 'warning');
            return;
        }
        try {
            await moveGame(gameData.id, targetWeek);
            showSnackbar(`Game moved to Week ${targetWeek}`);
            refreshAllSeasonSchedule();
            if (tab === 'conference') fetchConferenceSchedule();
            else if (tab === 'team' && selectedTeam) fetchTeamSchedule();
            else if (tab === 'postseason') fetchPostseasonSchedule();
        } catch (err) {
            console.error('Error moving game:', err);
            showSnackbar('Failed to move game: ' + err.message, 'error');
        }
    };

    const handleMoveGame = async () => {
        if (!moveGameData || !moveToWeek) return;
        await moveGameToWeek(moveGameData, moveToWeek);
        setMoveDialogOpen(false);
        setMoveGameData(null);
    };

    const handleGameDrop = (gameData, targetWeek) => {
        moveGameToWeek(gameData, targetWeek);
    };

    const handleGenerateConferenceSchedule = async () => {
        const incompleteRivalries = protectedRivalries.filter(r => (r.team1 && !r.team2) || (!r.team1 && r.team2));
        if (incompleteRivalries.length > 0) {
            showSnackbar('All protected rivalries must have both teams set before generating', 'error');
            return;
        }

        try {
            setConfLoading(true);
            const request = {
                season,
                conference: selectedConference,
                subdivision: conferenceTeams[0]?.subdivision || 'FBS',
                numConferenceGames,
                protectedRivalries: protectedRivalries.filter(r => r.team1 && r.team2),
                startWeek: 1,
                divisions: divisions.filter(Boolean),
            };
            await generateConferenceSchedule(request);
            showSnackbar('Conference schedule generated successfully!');
            setGenerateDialogOpen(false);
            await fetchConferenceSchedule();
            refreshAllSeasonSchedule();
        } catch (err) {
            console.error('Error generating schedule:', err);
            showSnackbar('Failed to generate schedule: ' + err.message, 'error');
        } finally {
            setConfLoading(false);
        }
    };

    const handleGenerateOocSchedule = async () => {
        try {
            setOocLoading(true);
            const result = await generateOutOfConferenceSchedule(season);
            setOocResult(result);
            if (result.unmatchedSlots?.length > 0) {
                showSnackbar(`Scheduled ${result.gamesScheduled} OOC games, ${result.unmatchedSlots.length} slots left open`, 'warning');
            } else {
                showSnackbar(`Scheduled ${result.gamesScheduled} OOC games. Every team's schedule is full!`);
            }
            await refreshAllSeasonSchedule();
            if (selectedTeam && tab === 'team') fetchTeamSchedule();
        } catch (err) {
            console.error('Error generating OOC schedule:', err);
            showSnackbar('Failed to generate OOC schedule: ' + err.message, 'error');
        } finally {
            setOocLoading(false);
        }
    };

    const handleValidateSchedule = async () => {
        setValidateDialogOpen(true);
        setValidating(true);
        setValidationResult(null);
        try {
            const result = await validateSchedule(season);
            setValidationResult(result);
        } catch (err) {
            console.error('Error validating schedule:', err);
            showSnackbar('Failed to validate schedule: ' + err.message, 'error');
            setValidateDialogOpen(false);
        } finally {
            setValidating(false);
        }
    };

    const [creatingSeasonLoading, setCreatingSeasonLoading] = useState(false);
    const [createSeasonProgress, setCreateSeasonProgress] = useState('');
    const handleCreateSeason = async () => {
        const num = parseInt(newSeasonNumber);
        if (!num || num <= 0) {
            showSnackbar('Please enter a valid season number', 'error');
            return;
        }
        setCreatingSeasonLoading(true);
        setCreateSeasonProgress('Creating season…');
        try {
            await createSeasonForScheduling(num);
            if (!isMountedRef.current) return;
            setCreateSeasonProgress('Season created. Starting conference schedule generation…');

            try {
                const jobResponse = await generateAllConferenceSchedules(num);
                const jobId = jobResponse.jobId;

                let done = false;
                while (!done && isMountedRef.current) {
                    await new Promise(r => setTimeout(r, 2000));
                    if (!isMountedRef.current) break;
                    try {
                        const status = await pollScheduleGenJobStatus(jobId);
                        if (!isMountedRef.current) break;
                        const completed = status.completedConferences || 0;
                        const total = status.totalConferences || 0;
                        const failed = status.failedConferences || 0;
                        const games = status.totalGamesGenerated || 0;
                        setCreateSeasonProgress(
                            `Generating: ${completed}/${total} conferences done, ${games} games created${failed > 0 ? `, ${failed} failed` : ''}…`
                        );

                        if (status.status === 'COMPLETED' || status.status === 'FAILED') {
                            done = true;
                            if (failed > 0) {
                                const failedConfs = (status.logs || [])
                                    .filter(l => l.status === 'FAILED')
                                    .map(l => l.conference);
                                showSnackbar(
                                    `Generated ${games} conference games. Failed for: ${failedConfs.join(', ')}. You can regenerate those individually.`,
                                    'warning'
                                );
                            } else {
                                showSnackbar(`Season ${num} created with ${games} conference games auto-generated!`, 'success');
                            }
                        }
                    } catch (pollErr) {
                        console.error('Error polling generation status:', pollErr);
                        done = true;
                        if (isMountedRef.current) {
                            showSnackbar(`Season ${num} created, but lost track of generation progress. Check the conference tab.`, 'warning');
                        }
                    }
                }
            } catch (genErr) {
                console.error('Error starting conference schedule generation:', genErr);
                if (isMountedRef.current) {
                    showSnackbar(`Season ${num} created, but auto-generation failed: ${genErr.message}. You can generate schedules manually.`, 'warning');
                }
            }

            if (!isMountedRef.current) return;
            setCreateSeasonDialogOpen(false);
            setNewSeasonNumber('');
            const seasonsData = await getAllSeasons();
            if (!isMountedRef.current) return;
            const seasonNumbers = seasonsData.map(s => s.season_number || s.seasonNumber);
            setAllSeasons(seasonNumbers);
            setSeason(num);
        } catch (err) {
            console.error('Error creating season:', err);
            if (isMountedRef.current) {
                showSnackbar('Failed to create season: ' + err.message, 'error');
            }
        } finally {
            if (isMountedRef.current) {
                setCreatingSeasonLoading(false);
                setCreateSeasonProgress('');
            }
        }
    };

    const addRivalry = () => {
        setProtectedRivalries([...protectedRivalries, { team1: '', team2: '', week: null }]);
    };

    const removeRivalry = async (index) => {
        const rivalry = protectedRivalries[index];
        const updated = protectedRivalries.filter((_, i) => i !== index);

        if (!rivalry.team1 && !rivalry.team2) {
            setProtectedRivalries(updated);
            return;
        }

        try {
            await saveConferenceRules(selectedConference, numConferenceGames, updated);
            setProtectedRivalries(updated);
            showSnackbar('Rivalry removed');
        } catch (err) {
            console.error('Error removing rivalry:', err);
            showSnackbar('Failed to remove rivalry: ' + err.message, 'error');
        }
    };

    const updateRivalry = (index, fieldName, value) => {
        const updated = [...protectedRivalries];
        updated[index] = { ...updated[index], [fieldName]: value };
        setProtectedRivalries(updated);
    };

    const toggleDivisions = async (enabled) => {
        const updated = enabled ? ['', ''] : [];

        if (!enabled && divisions.some(Boolean)) {
            try {
                await saveConferenceRules(selectedConference, numConferenceGames, protectedRivalries, updated);
                setDivisions(updated);
                showSnackbar('Divisions disabled');
            } catch (err) {
                console.error('Error disabling divisions:', err);
                showSnackbar('Failed to disable divisions: ' + err.message, 'error');
            }
            return;
        }

        setDivisions(updated);
    };

    const updateDivision = (index, value) => {
        const updated = [...divisions];
        updated[index] = value;
        setDivisions(updated);
    };

    const handleSaveConferenceRules = async (conference, numGames, rivalries, divisionList) => {
        try {
            await saveConferenceRules(conference, numGames, rivalries, divisionList);
            showSnackbar(`Conference rules saved for ${formatConference(conference)}`);
        } catch (err) {
            console.error('Error saving conference rules:', err);
            showSnackbar('Failed to save conference rules: ' + err.message, 'error');
        }
    };

    const teamWeekOccupiedAll = useMemo(() => {
        const occupied = new Set();
        allSeasonSchedule.forEach(game => {
            const home = field(game, 'homeTeam', 'home_team');
            const away = field(game, 'awayTeam', 'away_team');
            const week = game.week;
            if (home && week) occupied.add(`${home}|${week}`);
            if (away && week) occupied.add(`${away}|${week}`);
        });
        return occupied;
    }, [allSeasonSchedule]);

    const hasGamesPlayed = useMemo(() => {
        return allSeasonSchedule.some(game => {
            const started = field(game, 'started', 'started');
            const finished = field(game, 'finished', 'finished');
            return started || finished;
        });
    }, [allSeasonSchedule]);

    const adminConferences = useMemo(() => {
        return activeConferenceList().filter(c => !EXCLUDED_ADMIN_CONFERENCES.includes(c.code));
    }, []);

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
            controls={(
                <>
                    <Box component="select" value={season || ''} onChange={(e) => setSeason(Number(e.target.value))} sx={selectSx}>
                        {allSeasons.map((s) => <option key={s} value={s}>Season {s}</option>)}
                    </Box>
                    <Box component="button" type="button" onClick={() => {
                        const maxSeason = allSeasons.length > 0 ? Math.max(...allSeasons) : 0;
                        setNewSeasonNumber(String(maxSeason + 1));
                        setCreateSeasonDialogOpen(true);
                    }} sx={ctrlSx}>
                        + New season
                    </Box>
                    <Box component="button" type="button" onClick={handleToggleLock} title={scheduleLocked ? 'Schedule is locked (click to unlock)' : 'Schedule is unlocked (click to lock)'} sx={{ ...(scheduleLocked ? ctrlLockedSx : ctrlUnlockedSx), display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {scheduleLocked ? <LockIcon sx={{ fontSize: 15 }} /> : <LockOpenIcon sx={{ fontSize: 15 }} />}
                        {scheduleLocked ? 'Locked' : 'Unlocked'}
                    </Box>
                    <Box component="button" type="button" disabled={scheduleLocked} onClick={() => { setOocResult(null); setOocDialogOpen(true); }} sx={{ ...ctrlSx, opacity: scheduleLocked ? 0.6 : 1, cursor: scheduleLocked ? 'default' : 'pointer' }}>
                        Auto-generate OOC schedule
                    </Box>
                    <Box component="button" type="button" onClick={handleValidateSchedule} sx={{ ...ctrlSx, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <FactCheckIcon sx={{ fontSize: 15 }} />
                        Validate schedule
                    </Box>
                </>
            )}
        >
            <Box sx={{ color: 'var(--text-muted)', fontSize: '0.85rem', mb: '16px' }}>
                Season {season}: manage conference, team, and postseason schedules
            </Box>

            {scheduleLocked && (
                <Alert severity="warning" sx={{ mb: '16px' }}>
                    The schedule for Season {season} is locked. Unlock it to make changes. Postseason entries are exempt from schedule lock.
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
                    onAddGameManually={() => {
                        setAddGameType('CONFERENCE_GAME');
                        setAddGameAnchorTeam(null);
                        setAddGameDialogOpen(true);
                    }}
                    onGenerateSchedule={() => setGenerateDialogOpen(true)}
                    onEmptyCellClick={handleEmptyCellClick}
                    onFilledCellClick={(cell, weekNum) => {
                        setMoveGameData(cell);
                        setMoveToWeek(weekNum);
                        setMoveDialogOpen(true);
                    }}
                    onGameDrop={handleGameDrop}
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
                    onAddGameForTeam={() => {
                        setAddGameType('CONFERENCE_GAME');
                        setAddGameHome(selectedTeam);
                        setAddGameAway(null);
                        setAddGameAnchorTeam(selectedTeam?.name || null);
                        setAddGameDialogOpen(true);
                    }}
                    onAddGameForTeamWeek={(weekNum) => {
                        setAddGameType('CONFERENCE_GAME');
                        setAddGameHome(selectedTeam);
                        setAddGameAway(null);
                        setAddGameWeek(weekNum);
                        setAddGameAnchorTeam(selectedTeam?.name || null);
                        setAddGameDialogOpen(true);
                    }}
                    onMoveGame={(game) => {
                        setMoveGameData(game);
                        setMoveToWeek(game.week);
                        setMoveDialogOpen(true);
                    }}
                    onDeleteGame={handleDeleteGame}
                />
            )}

            {tab === 'postseason' && (
                <PostseasonAdminTab
                    season={season}
                    postseasonSchedule={postseasonSchedule}
                    postseasonLoading={postseasonLoading}
                    allTeams={allTeams}
                    teamMap={teamMap}
                    onRefresh={fetchPostseasonSchedule}
                    onShowSnackbar={showSnackbar}
                    onOpenAddGameDialog={(gameType, week) => {
                        setAddGameType(gameType);
                        setAddGameAnchorTeam(null);
                        if (gameType === 'BOWL') {
                            setAddGameWeek(14);
                            setAddGameSubdivision('FCFB');
                        } else if (gameType === 'PLAYOFFS' || gameType === 'NATIONAL_CHAMPIONSHIP') {
                            setAddGameSubdivision('FCFB');
                            if (week) setAddGameWeek(week);
                        } else {
                            if (week) setAddGameWeek(week);
                        }
                        setAddGameDialogOpen(true);
                    }}
                />
            )}

            <Dialog open={addGameDialogOpen} onClose={() => setAddGameDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: dialogPaperSx }}>
                <DialogTitle sx={dialogTitleSx}>Add {formatGameType(addGameType)}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', mt: '6px' }}>
                        {addGameType !== 'BOWL' && addGameType !== 'PLAYOFFS' && addGameType !== 'CONFERENCE_CHAMPIONSHIP' && addGameType !== 'NATIONAL_CHAMPIONSHIP' && (
                            <Box>
                                <Box component="label" sx={labelSx}>Week</Box>
                                <Box component="select" value={addGameWeek} onChange={(e) => setAddGameWeek(Number(e.target.value))} sx={{ ...selectSx, width: '100%' }}>
                                    {Array.from({ length: 20 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>Week {i + 1}</option>
                                    ))}
                                </Box>
                            </Box>
                        )}
                        {addGameType === 'BOWL' && (
                            <Alert severity="info" sx={{ py: 0.5 }}>
                                Bowl games are always scheduled for Week 14
                            </Alert>
                        )}

                        <Autocomplete
                            options={allTeams.filter(t => {
                                if (!t.active || !isRealTeam(t)) return false;
                                if (addGameWeek && addGameWeek <= TOTAL_WEEKS) {
                                    return !teamWeekOccupiedAll.has(`${t.name}|${addGameWeek}`);
                                }
                                return true;
                            })}
                            getOptionLabel={(option) => option.name || ''}
                            value={addGameHome}
                            onChange={(_, v) => handleAddGameHomeChange(v)}
                            sx={autocompleteSx}
                            renderInput={(params) => (
                                <TextField {...params} label="Home Team" size="small" />
                            )}
                            renderOption={(props, option) => {
                                const { key, ...otherProps } = props;
                                return (
                                    <Box component="li" key={key} {...otherProps} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <TeamMark team={teamMap[option.name] || { name: option.name, abbreviation: option.abbreviation }} size={20} />
                                        <Box component="span" sx={{ fontSize: '0.85rem' }}>{option.name}</Box>
                                    </Box>
                                );
                            }}
                            isOptionEqualToValue={(option, value) => option.name === value?.name}
                        />

                        <Autocomplete
                            options={(() => {
                                let opts;
                                if (addGameType === 'OUT_OF_CONFERENCE') {
                                    opts = allTeams.filter(t => t.active && isRealTeam(t) && t.conference !== addGameHome?.conference);
                                } else if (addGameType === 'CONFERENCE_GAME') {
                                    opts = allTeams.filter(t => t.active && isRealTeam(t) && t.conference === addGameHome?.conference && t.name !== addGameHome?.name);
                                } else {
                                    opts = allTeams.filter(t => t.active && isRealTeam(t));
                                }
                                if (addGameWeek && addGameWeek <= TOTAL_WEEKS) {
                                    opts = opts.filter(t => !teamWeekOccupiedAll.has(`${t.name}|${addGameWeek}`));
                                }
                                return opts;
                            })()}
                            getOptionLabel={(option) => option.name || ''}
                            value={addGameAway}
                            onChange={(_, v) => handleAddGameAwayChange(v)}
                            sx={autocompleteSx}
                            renderInput={(params) => (
                                <TextField {...params} label="Away Team" size="small" />
                            )}
                            renderOption={(props, option) => {
                                const { key, ...otherProps } = props;
                                return (
                                    <Box component="li" key={key} {...otherProps} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <TeamMark team={teamMap[option.name] || { name: option.name, abbreviation: option.abbreviation }} size={20} />
                                        <Box component="span" sx={{ fontSize: '0.85rem' }}>{option.name}</Box>
                                    </Box>
                                );
                            }}
                            isOptionEqualToValue={(option, value) => option.name === value?.name}
                        />

                        {addGameType === 'BOWL' && (
                            <Box>
                                <Box component="label" sx={labelSx}>Bowl game name</Box>
                                <Box
                                    component="input"
                                    value={addGameBowlName}
                                    onChange={(e) => setAddGameBowlName(e.target.value)}
                                    placeholder="e.g., Rose Bowl, Sugar Bowl, etc."
                                    sx={{ ...inputSx, borderColor: (!addGameBowlName || addGameBowlName.trim() === '') ? 'var(--live)' : 'var(--line)' }}
                                />
                                {(!addGameBowlName || addGameBowlName.trim() === '') && <Box sx={errorTextSx}>Bowl game name is required</Box>}
                            </Box>
                        )}

                        {addGameType === 'BOWL' && (
                            <Box>
                                <Box component="label" sx={labelSx}>Bowl game logo URL</Box>
                                <Box
                                    component="input"
                                    value={addGameLogo || ''}
                                    onChange={(e) => {
                                        setAddGameLogo(e.target.value);
                                        setAddGameLogoPreview(e.target.value);
                                    }}
                                    placeholder="https://example.com/bowl-logo.png"
                                    sx={inputSx}
                                />
                                <Box sx={{ ...hintTextSx, mt: '4px' }}>Paste a direct link to the bowl game logo (PNG recommended)</Box>
                                {addGameLogoPreview && (
                                    <Box sx={{ mt: '12px', display: 'flex', justifyContent: 'center' }}>
                                        <Avatar
                                            src={addGameLogoPreview}
                                            sx={{ width: 100, height: 100 }}
                                            variant="rounded"
                                        />
                                    </Box>
                                )}
                            </Box>
                        )}
                        {(addGameType === 'PLAYOFFS' || addGameType === 'CONFERENCE_CHAMPIONSHIP' || addGameType === 'NATIONAL_CHAMPIONSHIP') && (
                            <Box>
                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="logo-upload-button"
                                    type="file"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setUploadingLogo(true);
                                            try {
                                                const result = await uploadPostseasonLogo(file);
                                                setAddGameLogo(result.url);
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setAddGameLogoPreview(reader.result);
                                                };
                                                reader.readAsDataURL(file);
                                            } catch (err) {
                                                showSnackbar('Failed to upload logo: ' + err.message, 'error');
                                            } finally {
                                                setUploadingLogo(false);
                                            }
                                        }
                                    }}
                                />
                                <Box component="label" htmlFor="logo-upload-button" sx={{ ...ctrlSx, width: '100%', justifyContent: 'center', gap: '8px', opacity: uploadingLogo ? 0.6 : 1, pointerEvents: uploadingLogo ? 'none' : 'auto' }}>
                                    {uploadingLogo ? <CircularProgress size={14} /> : <UploadIcon sx={{ fontSize: 16 }} />}
                                    {uploadingLogo ? 'Uploading...' : addGameLogo ? 'Change Logo' : 'Upload Postseason Game Logo'}
                                </Box>
                                {addGameLogoPreview && (
                                    <Box sx={{ mt: '12px', display: 'flex', justifyContent: 'center' }}>
                                        <Avatar
                                            src={addGameLogoPreview}
                                            sx={{ width: 100, height: 100 }}
                                            variant="rounded"
                                        />
                                    </Box>
                                )}
                                {addGameLogo && !addGameLogoPreview && (
                                    <Alert severity="info" sx={{ mt: '8px' }}>
                                        Logo uploaded: {addGameLogo}
                                    </Alert>
                                )}
                            </Box>
                        )}

                        {addGameType !== 'BOWL' && (
                            <Box>
                                <Box component="label" sx={labelSx}>Game type</Box>
                                <Box component="select" value={addGameType} onChange={(e) => setAddGameType(e.target.value)} sx={{ ...selectSx, width: '100%' }}>
                                    <option value="CONFERENCE_GAME">Conference Game</option>
                                    <option value="OUT_OF_CONFERENCE">Out of Conference</option>
                                    <option value="CONFERENCE_CHAMPIONSHIP">Conference Championship</option>
                                    <option value="BOWL">Bowl</option>
                                    <option value="PLAYOFFS">Playoffs</option>
                                    <option value="NATIONAL_CHAMPIONSHIP">National Championship</option>
                                </Box>
                            </Box>
                        )}

                        {(addGameType === 'PLAYOFFS' || addGameType === 'NATIONAL_CHAMPIONSHIP') && (
                            <>
                                <Box>
                                    <Box component="label" sx={labelSx}>Playoff round</Box>
                                    <Box
                                        component="select"
                                        value={addGamePlayoffRound || ''}
                                        onChange={(e) => {
                                            const round = e.target.value ? parseInt(e.target.value) : null;
                                            setAddGamePlayoffRound(round);
                                            if (round) {
                                                const calculatedWeek = 13 + round;
                                                setAddGameWeek(calculatedWeek);
                                            }
                                        }}
                                        sx={{ ...selectSx, width: '100%' }}
                                    >
                                        <option value="">Select round...</option>
                                        <option value={1}>1 - First Round (Week 14)</option>
                                        <option value={2}>2 - Second Round (Week 15)</option>
                                        <option value={3}>3 - Quarterfinals (Week 16)</option>
                                        <option value={4}>4 - Semifinals (Week 17)</option>
                                        <option value={5}>5 - National Championship (Week 18)</option>
                                    </Box>
                                </Box>
                                {addGamePlayoffRound && (
                                    <Alert severity="info" sx={{ py: 0.5 }}>
                                        Week {13 + addGamePlayoffRound} (calculated from round {addGamePlayoffRound})
                                    </Alert>
                                )}
                                <Box sx={{ display: 'flex', gap: '14px' }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Box component="label" sx={labelSx}>Home seed</Box>
                                        <Box component="input" type="number" value={addGameHomeSeed || ''} onChange={(e) => setAddGameHomeSeed(parseInt(e.target.value) || null)} sx={inputSx} />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Box component="label" sx={labelSx}>Away seed</Box>
                                        <Box component="input" type="number" value={addGameAwaySeed || ''} onChange={(e) => setAddGameAwaySeed(parseInt(e.target.value) || null)} sx={inputSx} />
                                    </Box>
                                </Box>
                            </>
                        )}

                        {addGameType !== 'BOWL' && addGameType !== 'PLAYOFFS' && addGameType !== 'CONFERENCE_CHAMPIONSHIP' && addGameType !== 'NATIONAL_CHAMPIONSHIP' && (
                            <Box>
                                <Box component="label" sx={labelSx}>Subdivision</Box>
                                <Box component="select" value={addGameSubdivision} onChange={(e) => setAddGameSubdivision(e.target.value)} sx={{ ...selectSx, width: '100%' }}>
                                    <option value="FBS">FBS</option>
                                    <option value="FCS">FCS</option>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: '20px', pb: '18px' }}>
                    <Box component="button" type="button" onClick={() => setAddGameDialogOpen(false)} sx={ctrlSx}>Cancel</Box>
                    <Box component="button" type="button" onClick={handleAddGame} sx={btnPrimarySx}>Add Game</Box>
                </DialogActions>
            </Dialog>

            <Dialog open={moveDialogOpen} onClose={() => setMoveDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: dialogPaperSx }}>
                <DialogTitle sx={dialogTitleSx}>Move or Remove Game</DialogTitle>
                <DialogContent>
                    {moveGameData && (() => {
                        const home = field(moveGameData, 'homeTeam', 'home_team') || moveGameData.opponent;
                        const away = field(moveGameData, 'awayTeam', 'away_team') || '';
                        return (
                            <Box sx={{ mt: '6px' }}>
                                <Box sx={{ mb: '14px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    {home} vs {away || moveGameData.opponent} (Week {moveGameData.week})
                                </Box>
                                <Box>
                                    <Box component="label" sx={labelSx}>Move to week</Box>
                                    <Box component="select" value={moveToWeek} onChange={(e) => setMoveToWeek(Number(e.target.value))} sx={{ ...selectSx, width: '100%' }}>
                                        {Array.from({ length: 12 }, (_, i) => {
                                            const weekNum = i + 1;
                                            const home = field(moveGameData, 'homeTeam', 'home_team') || moveGameData.opponent;
                                            const away = field(moveGameData, 'awayTeam', 'away_team') || '';
                                            const homeOccupied = teamWeekOccupiedAll.has(`${home}|${weekNum}`);
                                            const awayOccupied = away && teamWeekOccupiedAll.has(`${away}|${weekNum}`);
                                            const isOccupied = homeOccupied || awayOccupied;
                                            const isCurrentWeek = weekNum === moveGameData.week;
                                            if (isOccupied && !isCurrentWeek) {
                                                return null;
                                            }
                                            return (
                                                <option key={weekNum} value={weekNum}>Week {weekNum}</option>
                                            );
                                        })}
                                    </Box>
                                </Box>
                            </Box>
                        );
                    })()}
                </DialogContent>
                <DialogActions sx={{ px: '20px', pb: '18px' }}>
                    {moveGameData && (
                        <Box
                            component="button" type="button"
                            onClick={() => {
                                if (moveGameData?.id) {
                                    handleDeleteGame(moveGameData.id);
                                    setMoveDialogOpen(false);
                                    setMoveGameData(null);
                                }
                            }}
                            sx={{ ...ctrlSx, color: 'var(--live)', mr: 'auto' }}
                        >
                            Delete Game
                        </Box>
                    )}
                    <Box component="button" type="button" onClick={() => setMoveDialogOpen(false)} sx={ctrlSx}>Cancel</Box>
                    <Box component="button" type="button" onClick={handleMoveGame} sx={btnPrimarySx}>Move</Box>
                </DialogActions>
            </Dialog>

            <Dialog open={generateDialogOpen} onClose={() => setGenerateDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: dialogPaperSx }}>
                <DialogTitle sx={dialogTitleSx}>Auto-Generate {formatConference(selectedConference)} Conference Schedule</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', mt: '6px' }}>
                        <Alert severity="warning">
                            This will replace all existing conference games for {formatConference(selectedConference)} in Season {season}.
                        </Alert>

                        <Alert severity="info">
                            {conferenceTeams.length} teams in conference.
                            {conferenceTeams.length <= numConferenceGames + 1
                                ? ` With ${conferenceTeams.length} teams, this will be a round robin where each team plays every other team once.`
                                : ` With more than ${numConferenceGames + 1} teams, protected rivalries determine guaranteed matchups. Remaining games are randomized.`
                            }
                        </Alert>

                        <Box sx={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                            Using {numConferenceGames} conference games per team with {protectedRivalries.filter(r => r.team1 && r.team2).length} protected rivalries.
                            Adjust these in the Conference Rules section above.
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: '20px', pb: '18px' }}>
                    <Box component="button" type="button" onClick={() => setGenerateDialogOpen(false)} sx={ctrlSx}>Cancel</Box>
                    <Box component="button" type="button" onClick={handleGenerateConferenceSchedule} disabled={confLoading} sx={btnPrimarySx}>
                        {confLoading ? 'Generating...' : 'Generate Schedule'}
                    </Box>
                </DialogActions>
            </Dialog>

            <Dialog open={oocDialogOpen} onClose={() => !oocLoading && setOocDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: dialogPaperSx }}>
                <DialogTitle sx={dialogTitleSx}>Auto-Generate Out-of-Conference Schedule</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', mt: '6px' }}>
                        {!oocResult ? (
                            <>
                                <Alert severity="info">
                                    Fills every active team&apos;s remaining open weeks (1-12) in Season {season} with random,
                                    cross-conference opponents. Existing games are never touched or overwritten.
                                </Alert>
                                <Box sx={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                                    If a team can&apos;t be matched for a given week (no valid opponent left), that slot is
                                    reported back so you can fill it manually.
                                </Box>
                            </>
                        ) : (
                            <>
                                <Alert severity={oocResult.unmatchedSlots?.length > 0 ? 'warning' : 'success'}>
                                    Scheduled {oocResult.gamesScheduled} OOC games.
                                    {oocResult.unmatchedSlots?.length > 0
                                        ? ` ${oocResult.unmatchedSlots.length} slot(s) couldn't be matched.`
                                        : ' Every team’s schedule is full.'}
                                </Alert>
                                {oocResult.unmatchedSlots?.length > 0 && (
                                    <Box sx={{ maxHeight: 240, overflowY: 'auto', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)' }}>
                                        {oocResult.unmatchedSlots.map((slot, i) => (
                                            <Box key={`${slot.team}-${slot.week}-${i}`} sx={{ display: 'flex', justifyContent: 'space-between', px: '12px', py: '8px', fontSize: '0.82rem', borderBottom: '1px solid var(--line-soft)', '&:last-of-type': { borderBottom: 0 } }}>
                                                <Box>{slot.team}</Box>
                                                <Box sx={{ color: 'var(--text-dim)' }}>Week {slot.week}</Box>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: '20px', pb: '18px' }}>
                    <Box component="button" type="button" onClick={() => setOocDialogOpen(false)} disabled={oocLoading} sx={ctrlSx}>
                        {oocResult ? 'Close' : 'Cancel'}
                    </Box>
                    {!oocResult && (
                        <Box component="button" type="button" onClick={handleGenerateOocSchedule} disabled={oocLoading} sx={btnPrimarySx}>
                            {oocLoading ? 'Generating...' : 'Generate OOC Schedule'}
                        </Box>
                    )}
                </DialogActions>
            </Dialog>

            <Dialog open={createSeasonDialogOpen} onClose={() => !creatingSeasonLoading && setCreateSeasonDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: dialogPaperSx }}>
                <DialogTitle sx={dialogTitleSx}>Create New Season for Scheduling</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: '6px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <Box>
                            <Box component="label" sx={labelSx}>Season number</Box>
                            <Box component="input" type="number" value={newSeasonNumber} onChange={(e) => setNewSeasonNumber(e.target.value)} disabled={creatingSeasonLoading} sx={inputSx} />
                        </Box>
                        <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
                            This will create the season and auto-generate conference schedules for all conferences
                            (9 conference games per team, no protected rivalries). OOC weeks will be left blank.
                            You can modify everything afterwards.
                        </Alert>
                        {creatingSeasonLoading && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <CircularProgress size={18} />
                                <Box sx={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                                    {createSeasonProgress || 'Creating season & generating schedules…'}
                                </Box>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: '20px', pb: '18px' }}>
                    <Box component="button" type="button" onClick={() => setCreateSeasonDialogOpen(false)} disabled={creatingSeasonLoading} sx={ctrlSx}>Cancel</Box>
                    <Box component="button" type="button" onClick={handleCreateSeason} disabled={creatingSeasonLoading} sx={btnPrimarySx}>
                        {creatingSeasonLoading ? 'Creating…' : 'Create Season'}
                    </Box>
                </DialogActions>
            </Dialog>

            <Dialog open={validateDialogOpen} onClose={() => setValidateDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: dialogPaperSx }}>
                <DialogTitle sx={dialogTitleSx}>Validate Season {season} Schedule</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', mt: '6px' }}>
                        {validating ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <CircularProgress size={18} />
                                <Box sx={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Checking every active team&apos;s schedule…</Box>
                            </Box>
                        ) : validationResult && (
                            validationResult.valid ? (
                                <Alert severity="success">
                                    Every active team has a game scheduled in every week (1-12). This season&apos;s schedule is ready to start.
                                </Alert>
                            ) : (
                                <>
                                    <Alert severity="warning">
                                        {validationResult.incompleteTeams.length} team{validationResult.incompleteTeams.length > 1 ? 's are' : ' is'} missing games. The schedule must be complete before starting the season.
                                    </Alert>
                                    <Box sx={{ maxHeight: 320, overflowY: 'auto', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)' }}>
                                        {validationResult.incompleteTeams.map((gap) => (
                                            <Box key={gap.team} sx={{ display: 'flex', justifyContent: 'space-between', gap: '12px', px: '12px', py: '8px', fontSize: '0.82rem', borderBottom: '1px solid var(--line-soft)', '&:last-of-type': { borderBottom: 0 } }}>
                                                <Box component="b">{gap.team}</Box>
                                                <Box sx={{ color: 'var(--live)' }}>Missing week{gap.missingWeeks.length > 1 ? 's' : ''} {gap.missingWeeks.join(', ')}</Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </>
                            )
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: '20px', pb: '18px' }}>
                    <Box component="button" type="button" onClick={() => setValidateDialogOpen(false)} sx={ctrlSx}>Close</Box>
                </DialogActions>
            </Dialog>

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
