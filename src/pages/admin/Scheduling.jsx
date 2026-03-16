import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Autocomplete,
    Avatar,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Snackbar,
    CircularProgress,
    Tabs,
    Tab,
    Tooltip,
} from '@mui/material';
import {
    Add as AddIcon,
    AutoFixHigh as GenerateIcon,
    Lock as LockIcon,
    LockOpen as LockOpenIcon,
    CloudUpload as UploadIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { getAllTeams } from '../../api/teamApi';
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
    pollScheduleGenJobStatus,
    saveConferenceRules,
    getConferenceRules,
} from '../../api/scheduleApi';
import { getCurrentSeason, getAllSeasons, isScheduleLocked, lockSchedule, unlockSchedule, createSeasonForScheduling } from '../../api/seasonApi';
import { uploadPostseasonLogo } from '../../api/uploadApi';
import { conferences } from '../../components/constants/conferences';
import { formatGameType, formatConference } from '../../utils/formatText';
import { adminNavigationItems } from '../../config/adminNavigation';
import PostseasonAdminTab from '../../components/scheduling/PostseasonAdminTab';
import ConferenceScheduleAdminTab from '../../components/scheduling/ConferenceScheduleAdminTab';
import OOCScheduleAdminTab from '../../components/scheduling/OOCScheduleAdminTab';

const TOTAL_WEEKS = 12;
const DEFAULT_CONFERENCE_GAMES = 9;

// Conferences that should NOT appear in the admin Conference Schedule tab
const EXCLUDED_ADMIN_CONFERENCES = ['FBS_INDEPENDENT'];

// Helper to safely read schedule fields
const field = (game, camel, snake) => game[camel] !== undefined ? game[camel] : game[snake];

const Scheduling = () => {
    const navigate = useNavigate();
    const [season, setSeason] = useState(null);
    const [allSeasons, setAllSeasons] = useState([]);
    const [scheduleLocked, setScheduleLocked] = useState(false);
    const [allTeams, setAllTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tabIndex, setTabIndex] = useState(0);

    // Full season schedule (for occupancy checks)
    const [allSeasonSchedule, setAllSeasonSchedule] = useState([]);

    // Conference scheduling state
    const [selectedConference, setSelectedConference] = useState('ACC');
    const [conferenceSchedule, setConferenceSchedule] = useState([]);
    const [conferenceTeams, setConferenceTeams] = useState([]);
    const [confLoading, setConfLoading] = useState(false);

    // Conference generation rules
    const [numConferenceGames, setNumConferenceGames] = useState(DEFAULT_CONFERENCE_GAMES);
    const [protectedRivalries, setProtectedRivalries] = useState([]);
    const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
    // OOC scheduling state
    const [selectedOOCTeam, setSelectedOOCTeam] = useState(null);
    const [oocFullSchedule, setOocFullSchedule] = useState([]);
    const [oocLoading, setOocLoading] = useState(false);

    // Postseason state
    const [postseasonSchedule, setPostseasonSchedule] = useState([]);
    const [postseasonLoading, setPostseasonLoading] = useState(false);

    // Cell click dialog state (for clicking empty cells in conference grid)
    const [cellDialogOpen, setCellDialogOpen] = useState(false);
    const [cellDialogTeam, setCellDialogTeam] = useState(null);
    const [cellDialogWeek, setCellDialogWeek] = useState(null);
    const [cellDialogOpponent, setCellDialogOpponent] = useState(null);
    const [cellDialogIsHome, setCellDialogIsHome] = useState(true);

    // Add game dialog state (for manual add / OOC / postseason)
    const [addGameDialogOpen, setAddGameDialogOpen] = useState(false);
    const [addGameWeek, setAddGameWeek] = useState(1);
    const [addGameHome, setAddGameHome] = useState(null);
    const [addGameAway, setAddGameAway] = useState(null);
    const [addGameType, setAddGameType] = useState('CONFERENCE_GAME');
    const [addGameSubdivision, setAddGameSubdivision] = useState('FCFB');
    const [addGamePlayoffRound, setAddGamePlayoffRound] = useState(null);
    const [addGameHomeSeed, setAddGameHomeSeed] = useState(null);
    const [addGameAwaySeed, setAddGameAwaySeed] = useState(null);
    const [addGameBowlName, setAddGameBowlName] = useState('');
    const [addGameLogo, setAddGameLogo] = useState(null);
    const [addGameLogoPreview, setAddGameLogoPreview] = useState(null);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    // Move game dialog state
    const [moveDialogOpen, setMoveDialogOpen] = useState(false);
    const [moveGameData, setMoveGameData] = useState(null);
    const [moveToWeek, setMoveToWeek] = useState(1);

    // Create season dialog
    const [createSeasonDialogOpen, setCreateSeasonDialogOpen] = useState(false);
    const [newSeasonNumber, setNewSeasonNumber] = useState('');

    // (Playoff bracket and advance team state managed in PostseasonAdminTab)

    // Notifications
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Build team map for logos
    const teamMap = useMemo(() => {
        const map = {};
        allTeams.forEach(team => {
            if (team.name) map[team.name] = team;
        });
        return map;
    }, [allTeams]);

    // Set defaults when dialog opens for BOWL or PLAYOFFS
    useEffect(() => {
        if (addGameDialogOpen) {
            if (addGameType === 'BOWL') {
                setAddGameWeek(14);
                setAddGameSubdivision('FCFB');
                setAddGameBowlName(''); // Reset bowl name when opening dialog
            } else if (addGameType === 'PLAYOFFS' || addGameType === 'NATIONAL_CHAMPIONSHIP') {
                if (addGamePlayoffRound) {
                    setAddGameWeek(13 + addGamePlayoffRound);
                }
                setAddGameSubdivision('FCFB');
            }
        }
    }, [addGameDialogOpen, addGameType, addGamePlayoffRound]);

    // Initialize
    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                const [teamsData, currentSeason, seasonsData] = await Promise.all([
                    getAllTeams(),
                    getCurrentSeason(),
                    getAllSeasons()
                ]);
                setAllTeams(teamsData);
                const seasonNumbers = seasonsData.map(s => s.season_number || s.seasonNumber);
                setAllSeasons(seasonNumbers);
                // Default to current season
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

    // Check schedule lock when season changes
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

    // Handle toggling schedule lock
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

    // Filter teams by selected conference
    useEffect(() => {
        if (allTeams.length > 0 && selectedConference) {
            const filtered = allTeams.filter(
                t => t.conference === selectedConference && t.active
            ).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            setConferenceTeams(filtered);
        }
    }, [allTeams, selectedConference]);

    // Fetch full season schedule for occupancy checking (once per season)
    useEffect(() => {
        if (season) {
            const fetchAll = async () => {
                try {
                    const data = await getScheduleBySeason(season);
                    setAllSeasonSchedule(data || []);
                } catch (err) {
                    console.error('Error fetching full season schedule:', err);
                    setAllSeasonSchedule([]);
                }
            };
            fetchAll();
        }
    }, [season]);

    // Fetch conference schedule when conference or season changes
    useEffect(() => {
        if (season && selectedConference && tabIndex === 0) {
            fetchConferenceSchedule();
            loadConferenceRules();
        }
    }, [season, selectedConference, tabIndex]);

    // Load conference rules when conference changes
    const loadConferenceRules = async () => {
        if (!selectedConference) return;
        try {
            const rules = await getConferenceRules(selectedConference);
            if (rules) {
                setNumConferenceGames(rules.numConferenceGames || DEFAULT_CONFERENCE_GAMES);
                setProtectedRivalries(rules.protectedRivalries || []);
            } else {
                // No saved rules, use defaults
                setNumConferenceGames(DEFAULT_CONFERENCE_GAMES);
                setProtectedRivalries([]);
            }
        } catch (err) {
            console.error('Error loading conference rules:', err);
            // On error, use defaults
            setNumConferenceGames(DEFAULT_CONFERENCE_GAMES);
            setProtectedRivalries([]);
        }
    };

    // Fetch OOC schedule (full schedule) when team changes
    useEffect(() => {
        if (season && selectedOOCTeam && tabIndex === 1) {
            fetchOOCSchedule();
        }
    }, [season, selectedOOCTeam, tabIndex]);

    // Fetch postseason schedule
    useEffect(() => {
        if (season && tabIndex === 2) {
            fetchPostseasonSchedule();
        }
    }, [season, tabIndex]);

    // Refresh the full season schedule for occupancy map
    const refreshAllSeasonSchedule = async () => {
        try {
            const data = await getScheduleBySeason(season);
            setAllSeasonSchedule(data || []);
        } catch (err) {
            console.error('Error refreshing full season schedule:', err);
        }
    };

    const fetchConferenceSchedule = async () => {
        try {
            setConfLoading(true);
            const data = await getConferenceSchedule(season, selectedConference);
            setConferenceSchedule(data || []);
        } catch (err) {
            console.error('Error fetching conference schedule:', err);
            setConferenceSchedule([]);
        } finally {
            setConfLoading(false);
        }
    };

    const fetchOOCSchedule = async () => {
        try {
            setOocLoading(true);
            const data = await getScheduleBySeasonAndTeam(season, selectedOOCTeam.name);
            setOocFullSchedule((data || []).sort((a, b) => (a.week || 0) - (b.week || 0)));
        } catch (err) {
            console.error('Error fetching schedule:', err);
            setOocFullSchedule([]);
        } finally {
            setOocLoading(false);
        }
    };

    const fetchPostseasonSchedule = async () => {
        try {
            setPostseasonLoading(true);
            const data = await getPostseasonSchedule(season);
            setPostseasonSchedule(data || []);
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

    // Handle clicking an empty cell in the conference grid
    const handleEmptyCellClick = (teamName, weekNum) => {
        // Check if the team already has a game that week (e.g. OOC game)
        if (teamWeekOccupiedAll.has(`${teamName}|${weekNum}`)) {
            showSnackbar(`${teamName} already has a game scheduled in Week ${weekNum}`, 'warning');
            return;
        }
        setCellDialogTeam(teamName);
        setCellDialogWeek(weekNum);
        setCellDialogOpponent(null);
        setCellDialogIsHome(true);
        setCellDialogOpen(true);
    };

    // Handle creating a game from the cell click dialog (auto-fills opponent)
    const handleCellDialogSave = async () => {
        if (!cellDialogTeam || !cellDialogOpponent || !cellDialogWeek) {
            showSnackbar('Please select an opponent', 'error');
            return;
        }
        try {
            const homeTeam = cellDialogIsHome ? cellDialogTeam : cellDialogOpponent.name;
            const awayTeam = cellDialogIsHome ? cellDialogOpponent.name : cellDialogTeam;
            await createScheduleEntry({
                season,
                week: cellDialogWeek,
                subdivision: conferenceTeams[0]?.subdivision || 'FBS',
                homeTeam,
                awayTeam,
                gameType: 'CONFERENCE_GAME',
            });
            showSnackbar(`Scheduled ${homeTeam} vs ${awayTeam} for Week ${cellDialogWeek}`);
            setCellDialogOpen(false);
            fetchConferenceSchedule();
            refreshAllSeasonSchedule();
        } catch (err) {
            console.error('Error adding game:', err);
            showSnackbar('Failed to add game: ' + err.message, 'error');
        }
    };

    // Handle adding a game (manual dialog)
    const handleAddGame = async () => {
        if (!addGameHome || !addGameAway) {
            showSnackbar('Please fill in all fields', 'error');
            return;
        }
        
        // Determine week and subdivision based on game type
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
            if (tabIndex === 0) fetchConferenceSchedule();
            else if (tabIndex === 1 && selectedOOCTeam) fetchOOCSchedule();
            else if (tabIndex === 2) fetchPostseasonSchedule();
        } catch (err) {
            console.error('Error adding game:', err);
            showSnackbar('Failed to add game: ' + err.message, 'error');
        }
    };

    // Handle deleting a game
    const handleDeleteGame = async (gameId) => {
        try {
            await deleteScheduleEntry(gameId);
            showSnackbar('Game removed successfully');
            refreshAllSeasonSchedule();
            if (tabIndex === 0) fetchConferenceSchedule();
            else if (tabIndex === 1 && selectedOOCTeam) fetchOOCSchedule();
            else if (tabIndex === 2) fetchPostseasonSchedule();
        } catch (err) {
            console.error('Error deleting game:', err);
            showSnackbar('Failed to remove game: ' + err.message, 'error');
        }
    };

    // Handle moving a game
    const handleMoveGame = async () => {
        if (!moveGameData || !moveToWeek) return;
        try {
            await moveGame(moveGameData.id, moveToWeek);
            showSnackbar(`Game moved to Week ${moveToWeek}`);
            setMoveDialogOpen(false);
            setMoveGameData(null);
            refreshAllSeasonSchedule();
            if (tabIndex === 0) fetchConferenceSchedule();
            else if (tabIndex === 1 && selectedOOCTeam) fetchOOCSchedule();
            else if (tabIndex === 2) fetchPostseasonSchedule();
        } catch (err) {
            console.error('Error moving game:', err);
            showSnackbar('Failed to move game: ' + err.message, 'error');
        }
    };

    // Handle generating conference schedule
    const handleGenerateConferenceSchedule = async () => {
        // Validate all protected rivalries have both teams set
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

    // Handle creating a new season + auto-generating all conference schedules (async with polling)
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
            // 1. Create the season
            await createSeasonForScheduling(num);
            setCreateSeasonProgress('Season created. Starting conference schedule generation…');

            // 2. Fire-and-forget: start async generation and poll for progress
            try {
                const jobResponse = await generateAllConferenceSchedules(num);
                const jobId = jobResponse.jobId;

                // Poll until complete
                let done = false;
                while (!done) {
                    await new Promise(r => setTimeout(r, 2000)); // Poll every 2s
                    try {
                        const status = await pollScheduleGenJobStatus(jobId);
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
                        showSnackbar(`Season ${num} created, but lost track of generation progress. Check the conference tab.`, 'warning');
                    }
                }
            } catch (genErr) {
                console.error('Error starting conference schedule generation:', genErr);
                showSnackbar(`Season ${num} created, but auto-generation failed: ${genErr.message}. You can generate schedules manually.`, 'warning');
            }

            setCreateSeasonDialogOpen(false);
            setNewSeasonNumber('');
            const seasonsData = await getAllSeasons();
            const seasonNumbers = seasonsData.map(s => s.season_number || s.seasonNumber);
            setAllSeasons(seasonNumbers);
            setSeason(num);
        } catch (err) {
            console.error('Error creating season:', err);
            showSnackbar('Failed to create season: ' + err.message, 'error');
        } finally {
            setCreatingSeasonLoading(false);
            setCreateSeasonProgress('');
        }
    };

    // Rivalry management
    const addRivalry = () => {
        setProtectedRivalries([...protectedRivalries, { team1: '', team2: '', week: null }]);
    };

    const removeRivalry = (index) => {
        setProtectedRivalries(protectedRivalries.filter((_, i) => i !== index));
    };

    const updateRivalry = (index, fieldName, value) => {
        const updated = [...protectedRivalries];
        updated[index] = { ...updated[index], [fieldName]: value };
        setProtectedRivalries(updated);
    };

    // Save conference rules
    const handleSaveConferenceRules = async (conference, numGames, rivalries) => {
        try {
            await saveConferenceRules(conference, numGames, rivalries);
            showSnackbar(`Conference rules saved for ${formatConference(conference)}`);
        } catch (err) {
            console.error('Error saving conference rules:', err);
            showSnackbar('Failed to save conference rules: ' + err.message, 'error');
        }
    };

    const navigationItems = adminNavigationItems;
    const handleNavigationChange = (item) => navigate(item.path);

    // Build a set of "team|week" pairs from the FULL season schedule for occupancy checks.
    // `teamWeekOccupiedAll` includes ALL games (used for duplicate prevention in add-game dialogs).
    // `teamWeekOccupiedNonConf` EXCLUDES conference games for the currently selected conference
    //   (used in the conference grid to show "OOC" — prevents conference games from being mislabelled as OOC).
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

    // Conference game keys from the currently loaded conferenceSchedule — these should NOT
    // appear as "OOC" in the conference grid even if allSeasonSchedule includes them.
    const teamWeekOccupiedNonConf = useMemo(() => {
        const confKeys = new Set();
        conferenceSchedule.forEach(game => {
            const home = field(game, 'homeTeam', 'home_team');
            const away = field(game, 'awayTeam', 'away_team');
            const week = game.week;
            if (home && week) confKeys.add(`${home}|${week}`);
            if (away && week) confKeys.add(`${away}|${week}`);
        });

        const occupied = new Set();
        allSeasonSchedule.forEach(game => {
            const home = field(game, 'homeTeam', 'home_team');
            const away = field(game, 'awayTeam', 'away_team');
            const week = game.week;
            if (home && week && !confKeys.has(`${home}|${week}`)) occupied.add(`${home}|${week}`);
            if (away && week && !confKeys.has(`${away}|${week}`)) occupied.add(`${away}|${week}`);
        });
        return occupied;
    }, [allSeasonSchedule, conferenceSchedule]);

    // Check if any games have been played in this season
    const hasGamesPlayed = useMemo(() => {
        return allSeasonSchedule.some(game => {
            const started = field(game, 'started', 'started');
            const finished = field(game, 'finished', 'finished');
            return started === true || finished === true;
        });
    }, [allSeasonSchedule]);

    // Available opponents for cell dialog (conference teams not scheduled that week AND not already playing this team)
    const cellDialogAvailableOpponents = useMemo(() => {
        if (!cellDialogWeek || !cellDialogTeam) return [];
        return conferenceTeams.filter(t => {
            if (t.name === cellDialogTeam) return false;
            // Check if opponent is already scheduled that week
            if (teamWeekOccupiedAll.has(`${t.name}|${cellDialogWeek}`)) return false;
            // Check if this team is already scheduled to play this opponent anywhere in the season
            const alreadyPlaying = allSeasonSchedule.some(game => {
                const home = field(game, 'homeTeam', 'home_team');
                const away = field(game, 'awayTeam', 'away_team');
                return (home === cellDialogTeam && away === t.name) || (home === t.name && away === cellDialogTeam);
            });
            return !alreadyPlaying;
        });
    }, [cellDialogWeek, cellDialogTeam, conferenceTeams, teamWeekOccupiedAll, allSeasonSchedule]);

    // Filtered conferences for admin (excludes FBS Independent)
    const adminConferences = useMemo(() => {
        return conferences.filter(c => !EXCLUDED_ADMIN_CONFERENCES.includes(c.value));
    }, []);

    if (loading) {
        return (
            <DashboardLayout
                title="Scheduling"
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
            title="Scheduling"
            navigationItems={navigationItems}
            onNavigationChange={handleNavigationChange}
            hideHeader={true}
            textColor="primary.main"
        >
            <Box sx={{ p: 3 }}>
                {/* Page Header */}
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 1 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            Schedule Management
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <FormControl size="small" sx={{ minWidth: 140 }}>
                                <InputLabel>Season</InputLabel>
                                <Select
                                    value={season || ''}
                                    label="Season"
                                    onChange={(e) => setSeason(e.target.value)}
                                >
                                    {allSeasons.map(s => (
                                        <MenuItem key={s} value={s}>Season {s}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => {
                                    const maxSeason = allSeasons.length > 0 ? Math.max(...allSeasons) : 0;
                                    setNewSeasonNumber(String(maxSeason + 1));
                                    setCreateSeasonDialogOpen(true);
                                }}
                            >
                                New Season
                            </Button>
                            <Tooltip title={scheduleLocked ? 'Schedule is locked — click to unlock' : 'Schedule is unlocked — click to lock'}>
                                <Button
                                    variant={scheduleLocked ? 'contained' : 'outlined'}
                                    color={scheduleLocked ? 'error' : 'success'}
                                    startIcon={scheduleLocked ? <LockIcon /> : <LockOpenIcon />}
                                    onClick={handleToggleLock}
                                    size="small"
                                >
                                    {scheduleLocked ? 'Locked' : 'Unlocked'}
                                </Button>
                            </Tooltip>
                        </Box>
                    </Box>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Season {season} — Manage conference, out-of-conference, and postseason schedules
                        {scheduleLocked && (
                            <Chip
                                icon={<LockIcon />}
                                label="Schedule Locked"
                                size="small"
                                color="error"
                                variant="outlined"
                                sx={{ ml: 2 }}
                            />
                        )}
                    </Typography>
                </Box>

                {scheduleLocked && (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        The schedule for Season {season} is locked. Unlock it to make changes. Postseason entries are exempt from schedule lock.
                    </Alert>
                )}

                {/* Tab Selector */}
                <Tabs
                    value={tabIndex}
                    onChange={(_, newVal) => setTabIndex(newVal)}
                    sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab label="Conference Schedule" />
                    <Tab label="Out of Conference" />
                    <Tab label="Postseason" />
                </Tabs>

                {/* ======================== CONFERENCE SCHEDULE TAB ======================== */}
                {tabIndex === 0 && (
                    <ConferenceScheduleAdminTab
                        selectedConference={selectedConference}
                        onConferenceChange={setSelectedConference}
                        adminConferences={adminConferences}
                        conferenceSchedule={conferenceSchedule}
                        conferenceTeams={conferenceTeams}
                        confLoading={confLoading}
                        scheduleLocked={scheduleLocked}
                        teamMap={teamMap}
                        teamWeekOccupied={teamWeekOccupiedNonConf}
                        onAddGameManually={() => {
                            setAddGameType('CONFERENCE_GAME');
                            setAddGameDialogOpen(true);
                        }}
                        onGenerateSchedule={() => setGenerateDialogOpen(true)}
                        onEmptyCellClick={handleEmptyCellClick}
                        onFilledCellClick={(cell, weekNum) => {
                            setMoveGameData(cell);
                            setMoveToWeek(weekNum);
                            setMoveDialogOpen(true);
                        }}
                        numConferenceGames={numConferenceGames}
                        onNumConferenceGamesChange={setNumConferenceGames}
                        protectedRivalries={protectedRivalries}
                        onAddRivalry={addRivalry}
                        onRemoveRivalry={removeRivalry}
                        onUpdateRivalry={updateRivalry}
                        hasGamesPlayed={hasGamesPlayed}
                        onSaveConferenceRules={handleSaveConferenceRules}
                    />
                )}

                {/* ======================== OOC SCHEDULE TAB ======================== */}
                {tabIndex === 1 && (
                    <OOCScheduleAdminTab
                        allTeams={allTeams}
                        selectedOOCTeam={selectedOOCTeam}
                        onOOCTeamChange={setSelectedOOCTeam}
                        oocFullSchedule={oocFullSchedule}
                        oocLoading={oocLoading}
                        scheduleLocked={scheduleLocked}
                        teamMap={teamMap}
                        onAddOOCGame={() => {
                            setAddGameType('OUT_OF_CONFERENCE');
                            setAddGameHome(selectedOOCTeam);
                            setAddGameDialogOpen(true);
                        }}
                        onAddOOCGameForWeek={(weekNum) => {
                            setAddGameType('OUT_OF_CONFERENCE');
                            setAddGameHome(selectedOOCTeam);
                            setAddGameWeek(weekNum);
                            setAddGameDialogOpen(true);
                        }}
                        onMoveGame={(game) => {
                            setMoveGameData(game);
                            setMoveToWeek(game.week);
                            setMoveDialogOpen(true);
                        }}
                        onDeleteGame={handleDeleteGame}
                        onRefresh={() => { fetchOOCSchedule(); refreshAllSeasonSchedule(); }}
                    />
                )}

                {/* ======================== POSTSEASON TAB ======================== */}
                {tabIndex === 2 && (
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

                {/* ======================== CELL CLICK DIALOG (Conference Grid) ======================== */}
                <Dialog open={cellDialogOpen} onClose={() => setCellDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        Schedule Game — {cellDialogTeam}, Week {cellDialogWeek}
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <Autocomplete
                                options={cellDialogAvailableOpponents}
                                getOptionLabel={(option) => option.name || ''}
                                value={cellDialogOpponent}
                                onChange={(_, v) => setCellDialogOpponent(v)}
                                renderInput={(params) => (
                                    <TextField {...params} label="Opponent" size="small" />
                                )}
                                renderOption={(props, option) => {
                                    const { key, ...otherProps } = props;
                                    return (
                                        <Box component="li" key={key} {...otherProps} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar src={option.logo} sx={{ width: 20, height: 20 }}>{option.name?.charAt(0)}</Avatar>
                                            <Typography variant="body2">{option.name}</Typography>
                                        </Box>
                                    );
                                }}
                                isOptionEqualToValue={(option, value) => option.name === value?.name}
                            />
                            <FormControl size="small" fullWidth>
                                <InputLabel>Home/Away</InputLabel>
                                <Select
                                    value={cellDialogIsHome ? 'home' : 'away'}
                                    label="Home/Away"
                                    onChange={(e) => setCellDialogIsHome(e.target.value === 'home')}
                                >
                                    <MenuItem value="home">{cellDialogTeam} is Home</MenuItem>
                                    <MenuItem value="away">{cellDialogTeam} is Away</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCellDialogOpen(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleCellDialogSave}>Schedule Game</Button>
                    </DialogActions>
                </Dialog>

                {/* ======================== ADD GAME DIALOG ======================== */}
                <Dialog open={addGameDialogOpen} onClose={() => setAddGameDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Add {formatGameType(addGameType)}</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            {/* Week selector - hidden for BOWL (always 14), PLAYOFFS (calculated from round), and CONFERENCE_CHAMPIONSHIP (always 13) */}
                            {addGameType !== 'BOWL' && addGameType !== 'PLAYOFFS' && addGameType !== 'CONFERENCE_CHAMPIONSHIP' && addGameType !== 'NATIONAL_CHAMPIONSHIP' && (
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Week</InputLabel>
                                    <Select
                                        value={addGameWeek}
                                        label="Week"
                                        onChange={(e) => setAddGameWeek(e.target.value)}
                                    >
                                        {Array.from({ length: 20 }, (_, i) => (
                                            <MenuItem key={i + 1} value={i + 1}>Week {i + 1}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                            {/* Show week info for BOWL (always 14) */}
                            {addGameType === 'BOWL' && (
                                <Alert severity="info" sx={{ py: 0.5 }}>
                                    Bowl games are always scheduled for Week 14
                                </Alert>
                            )}

                            <Autocomplete
                                options={allTeams.filter(t => {
                                    if (!t.active) return false;
                                    // For regular season games (weeks 1-12), filter out teams already scheduled
                                    if (addGameWeek && addGameWeek <= TOTAL_WEEKS) {
                                        return !teamWeekOccupiedAll.has(`${t.name}|${addGameWeek}`);
                                    }
                                    return true;
                                })}
                                getOptionLabel={(option) => option.name || ''}
                                value={addGameHome}
                                onChange={(_, v) => setAddGameHome(v)}
                                renderInput={(params) => (
                                    <TextField {...params} label="Home Team" size="small" />
                                )}
                                renderOption={(props, option) => {
                                    const { key, ...otherProps } = props;
                                    return (
                                        <Box component="li" key={key} {...otherProps} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar src={option.logo} sx={{ width: 20, height: 20 }}>{option.name?.charAt(0)}</Avatar>
                                            <Typography variant="body2">{option.name}</Typography>
                                        </Box>
                                    );
                                }}
                                isOptionEqualToValue={(option, value) => option.name === value?.name}
                            />

                            <Autocomplete
                                options={(() => {
                                    let opts;
                                    if (addGameType === 'OUT_OF_CONFERENCE') {
                                        opts = allTeams.filter(t => t.active && t.conference !== selectedOOCTeam?.conference);
                                    } else if (addGameType === 'CONFERENCE_GAME') {
                                        opts = conferenceTeams;
                                    } else {
                                        opts = allTeams.filter(t => t.active);
                                    }
                                    // For regular season games, filter out teams already scheduled that week
                                    if (addGameWeek && addGameWeek <= TOTAL_WEEKS) {
                                        opts = opts.filter(t => !teamWeekOccupiedAll.has(`${t.name}|${addGameWeek}`));
                                    }
                                    return opts;
                                })()}
                                getOptionLabel={(option) => option.name || ''}
                                value={addGameAway}
                                onChange={(_, v) => setAddGameAway(v)}
                                renderInput={(params) => (
                                    <TextField {...params} label="Away Team" size="small" />
                                )}
                                renderOption={(props, option) => {
                                    const { key, ...otherProps } = props;
                                    return (
                                        <Box component="li" key={key} {...otherProps} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar src={option.logo} sx={{ width: 20, height: 20 }}>{option.name?.charAt(0)}</Avatar>
                                            <Typography variant="body2">{option.name}</Typography>
                                        </Box>
                                    );
                                }}
                                isOptionEqualToValue={(option, value) => option.name === value?.name}
                            />

                            {/* Bowl Game Name - only shown for BOWL games */}
                            {addGameType === 'BOWL' && (
                                <TextField
                                    label="Bowl Game Name"
                                    size="small"
                                    fullWidth
                                    required
                                    value={addGameBowlName}
                                    onChange={(e) => setAddGameBowlName(e.target.value)}
                                    placeholder="e.g., Rose Bowl, Sugar Bowl, etc."
                                    error={!addGameBowlName || addGameBowlName.trim() === ''}
                                    helperText={(!addGameBowlName || addGameBowlName.trim() === '') ? 'Bowl game name is required' : ''}
                                />
                            )}

                            {/* Postseason Game Logo - shown for BOWL, PLAYOFFS, CONFERENCE_CHAMPIONSHIP, and NATIONAL_CHAMPIONSHIP */}
                            {(addGameType === 'BOWL' || addGameType === 'PLAYOFFS' || addGameType === 'CONFERENCE_CHAMPIONSHIP' || addGameType === 'NATIONAL_CHAMPIONSHIP') && (
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
                                                    // Create preview URL
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
                                    <label htmlFor="logo-upload-button">
                                        <Button
                                            variant="outlined"
                                            component="span"
                                            startIcon={uploadingLogo ? <CircularProgress size={16} /> : <UploadIcon />}
                                            disabled={uploadingLogo}
                                            fullWidth
                                            size="small"
                                        >
                                            {uploadingLogo ? 'Uploading...' : addGameLogo ? 'Change Logo' : 'Upload Postseason Game Logo'}
                                        </Button>
                                    </label>
                                    {addGameLogoPreview && (
                                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                            <Avatar
                                                src={addGameLogoPreview}
                                                sx={{ width: 100, height: 100 }}
                                                variant="rounded"
                                            />
                                        </Box>
                                    )}
                                    {addGameLogo && !addGameLogoPreview && (
                                        <Alert severity="info" sx={{ mt: 1 }}>
                                            Logo uploaded: {addGameLogo}
                                        </Alert>
                                    )}
                                </Box>
                            )}

                            {/* Game Type selector - hidden for BOWL (always BOWL) */}
                            {addGameType !== 'BOWL' && (
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Game Type</InputLabel>
                                    <Select
                                        value={addGameType}
                                        label="Game Type"
                                        onChange={(e) => setAddGameType(e.target.value)}
                                    >
                                        <MenuItem value="CONFERENCE_GAME">Conference Game</MenuItem>
                                        <MenuItem value="OUT_OF_CONFERENCE">Out of Conference</MenuItem>
                                        <MenuItem value="CONFERENCE_CHAMPIONSHIP">Conference Championship</MenuItem>
                                        <MenuItem value="BOWL">Bowl</MenuItem>
                                        <MenuItem value="PLAYOFFS">Playoffs</MenuItem>
                                        <MenuItem value="NATIONAL_CHAMPIONSHIP">National Championship</MenuItem>
                                    </Select>
                                </FormControl>
                            )}

                            {(addGameType === 'PLAYOFFS' || addGameType === 'NATIONAL_CHAMPIONSHIP') && (
                                <>
                                    <FormControl size="small" fullWidth>
                                        <InputLabel>Playoff Round</InputLabel>
                                        <Select
                                            value={addGamePlayoffRound || ''}
                                            label="Playoff Round"
                                            onChange={(e) => {
                                                const round = e.target.value ? parseInt(e.target.value) : null;
                                                setAddGamePlayoffRound(round);
                                                // Calculate week from round: Round 1 = Week 14, Round 2 = Week 15, etc.
                                                if (round) {
                                                    const calculatedWeek = 13 + round;
                                                    setAddGameWeek(calculatedWeek);
                                                }
                                            }}
                                        >
                                            <MenuItem value={1}>1 - First Round (Week 14)</MenuItem>
                                            <MenuItem value={2}>2 - Second Round (Week 15)</MenuItem>
                                            <MenuItem value={3}>3 - Quarterfinals (Week 16)</MenuItem>
                                            <MenuItem value={4}>4 - Semifinals (Week 17)</MenuItem>
                                            <MenuItem value={5}>5 - National Championship (Week 18)</MenuItem>
                                        </Select>
                                    </FormControl>
                                    {addGamePlayoffRound && (
                                        <Alert severity="info" sx={{ py: 0.5 }}>
                                            Week {13 + addGamePlayoffRound} (calculated from round {addGamePlayoffRound})
                                        </Alert>
                                    )}
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <TextField
                                            label="Home Seed"
                                            type="number"
                                            size="small"
                                            value={addGameHomeSeed || ''}
                                            onChange={(e) => setAddGameHomeSeed(parseInt(e.target.value) || null)}
                                            fullWidth
                                        />
                                        <TextField
                                            label="Away Seed"
                                            type="number"
                                            size="small"
                                            value={addGameAwaySeed || ''}
                                            onChange={(e) => setAddGameAwaySeed(parseInt(e.target.value) || null)}
                                            fullWidth
                                        />
                                    </Box>
                                </>
                            )}

                            {/* Subdivision selector - hidden for BOWL, PLAYOFFS, CONFERENCE_CHAMPIONSHIP, and NATIONAL_CHAMPIONSHIP (always FCFB) */}
                            {addGameType !== 'BOWL' && addGameType !== 'PLAYOFFS' && addGameType !== 'CONFERENCE_CHAMPIONSHIP' && addGameType !== 'NATIONAL_CHAMPIONSHIP' && (
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Subdivision</InputLabel>
                                    <Select
                                        value={addGameSubdivision}
                                        label="Subdivision"
                                        onChange={(e) => setAddGameSubdivision(e.target.value)}
                                    >
                                        <MenuItem value="FBS">FBS</MenuItem>
                                        <MenuItem value="FCS">FCS</MenuItem>
                                    </Select>
                                </FormControl>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setAddGameDialogOpen(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleAddGame}>Add Game</Button>
                    </DialogActions>
                </Dialog>

                {/* ======================== MOVE GAME DIALOG ======================== */}
                <Dialog open={moveDialogOpen} onClose={() => setMoveDialogOpen(false)} maxWidth="xs" fullWidth>
                    <DialogTitle>Move or Remove Game</DialogTitle>
                    <DialogContent>
                        {moveGameData && (() => {
                            const home = field(moveGameData, 'homeTeam', 'home_team') || moveGameData.opponent;
                            const away = field(moveGameData, 'awayTeam', 'away_team') || '';
                            const isRivalry = protectedRivalries.some(r =>
                                r.team1 && r.team2 && (
                                    (r.team1 === home && r.team2 === away) ||
                                    (r.team1 === away && r.team2 === home) ||
                                    (r.team1 === home && r.team2 === moveGameData.opponent) ||
                                    (r.team1 === moveGameData.opponent && r.team2 === home)
                                )
                            );
                            return (
                                <Box sx={{ mt: 1 }}>
                                    <Typography variant="body2" sx={{ mb: 2 }}>
                                        {home} vs {away || moveGameData.opponent} (Week {moveGameData.week})
                                    </Typography>
                                    {isRivalry && (
                                        <Alert severity="info" sx={{ mb: 2 }}>
                                            This is a protected rivalry and cannot be deleted — only moved to a different week.
                                        </Alert>
                                    )}
                                    <FormControl size="small" fullWidth>
                                        <InputLabel>Move to Week</InputLabel>
                                        <Select
                                            value={moveToWeek}
                                            label="Move to Week"
                                            onChange={(e) => setMoveToWeek(e.target.value)}
                                        >
                                            {Array.from({ length: 12 }, (_, i) => {
                                                const weekNum = i + 1;
                                                const home = field(moveGameData, 'homeTeam', 'home_team') || moveGameData.opponent;
                                                const away = field(moveGameData, 'awayTeam', 'away_team') || '';
                                                const homeOccupied = teamWeekOccupiedAll.has(`${home}|${weekNum}`);
                                                const awayOccupied = away && teamWeekOccupiedAll.has(`${away}|${weekNum}`);
                                                const isOccupied = homeOccupied || awayOccupied;
                                                const isCurrentWeek = weekNum === moveGameData.week;
                                                // Only show weeks 1-12 that are not occupied (or the current week)
                                                if (isOccupied && !isCurrentWeek) {
                                                    return null; // Don't render occupied weeks
                                                }
                                                return (
                                                    <MenuItem 
                                                        key={weekNum} 
                                                        value={weekNum}
                                                    >
                                                        Week {weekNum}
                                                    </MenuItem>
                                                );
                                            })}
                                        </Select>
                                    </FormControl>
                                </Box>
                            );
                        })()}
                    </DialogContent>
                    <DialogActions>
                        {moveGameData && (() => {
                            const home = field(moveGameData, 'homeTeam', 'home_team') || moveGameData.opponent;
                            const away = field(moveGameData, 'awayTeam', 'away_team') || '';
                            const isRivalry = protectedRivalries.some(r =>
                                r.team1 && r.team2 && (
                                    (r.team1 === home && r.team2 === away) ||
                                    (r.team1 === away && r.team2 === home) ||
                                    (r.team1 === home && r.team2 === moveGameData.opponent) ||
                                    (r.team1 === moveGameData.opponent && r.team2 === home)
                                )
                            );
                            return (
                                <Tooltip title={isRivalry ? 'Protected rivalries cannot be deleted' : ''}>
                                    <span>
                                        <Button
                                            color="error"
                                            disabled={isRivalry}
                                            onClick={() => {
                                                if (moveGameData?.id) {
                                                    handleDeleteGame(moveGameData.id);
                                                    setMoveDialogOpen(false);
                                                    setMoveGameData(null);
                                                }
                                            }}
                                        >
                                            Delete Game
                                        </Button>
                                    </span>
                                </Tooltip>
                            );
                        })()}
                        <Button onClick={() => setMoveDialogOpen(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleMoveGame}>Move</Button>
                    </DialogActions>
                </Dialog>

                {/* ======================== GENERATE CONFERENCE SCHEDULE DIALOG ======================== */}
                <Dialog open={generateDialogOpen} onClose={() => setGenerateDialogOpen(false)} maxWidth="md" fullWidth>
                    <DialogTitle>Auto-Generate {formatConference(selectedConference)} Conference Schedule</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
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

                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Using {numConferenceGames} conference games per team with {protectedRivalries.filter(r => r.team1 && r.team2).length} protected rivalries.
                                Adjust these in the Conference Rules section above.
                            </Typography>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setGenerateDialogOpen(false)}>Cancel</Button>
                        <Button
                            variant="contained"
                            onClick={handleGenerateConferenceSchedule}
                            startIcon={<GenerateIcon />}
                            disabled={confLoading}
                        >
                            {confLoading ? 'Generating...' : 'Generate Schedule'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* ======================== CREATE SEASON DIALOG ======================== */}
                <Dialog open={createSeasonDialogOpen} onClose={() => !creatingSeasonLoading && setCreateSeasonDialogOpen(false)} maxWidth="xs" fullWidth>
                    <DialogTitle>Create New Season for Scheduling</DialogTitle>
                    <DialogContent>
                        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                label="Season Number"
                                type="number"
                                size="small"
                                value={newSeasonNumber}
                                onChange={(e) => setNewSeasonNumber(e.target.value)}
                                fullWidth
                                disabled={creatingSeasonLoading}
                            />
                            <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
                                This will create the season and auto-generate conference schedules for all conferences
                                (9 conference games per team, no protected rivalries). OOC weeks will be left blank.
                                You can modify everything afterwards.
                            </Alert>
                            {creatingSeasonLoading && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <CircularProgress size={20} />
                                    <Typography variant="body2" color="text.secondary">
                                        {createSeasonProgress || 'Creating season & generating schedules…'}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCreateSeasonDialogOpen(false)} disabled={creatingSeasonLoading}>Cancel</Button>
                        <Button variant="contained" onClick={handleCreateSeason} disabled={creatingSeasonLoading}>
                            {creatingSeasonLoading ? 'Creating…' : 'Create Season'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar notifications */}
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
            </Box>
        </DashboardLayout>
    );
};

export default Scheduling;
