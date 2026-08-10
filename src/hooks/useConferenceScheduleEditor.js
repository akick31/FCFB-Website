import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    getScheduleBySeason,
    getConferenceSchedule,
    getConferenceRules,
    createScheduleEntry,
    deleteScheduleEntry,
    moveGame,
} from '../api/scheduleApi';
import { isScheduleLocked } from '../api/seasonApi';
import { field } from '../utils/fieldHelper';

const DEFAULT_CONFERENCE_GAMES = 9;

const useConferenceScheduleEditor = ({ season, selectedConference, allTeams, teamsMap, enabled }) => {
    const [conferenceSchedule, setConferenceSchedule] = useState([]);
    const [allSeasonSchedule, setAllSeasonSchedule] = useState([]);
    const [confLoading, setConfLoading] = useState(false);
    const [scheduleLocked, setScheduleLocked] = useState(false);
    const [numConferenceGames, setNumConferenceGames] = useState(DEFAULT_CONFERENCE_GAMES);

    const [addGameDialogOpen, setAddGameDialogOpen] = useState(false);
    const [addGameWeek, setAddGameWeek] = useState(1);
    const [addGameType, setAddGameType] = useState('CONFERENCE_GAME');
    const [addGameHome, setAddGameHome] = useState(null);
    const [addGameAway, setAddGameAway] = useState(null);
    const [addGameAnchorTeam, setAddGameAnchorTeam] = useState(null);
    const [addGameNeutralSite, setAddGameNeutralSite] = useState(false);
    const [addGameVenue, setAddGameVenue] = useState('');

    const [moveDialogOpen, setMoveDialogOpen] = useState(false);
    const [moveGameData, setMoveGameData] = useState(null);
    const [moveToWeek, setMoveToWeek] = useState(1);

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const showSnackbar = useCallback((message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    }, []);
    const closeSnackbar = useCallback(() => setSnackbar((prev) => ({ ...prev, open: false })), []);

    const conferenceTeams = useMemo(() => {
        if (!selectedConference) return [];
        return allTeams
            .filter((t) => t.conference === selectedConference && t.active)
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }, [allTeams, selectedConference]);

    const fetchConferenceSchedule = useCallback(async () => {
        if (!season || !selectedConference) return;
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
    }, [season, selectedConference]);

    const refreshAllSeasonSchedule = useCallback(async () => {
        if (!season) return;
        try {
            const schedule = await getScheduleBySeason(season);
            setAllSeasonSchedule(schedule || []);
        } catch (err) {
            console.error('Error refreshing full season schedule:', err);
        }
    }, [season]);

    useEffect(() => {
        if (!enabled) return;
        refreshAllSeasonSchedule();
    }, [enabled, refreshAllSeasonSchedule]);

    useEffect(() => {
        if (!enabled) return;
        fetchConferenceSchedule();
    }, [enabled, fetchConferenceSchedule]);

    useEffect(() => {
        if (!enabled || !season) { setScheduleLocked(false); return; }
        let active = true;
        isScheduleLocked(season)
            .then((locked) => { if (active) setScheduleLocked(locked); })
            .catch(() => { if (active) setScheduleLocked(false); });
        return () => { active = false; };
    }, [enabled, season]);

    useEffect(() => {
        if (!enabled || !selectedConference) return;
        let active = true;
        getConferenceRules(selectedConference)
            .then((rules) => { if (active) setNumConferenceGames(rules?.numConferenceGames || DEFAULT_CONFERENCE_GAMES); })
            .catch(() => { if (active) setNumConferenceGames(DEFAULT_CONFERENCE_GAMES); });
        return () => { active = false; };
    }, [enabled, selectedConference]);

    useEffect(() => {
        if (addGameDialogOpen) {
            setAddGameNeutralSite(false);
            setAddGameVenue('');
        }
    }, [addGameDialogOpen]);

    const teamWeekOccupiedAll = useMemo(() => {
        const occupied = new Set();
        allSeasonSchedule.forEach((game) => {
            const home = field(game, 'homeTeam', 'home_team');
            const away = field(game, 'awayTeam', 'away_team');
            const week = game.week;
            if (home && week) occupied.add(`${home}|${week}`);
            if (away && week) occupied.add(`${away}|${week}`);
        });
        return occupied;
    }, [allSeasonSchedule]);

    const isConferenceScheduleComplete = useMemo(() => {
        if (conferenceTeams.length === 0) return false;
        const gameCounts = {};
        conferenceSchedule.forEach((game) => {
            const home = field(game, 'homeTeam', 'home_team');
            const away = field(game, 'awayTeam', 'away_team');
            if (home) gameCounts[home] = (gameCounts[home] || 0) + 1;
            if (away) gameCounts[away] = (gameCounts[away] || 0) + 1;
        });
        return conferenceTeams.every((t) => (gameCounts[t.name] || 0) >= numConferenceGames);
    }, [conferenceTeams, conferenceSchedule, numConferenceGames]);

    const refreshAfterChange = () => {
        refreshAllSeasonSchedule();
        fetchConferenceSchedule();
    };

    const handleEmptyCellClick = (teamName, weekNum) => {
        if (teamWeekOccupiedAll.has(`${teamName}|${weekNum}`)) {
            showSnackbar(`${teamName} already has a game scheduled in Week ${weekNum}`, 'warning');
            return;
        }
        setAddGameType(isConferenceScheduleComplete ? 'OUT_OF_CONFERENCE' : 'CONFERENCE_GAME');
        setAddGameWeek(weekNum);
        setAddGameHome(teamsMap[teamName] || { name: teamName });
        setAddGameAway(null);
        setAddGameAnchorTeam(teamName);
        setAddGameDialogOpen(true);
    };

    const handleAddGameManually = () => {
        setAddGameType(isConferenceScheduleComplete ? 'OUT_OF_CONFERENCE' : 'CONFERENCE_GAME');
        setAddGameWeek(1);
        setAddGameHome(null);
        setAddGameAway(null);
        setAddGameAnchorTeam(null);
        setAddGameDialogOpen(true);
    };

    const handleAddGameHomeChange = (team) => {
        setAddGameHome(team);
        if (addGameAnchorTeam && team?.name !== addGameAnchorTeam && addGameAway?.name !== addGameAnchorTeam) {
            setAddGameAway(teamsMap[addGameAnchorTeam] || { name: addGameAnchorTeam });
        }
    };

    const handleAddGameAwayChange = (team) => {
        setAddGameAway(team);
        if (addGameAnchorTeam && team?.name !== addGameAnchorTeam && addGameHome?.name !== addGameAnchorTeam) {
            setAddGameHome(teamsMap[addGameAnchorTeam] || { name: addGameAnchorTeam });
        }
    };

    const handleAddGame = async () => {
        if (!addGameHome || !addGameAway) {
            showSnackbar('Please fill in all fields', 'error');
            return;
        }
        if (addGameNeutralSite && !addGameVenue.trim()) {
            showSnackbar('Venue is required for a neutral site game', 'error');
            return;
        }
        try {
            await createScheduleEntry({
                season,
                week: addGameWeek,
                subdivision: 'FCFB',
                homeTeam: addGameHome.name || addGameHome,
                awayTeam: addGameAway.name || addGameAway,
                gameType: addGameType,
                neutralSite: addGameNeutralSite,
                venue: addGameNeutralSite ? addGameVenue.trim() : null,
            });
            showSnackbar('Game added successfully');
            setAddGameDialogOpen(false);
            setAddGameHome(null);
            setAddGameAway(null);
            refreshAfterChange();
        } catch (err) {
            console.error('Error adding game:', err);
            showSnackbar('Failed to add game: ' + err.message, 'error');
        }
    };

    const handleDeleteGame = async (gameId) => {
        try {
            await deleteScheduleEntry(gameId);
            showSnackbar('Game removed successfully');
            refreshAfterChange();
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
            refreshAfterChange();
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

    const handleFilledCellClick = (cell, weekNum) => {
        setMoveGameData(cell);
        setMoveToWeek(weekNum);
        setMoveDialogOpen(true);
    };

    return {
        conferenceSchedule,
        conferenceTeams,
        allSeasonSchedule,
        confLoading,
        scheduleLocked,
        numConferenceGames,
        teamWeekOccupiedAll,

        addGameDialogOpen,
        setAddGameDialogOpen,
        addGameWeek,
        setAddGameWeek,
        addGameType,
        setAddGameType,
        addGameHome,
        addGameAway,
        addGameNeutralSite,
        setAddGameNeutralSite,
        addGameVenue,
        setAddGameVenue,
        handleAddGameHomeChange,
        handleAddGameAwayChange,
        handleAddGameManually,
        handleAddGame,
        handleDeleteGame,

        moveDialogOpen,
        setMoveDialogOpen,
        moveGameData,
        setMoveGameData,
        moveToWeek,
        setMoveToWeek,
        handleMoveGame,

        handleEmptyCellClick,
        handleFilledCellClick,
        handleGameDrop,

        snackbar,
        showSnackbar,
        closeSnackbar,
    };
};

export default useConferenceScheduleEditor;
