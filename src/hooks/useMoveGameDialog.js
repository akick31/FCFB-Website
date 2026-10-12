import { useState } from 'react';
import { deleteScheduleEntry, moveGame, updateScheduleEntry } from '../api/scheduleApi';
import { camelOrSnakeField } from '../utils/fieldHelper';

const useMoveGameDialog = ({ scheduleLocked, teamWeekOccupiedAll, onSuccess, showSnackbar }) => {
    const [moveDialogOpen, setMoveDialogOpen] = useState(false);
    const [moveGameData, setMoveGameData] = useState(null);
    const [moveToWeek, setMoveToWeek] = useState(1);
    const [editNeutralSite, setEditNeutralSite] = useState(false);
    const [editVenue, setEditVenue] = useState('');
    const [savingEdits, setSavingEdits] = useState(false);

    const openForCell = (cell, weekNum) => {
        setMoveGameData(cell);
        setMoveToWeek(weekNum);
        setEditNeutralSite(Boolean(camelOrSnakeField(cell, 'neutralSite', 'neutral_site')));
        setEditVenue(cell.venue || '');
        setMoveDialogOpen(true);
    };

    const openForGame = (game) => {
        setMoveGameData(game);
        setMoveToWeek(game.week);
        setEditNeutralSite(Boolean(camelOrSnakeField(game, 'neutralSite', 'neutral_site')));
        setEditVenue(game.venue || '');
        setMoveDialogOpen(true);
    };

    const handleDeleteGame = async (gameId) => {
        if (scheduleLocked) {
            return;
        }
        try {
            await deleteScheduleEntry(gameId);
            showSnackbar('Game removed successfully');
            onSuccess();
            return true;
        } catch (err) {
            console.error('Error deleting game:', err);
            showSnackbar('Failed to remove game: ' + err.message, 'error');
            return false;
        }
    };

    const moveGameToWeek = async (gameData, targetWeek) => {
        if (scheduleLocked) {
            return;
        }
        if (!gameData || !targetWeek) {
            return;
        }
        const home = camelOrSnakeField(gameData, 'homeTeam', 'home_team') || gameData.opponent;
        const away = camelOrSnakeField(gameData, 'awayTeam', 'away_team') || '';
        const homeOccupied = home && teamWeekOccupiedAll.has(`${home}|${targetWeek}`);
        const awayOccupied = away && teamWeekOccupiedAll.has(`${away}|${targetWeek}`);
        if ((homeOccupied || awayOccupied) && targetWeek !== gameData.week) {
            showSnackbar(`Cannot move: a team already has a game scheduled in Week ${targetWeek}`, 'warning');
            return;
        }
        try {
            await moveGame(gameData.id, targetWeek);
            showSnackbar(`Game moved to Week ${targetWeek}`);
            onSuccess();
            return true;
        } catch (err) {
            console.error('Error moving game:', err);
            showSnackbar('Failed to move game: ' + err.message, 'error');
            return false;
        }
    };

    const handleMoveGame = async () => {
        if (scheduleLocked) {
            return;
        }
        if (!moveGameData || !moveToWeek) {
            return;
        }
        if (await moveGameToWeek(moveGameData, moveToWeek)) {
            setMoveDialogOpen(false);
            setMoveGameData(null);
        }
    };

    const handleGameDrop = (gameData, targetWeek) => {
        moveGameToWeek(gameData, targetWeek);
    };

    const handleDeleteFromMoveDialog = async () => {
        if (scheduleLocked) {
            return;
        }
        if (moveGameData?.id) {
            if (await handleDeleteGame(moveGameData.id)) {
                setMoveDialogOpen(false);
                setMoveGameData(null);
            }
        }
    };

    const handleSaveEdits = async () => {
        if (scheduleLocked) {
            return;
        }
        if (!moveGameData?.id) {
            return;
        }
        if (editNeutralSite && !editVenue.trim()) {
            showSnackbar('Venue is required for a neutral site game', 'error');
            return;
        }
        setSavingEdits(true);
        try {
            await updateScheduleEntry(moveGameData.id, {
                season: moveGameData.season,
                week: moveGameData.week,
                subdivision: camelOrSnakeField(moveGameData, 'subdivision', 'subdivision') || 'FCFB',
                homeTeam: camelOrSnakeField(moveGameData, 'homeTeam', 'home_team') || moveGameData.opponent,
                awayTeam: camelOrSnakeField(moveGameData, 'awayTeam', 'away_team'),
                gameType: camelOrSnakeField(moveGameData, 'gameType', 'game_type'),
                playoffRound: null,
                playoffHomeSeed: null,
                playoffAwaySeed: null,
                postseasonGameName: null,
                postseasonGameLogo: null,
                neutralSite: editNeutralSite,
                venue: editNeutralSite ? editVenue.trim() : null,
            });
            showSnackbar('Game updated successfully');
            onSuccess();
        } catch (err) {
            console.error('Error updating game:', err);
            showSnackbar('Failed to update game: ' + err.message, 'error');
        } finally {
            setSavingEdits(false);
        }
    };

    return {
        moveDialogOpen,
        setMoveDialogOpen,
        moveGameData,
        moveToWeek,
        setMoveToWeek,
        editNeutralSite,
        setEditNeutralSite,
        editVenue,
        setEditVenue,
        savingEdits,
        openForCell,
        openForGame,
        handleDeleteGame,
        handleMoveGame,
        handleGameDrop,
        handleDeleteFromMoveDialog,
        handleSaveEdits,
    };
};

export default useMoveGameDialog;
