import React, { useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Autocomplete,
    Avatar,
    Chip,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Alert,
    CircularProgress,
    Divider,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    CheckCircle as FinalizeIcon,
    ArrowForward as AdvanceIcon,
    Edit as EditIcon,
    CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { createScheduleEntry, updateScheduleEntry, deleteScheduleEntry } from '../../api/scheduleApi';
import { uploadPostseasonLogo } from '../../api/uploadApi';
import { conferences } from '../constants/conferences';
import Postseason from '../schedule/Postseason';
import { R2_BYE_SEEDS, ROUND_LABELS, playoffWeekForRound, CFP_LOGO_URL } from '../constants/playoffBracket';
import { field } from '../../utils/fieldHelper';

// Conferences available for CCG (exclude FBS Independent)
const CCG_CONFERENCES = conferences.filter(c => c.value !== 'FBS_INDEPENDENT');

const PostseasonAdminTab = ({
    season,
    postseasonSchedule = [],
    postseasonLoading = false,
    allTeams = [],
    teamMap = {},
    onRefresh,
    onShowSnackbar,
    onOpenAddGameDialog,
}) => {
    // ── Playoff bracket seed-selection state ──────────────────────────
    const [playoffTeams, setPlayoffTeams] = useState(Array(24).fill(null));
    const [playoffDialogOpen, setPlayoffDialogOpen] = useState(false);

    // ── Advance-team dialog state ────────────────────────────────────
    const [advanceDialogOpen, setAdvanceDialogOpen] = useState(false);
    const [advanceGame, setAdvanceGame] = useState(null);
    const [advanceWinner, setAdvanceWinner] = useState('');
    
    // ── Edit bowl game name dialog state ─────────────────────────────
    const [editBowlDialogOpen, setEditBowlDialogOpen] = useState(false);
    const [editingBowlGame, setEditingBowlGame] = useState(null);
    const [editingBowlName, setEditingBowlName] = useState('');
    const [editingBowlLogo, setEditingBowlLogo] = useState(null);
    const [editingBowlLogoPreview, setEditingBowlLogoPreview] = useState(null);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    // ── CCG dialog state ─────────────────────────────────────────────
    const [ccgDialogOpen, setCcgDialogOpen] = useState(false);
    const [ccgConference, setCcgConference] = useState('');
    const [ccgHome, setCcgHome] = useState(null);
    const [ccgAway, setCcgAway] = useState(null);

    // ── Derived data ─────────────────────────────────────────────────
    const postseasonCCG = useMemo(() =>
        postseasonSchedule.filter(g => field(g, 'gameType', 'game_type') === 'CONFERENCE_CHAMPIONSHIP'),
        [postseasonSchedule]
    );
    const postseasonPlayoffs = useMemo(() =>
        postseasonSchedule.filter(g => {
            const gt = field(g, 'gameType', 'game_type');
            return gt === 'PLAYOFFS' || gt === 'NATIONAL_CHAMPIONSHIP';
        }),
        [postseasonSchedule]
    );
    const postseasonBowls = useMemo(() =>
        postseasonSchedule.filter(g => field(g, 'gameType', 'game_type') === 'BOWL'),
        [postseasonSchedule]
    );

    // Only playoff games for the bracket component (avoid duplicate CCG/Bowl rendering)
    // Reuse postseasonPlayoffs instead of duplicating the filter
    const playoffOnlySchedule = postseasonPlayoffs;

    // Teams already selected in the bracket (duplicate prevention)
    const selectedPlayoffTeamNames = useMemo(() =>
        new Set(playoffTeams.filter(t => t !== null).map(t => t.name)),
        [playoffTeams]
    );

    const getAvailablePlayoffTeams = (seedIndex) =>
        allTeams.filter(t => {
            if (!t.active) return false;
            if (playoffTeams[seedIndex]?.name === t.name) return true;
            return !selectedPlayoffTeamNames.has(t.name);
        });

    // CCG: teams filtered by selected conference
    const ccgTeams = useMemo(() => {
        if (!ccgConference) return [];
        return allTeams
            .filter(t => t.conference === ccgConference && t.active)
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }, [ccgConference, allTeams]);

    // ── Preview schedule entries for the bracket dialog ──────────────
    const previewScheduleEntries = useMemo(() => {
        if (!playoffTeams.some(t => t !== null)) return [];
        const entries = [];

        // R1 games: 9v24, 10v23, …, 16v17
        for (let i = 0; i < 8; i++) {
            const highSeed = 9 + i;
            const lowSeed = 24 - i;
            entries.push({
                id: `preview-r1-${i}`,
                home_team: playoffTeams[highSeed - 1]?.name || 'TBD',
                away_team: playoffTeams[lowSeed - 1]?.name || 'TBD',
                game_type: 'PLAYOFFS',
                playoff_round: 1,
                playoff_home_seed: highSeed,
                playoff_away_seed: lowSeed,
                week: playoffWeekForRound(1),
            });
        }

        // R2 placeholder games: bye teams vs OPEN
        for (let i = 0; i < 8; i++) {
            const byeSeed = R2_BYE_SEEDS[i];
            entries.push({
                id: `preview-r2-${i}`,
                home_team: playoffTeams[byeSeed - 1]?.name || 'TBD',
                away_team: 'OPEN',
                game_type: 'PLAYOFFS',
                playoff_round: 2,
                playoff_home_seed: byeSeed,
                playoff_away_seed: null,
                week: playoffWeekForRound(2),
            });
        }

        return entries;
    }, [playoffTeams]);

    // ── Load existing bracket into the dialog ────────────────────────
    const loadExistingBracket = () => {
        const newPlayoffTeams = Array(24).fill(null);
        postseasonPlayoffs.forEach(g => {
            const hs = field(g, 'playoffHomeSeed', 'playoff_home_seed');
            const as_ = field(g, 'playoffAwaySeed', 'playoff_away_seed');
            const home = field(g, 'homeTeam', 'home_team');
            const away = field(g, 'awayTeam', 'away_team');
            if (hs && home && home !== 'TBD' && !newPlayoffTeams[hs - 1]) {
                const team = allTeams.find(t => t.name === home);
                if (team) newPlayoffTeams[hs - 1] = team;
            }
            if (as_ && away && away !== 'TBD' && !newPlayoffTeams[as_ - 1]) {
                const team = allTeams.find(t => t.name === away);
                if (team) newPlayoffTeams[as_ - 1] = team;
            }
        });
        setPlayoffTeams(newPlayoffTeams);
    };

    const handleOpenPlayoffDialog = () => {
        if (postseasonPlayoffs.length > 0) {
            loadExistingBracket();
        } else {
            setPlayoffTeams(Array(24).fill(null));
        }
        setPlayoffDialogOpen(true);
    };

    // ── CCG creation ─────────────────────────────────────────────────
    const handleCreateCCG = async () => {
        if (!ccgHome || !ccgAway) {
            onShowSnackbar('Please select both teams', 'error');
            return;
        }
        try {
            await createScheduleEntry({
                season,
                week: 13,
                subdivision: ccgHome.subdivision || 'FBS',
                homeTeam: ccgHome.name,
                awayTeam: ccgAway.name,
                gameType: 'CONFERENCE_CHAMPIONSHIP',
            });
            onShowSnackbar(`CCG scheduled: ${ccgHome.name} vs ${ccgAway.name} (Week 13)`);
            setCcgDialogOpen(false);
            setCcgHome(null);
            setCcgAway(null);
            setCcgConference('');
            onRefresh();
        } catch (err) {
            console.error('Error creating CCG:', err);
            onShowSnackbar('Failed to create CCG: ' + err.message, 'error');
        }
    };

    // ── Delete game ──────────────────────────────────────────────────
    const handleDeleteGame = async (gameId) => {
        try {
            await deleteScheduleEntry(gameId);
            onShowSnackbar('Game removed successfully');
            onRefresh();
        } catch (err) {
            console.error('Error deleting game:', err);
            onShowSnackbar('Failed to remove game: ' + err.message, 'error');
        }
    };

    // ── Edit bowl game name ──────────────────────────────────────────
    const handleEditBowlName = (game) => {
        setEditingBowlGame(game);
        setEditingBowlName(field(game, 'postseasonGameName', 'postseason_game_name') || '');
        const logoUrl = field(game, 'postseasonGameLogo', 'postseason_game_logo');
        setEditingBowlLogo(logoUrl || null);
        if (logoUrl) {
            setEditingBowlLogoPreview(logoUrl.startsWith('http') ? logoUrl : `${process.env.REACT_APP_API_URL || 'http://localhost:1313'}/images/${logoUrl}`);
        } else {
            setEditingBowlLogoPreview(null);
        }
        setEditBowlDialogOpen(true);
    };

    const handleSaveBowlName = async () => {
        if (!editingBowlGame) return;
        try {
            await updateScheduleEntry(editingBowlGame.id, {
                season: editingBowlGame.season || season,
                week: field(editingBowlGame, 'week', 'week'),
                subdivision: field(editingBowlGame, 'subdivision', 'subdivision'),
                homeTeam: field(editingBowlGame, 'homeTeam', 'home_team'),
                awayTeam: field(editingBowlGame, 'awayTeam', 'away_team'),
                gameType: field(editingBowlGame, 'gameType', 'game_type'),
                postseasonGameName: editingBowlName || null,
                postseasonGameLogo: editingBowlLogo || null,
            });
            onShowSnackbar('Bowl game updated successfully');
            setEditBowlDialogOpen(false);
            setEditingBowlGame(null);
            setEditingBowlName('');
            setEditingBowlLogo(null);
            setEditingBowlLogoPreview(null);
            onRefresh();
        } catch (err) {
            console.error('Error updating bowl game:', err);
            onShowSnackbar('Failed to update bowl game: ' + err.message, 'error');
        }
    };

    // ── Generate playoff bracket (R1 games + R2 placeholders) ───────
    const handleGeneratePlayoffBracket = async () => {
        const validTeams = playoffTeams.filter(t => t !== null);
        if (validTeams.length !== 24) {
            onShowSnackbar(`Please fill all 24 playoff spots (${validTeams.length}/24 filled)`, 'error');
            return;
        }
        const uniqueTeams = new Set(validTeams.map(t => t.name));
        if (uniqueTeams.size !== 24) {
            onShowSnackbar('Each team can only appear once in the bracket!', 'error');
            return;
        }

        try {
            // Delete existing playoff games
            const existingPlayoffIds = postseasonPlayoffs.map(g => g.id).filter(Boolean);
            for (const id of existingPlayoffIds) {
                await deleteScheduleEntry(id);
            }

            const firstRoundWeek = playoffWeekForRound(1);
            const secondRoundWeek = playoffWeekForRound(2);

            // R1 games (seeds 9-16 vs 24-17)
            const firstRoundGames = [];
            for (let i = 0; i < 8; i++) {
                const highSeed = 9 + i;
                const lowSeed = 24 - i;
                firstRoundGames.push({
                    season,
                    week: firstRoundWeek,
                    subdivision: 'FBS',
                    homeTeam: playoffTeams[highSeed - 1].name,
                    awayTeam: playoffTeams[lowSeed - 1].name,
                    gameType: 'PLAYOFFS',
                    playoffRound: 1,
                    playoffHomeSeed: highSeed,
                    playoffAwaySeed: lowSeed,
                    postseasonGameLogo: CFP_LOGO_URL,
                    postseasonGameName: ROUND_LABELS[1],
                });
            }

            // R2 placeholder games (bye teams vs OPEN)
            const secondRoundGames = [];
            for (let i = 0; i < 8; i++) {
                const byeSeed = R2_BYE_SEEDS[i];
                secondRoundGames.push({
                    season,
                    week: secondRoundWeek,
                    subdivision: 'FBS',
                    homeTeam: playoffTeams[byeSeed - 1].name,
                    awayTeam: 'OPEN',
                    gameType: 'PLAYOFFS',
                    playoffRound: 2,
                    playoffHomeSeed: byeSeed,
                    playoffAwaySeed: null,
                    postseasonGameLogo: CFP_LOGO_URL,
                    postseasonGameName: ROUND_LABELS[2],
                });
            }

            for (const game of [...firstRoundGames, ...secondRoundGames]) {
                await createScheduleEntry(game);
            }

            onShowSnackbar(
                `Playoff bracket created: ${firstRoundGames.length} R1 games (Wk ${firstRoundWeek}) + ${secondRoundGames.length} R2 placeholders (Wk ${secondRoundWeek})`
            );
            setPlayoffDialogOpen(false);
            onRefresh();
        } catch (err) {
            console.error('Error generating playoff bracket:', err);
            onShowSnackbar('Failed to generate playoff bracket: ' + err.message, 'error');
        }
    };

    // ── Advance team ─────────────────────────────────────────────────
    const handleAdvanceTeam = async () => {
        if (!advanceGame || !advanceWinner) {
            onShowSnackbar('Please select a winner', 'error');
            return;
        }
        try {
            const currentRound = field(advanceGame, 'playoffRound', 'playoff_round') || 1;
            const nextRound = currentRound + 1;
            const home = field(advanceGame, 'homeTeam', 'home_team');
            const homeSeed = field(advanceGame, 'playoffHomeSeed', 'playoff_home_seed');
            const awaySeed = field(advanceGame, 'playoffAwaySeed', 'playoff_away_seed');
            const winnerSeed = advanceWinner === home ? homeSeed : awaySeed;
            const gameType = nextRound >= 5 ? 'NATIONAL_CHAMPIONSHIP' : 'PLAYOFFS';
            const nextWeek = playoffWeekForRound(nextRound);

            // R1 → R2: find existing R2 placeholder with matching bye seed
            if (currentRound === 1 && homeSeed) {
                const byeSeed = 17 - homeSeed;
                const r2Placeholder = postseasonSchedule.find(g => {
                    const pr = field(g, 'playoffRound', 'playoff_round');
                    const hs = field(g, 'playoffHomeSeed', 'playoff_home_seed');
                    return pr === 2 && hs === byeSeed;
                });

                if (r2Placeholder) {
                    await updateScheduleEntry(r2Placeholder.id, {
                        season,
                        week: nextWeek,
                        subdivision: 'FBS',
                        homeTeam: field(r2Placeholder, 'homeTeam', 'home_team'),
                        awayTeam: advanceWinner,
                        gameType: 'PLAYOFFS',
                        playoffRound: 2,
                        playoffHomeSeed: byeSeed,
                        playoffAwaySeed: winnerSeed,
                        postseasonGameLogo: CFP_LOGO_URL,
                        postseasonGameName: ROUND_LABELS[2],
                    });
                    onShowSnackbar(`${advanceWinner} (#${winnerSeed}) advances to face #${byeSeed} in ${ROUND_LABELS[2]} (Week ${nextWeek})!`);
                    setAdvanceDialogOpen(false);
                    setAdvanceGame(null);
                    setAdvanceWinner('');
                    onRefresh();
                    return;
                }
            }

            // Later rounds: determine bracket position and find the correct game
            const nextRoundGames = postseasonSchedule.filter(g => {
                const gt = field(g, 'gameType', 'game_type');
                const pr = field(g, 'playoffRound', 'playoff_round');
                return (gt === 'PLAYOFFS' || gt === 'NATIONAL_CHAMPIONSHIP') && pr === nextRound;
            });

            // Determine the bracket position of the current game
            const currentRoundGames = postseasonSchedule.filter(g => {
                const gt = field(g, 'gameType', 'game_type');
                const pr = field(g, 'playoffRound', 'playoff_round');
                return (gt === 'PLAYOFFS' || gt === 'NATIONAL_CHAMPIONSHIP') && pr === currentRound;
            });

            // Sort games by bracket position (not by seed value)
            let sortedCurrentGames;
            if (currentRound === 2) {
                // R2: Sort by position in R2_BYE_SEEDS array (bracket order)
                sortedCurrentGames = [...currentRoundGames].sort((a, b) => {
                    const sa = field(a, 'playoffHomeSeed', 'playoff_home_seed');
                    const sb = field(b, 'playoffHomeSeed', 'playoff_home_seed');
                    const idxA = R2_BYE_SEEDS.indexOf(sa);
                    const idxB = R2_BYE_SEEDS.indexOf(sb);
                    // If seed not found in R2_BYE_SEEDS, put at end
                    if (idxA === -1) return 1;
                    if (idxB === -1) return -1;
                    return idxA - idxB;
                });
            } else {
                // Other rounds: Sort by home seed (ascending)
                sortedCurrentGames = [...currentRoundGames].sort((a, b) => {
                    const sa = field(a, 'playoffHomeSeed', 'playoff_home_seed') || 99;
                    const sb = field(b, 'playoffHomeSeed', 'playoff_home_seed') || 99;
                    return sa - sb;
                });
            }

            const currentGameIndex = sortedCurrentGames.findIndex(g => g.id === advanceGame.id);
            if (currentGameIndex === -1) {
                throw new Error('Could not find current game in bracket');
            }

            // Calculate target bracket position in next round
            // R2 (8 games) → QF (4 games): bracket positions 0,1 → QF 0; 2,3 → QF 1; 4,5 → QF 2; 6,7 → QF 3
            // QF (4 games) → SF (2 games): games 0,1 → SF 0; 2,3 → SF 1
            // SF (2 games) → NCG (1 game): both games → NCG 0
            let targetNextRoundIndex;
            if (currentRound === 2) {
                // R2 → QF: pair bracket positions 0,1 → QF 0; 2,3 → QF 1; 4,5 → QF 2; 6,7 → QF 3
                targetNextRoundIndex = Math.floor(currentGameIndex / 2);
            } else if (currentRound === 3) {
                // QF → SF: pair games 0,1 → SF 0; 2,3 → SF 1
                targetNextRoundIndex = Math.floor(currentGameIndex / 2);
            } else if (currentRound === 4) {
                // SF → NCG: both games → NCG 0
                targetNextRoundIndex = 0;
            } else {
                // Fallback: use first available placeholder
                targetNextRoundIndex = null;
            }

            const isPlaceholder = (name) => !name || name === 'TBD' || name === 'OPEN';
            let targetGame = null;

            if (targetNextRoundIndex !== null) {
                // Sort next round games by home seed (ascending) to match bracket order
                const sortedNextRoundGames = [...nextRoundGames].sort((a, b) => {
                    const sa = field(a, 'playoffHomeSeed', 'playoff_home_seed') || 99;
                    const sb = field(b, 'playoffHomeSeed', 'playoff_home_seed') || 99;
                    return sa - sb;
                });

                // Find the game at the target bracket position
                if (targetNextRoundIndex < sortedNextRoundGames.length) {
                    const candidateGame = sortedNextRoundGames[targetNextRoundIndex];
                    const h = field(candidateGame, 'homeTeam', 'home_team');
                    const a = field(candidateGame, 'awayTeam', 'away_team');
                    // Only use this game if it has a placeholder slot
                    if (isPlaceholder(h) || isPlaceholder(a)) {
                        targetGame = candidateGame;
                    }
                }
            }

            // Fallback: if we couldn't find the correct bracket position, use first available placeholder
            if (!targetGame) {
                targetGame = nextRoundGames.find(g => {
                    const h = field(g, 'homeTeam', 'home_team');
                    const a = field(g, 'awayTeam', 'away_team');
                    return isPlaceholder(h) || isPlaceholder(a);
                });
            }

            if (targetGame) {
                const h = field(targetGame, 'homeTeam', 'home_team');
                const a = field(targetGame, 'awayTeam', 'away_team');
                const existingHomeSeed = field(targetGame, 'playoffHomeSeed', 'playoff_home_seed');
                const existingAwaySeed = field(targetGame, 'playoffAwaySeed', 'playoff_away_seed');

                await updateScheduleEntry(targetGame.id, {
                    season,
                    week: nextWeek,
                    subdivision: 'FBS',
                    homeTeam: isPlaceholder(h) ? advanceWinner : h,
                    awayTeam: isPlaceholder(a) ? advanceWinner : a,
                    gameType,
                    playoffRound: nextRound,
                    playoffHomeSeed: isPlaceholder(h) ? winnerSeed : existingHomeSeed,
                    playoffAwaySeed: isPlaceholder(a) ? winnerSeed : existingAwaySeed,
                    postseasonGameLogo: CFP_LOGO_URL,
                    postseasonGameName: ROUND_LABELS[nextRound],
                });
                onShowSnackbar(`${advanceWinner} advanced to ${ROUND_LABELS[nextRound] || `Round ${nextRound}`} (Week ${nextWeek})!`);
            } else {
                await createScheduleEntry({
                    season,
                    week: nextWeek,
                    subdivision: 'FBS',
                    homeTeam: advanceWinner,
                    awayTeam: 'OPEN',
                    gameType,
                    playoffRound: nextRound,
                    playoffHomeSeed: winnerSeed,
                    playoffAwaySeed: null,
                    postseasonGameLogo: CFP_LOGO_URL,
                    postseasonGameName: ROUND_LABELS[nextRound],
                });
                onShowSnackbar(`${advanceWinner} advanced to ${ROUND_LABELS[nextRound] || `Round ${nextRound}`} (Week ${nextWeek})!`);
            }

            setAdvanceDialogOpen(false);
            setAdvanceGame(null);
            setAdvanceWinner('');
            onRefresh();
        } catch (err) {
            console.error('Error advancing team:', err);
            onShowSnackbar('Failed to advance team: ' + err.message, 'error');
        }
    };

    // ── Render ───────────────────────────────────────────────────────
    return (
        <Box>
            {/* Action buttons */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, alignItems: 'center' }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setCcgConference('');
                        setCcgHome(null);
                        setCcgAway(null);
                        setCcgDialogOpen(true);
                    }}
                >
                    Add CCG
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<FinalizeIcon />}
                    onClick={handleOpenPlayoffDialog}
                >
                    {postseasonPlayoffs.length > 0 ? 'Edit Playoff Bracket' : 'Set Up Playoff Bracket'}
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => onOpenAddGameDialog('BOWL', 14)}
                >
                    Add Bowl Game
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => onOpenAddGameDialog('PLAYOFFS', null)}
                >
                    Add Playoff Game
                </Button>
            </Box>

            {postseasonLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box>
                    {/* ── Conference Championships ───────────────────────── */}
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
                        Conference Championships
                    </Typography>
                    {postseasonCCG.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                            {postseasonCCG.map(game => {
                                const home = field(game, 'homeTeam', 'home_team');
                                const away = field(game, 'awayTeam', 'away_team');
                                const finished = field(game, 'finished', 'finished');
                                const started = field(game, 'started', 'started');
                                const homeScore = field(game, 'homeScore', 'home_score');
                                const awayScore = field(game, 'awayScore', 'away_score');
                                const homeWon = finished && homeScore != null && homeScore > awayScore;
                                const awayWon = finished && awayScore != null && awayScore > homeScore;
                                return (
                                    <Paper key={game.id} sx={{ p: 2, minWidth: 280 }} elevation={2}>
                                        {/* Conference Championship Game Logo */}
                                        {field(game, 'postseasonGameLogo', 'postseason_game_logo') && (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                                                <Avatar
                                                    src={(() => { const logo = field(game, 'postseasonGameLogo', 'postseason_game_logo'); return logo.startsWith('http') ? logo : `${process.env.REACT_APP_API_URL || 'http://localhost:1313'}/images/${logo}`; })()}
                                                    sx={{ width: 80, height: 80 }}
                                                    variant="rounded"
                                                />
                                            </Box>
                                        )}
                                        <Box sx={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5,
                                            backgroundColor: homeWon ? 'rgba(5,150,105,0.08)' : 'transparent',
                                            borderRadius: 1, px: 0.5, py: 0.25,
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Avatar src={teamMap[home]?.logo} sx={{ width: 24, height: 24 }}>{home?.charAt(0)}</Avatar>
                                                <Typography variant="body2" sx={{ fontWeight: homeWon ? 700 : 600 }}>{home}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {(finished || started) && homeScore != null && (
                                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{homeScore}</Typography>
                                                )}
                                            </Box>
                                        </Box>
                                        <Box sx={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            backgroundColor: awayWon ? 'rgba(5,150,105,0.08)' : 'transparent',
                                            borderRadius: 1, px: 0.5, py: 0.25,
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Avatar src={teamMap[away]?.logo} sx={{ width: 24, height: 24 }}>{away?.charAt(0)}</Avatar>
                                                <Typography variant="body2" sx={{ fontWeight: awayWon ? 700 : 600 }}>{away}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {(finished || started) && awayScore != null && (
                                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{awayScore}</Typography>
                                                )}
                                                <IconButton size="small" color="error" onClick={() => handleDeleteGame(game.id)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    </Paper>
                                );
                            })}
                        </Box>
                    ) : (
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>No conference championship games scheduled.</Typography>
                    )}

                    <Divider sx={{ my: 3 }} />

                    {/* ── Playoff Bracket (visual bracket with admin actions) */}
                    <Postseason
                        postseasonSchedule={playoffOnlySchedule}
                        teamMap={teamMap}
                        adminMode={true}
                        onAdvanceTeam={(game) => {
                            setAdvanceGame(game);
                            setAdvanceWinner('');
                            setAdvanceDialogOpen(true);
                        }}
                        onDeleteGame={(gameId) => handleDeleteGame(gameId)}
                    />

                    <Divider sx={{ my: 3 }} />

                    {/* ── Bowl Games ─────────────────────────────────────── */}
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 2 }}>
                        Bowl Games
                    </Typography>
                    {postseasonBowls.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                            {postseasonBowls.map(game => {
                                const home = field(game, 'homeTeam', 'home_team');
                                const away = field(game, 'awayTeam', 'away_team');
                                const finished = field(game, 'finished', 'finished');
                                const started = field(game, 'started', 'started');
                                const homeScore = field(game, 'homeScore', 'home_score');
                                const awayScore = field(game, 'awayScore', 'away_score');
                                const bowlName = field(game, 'postseasonGameName', 'postseason_game_name');
                                const homeWon = finished && homeScore != null && homeScore > awayScore;
                                const awayWon = finished && awayScore != null && awayScore > homeScore;
                                return (
                                    <Paper key={game.id} sx={{ p: 2, minWidth: 280 }} elevation={2}>
                                        {/* Bowl Game Logo */}
                                        {field(game, 'postseasonGameLogo', 'postseason_game_logo') && (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                                                <Avatar
                                                    src={(() => { const logo = field(game, 'postseasonGameLogo', 'postseason_game_logo'); return logo.startsWith('http') ? logo : `${process.env.REACT_APP_API_URL || 'http://localhost:1313'}/images/${logo}`; })()}
                                                    sx={{ width: 80, height: 80 }}
                                                    variant="rounded"
                                                />
                                            </Box>
                                        )}
                                        {/* Bowl Game Name */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                                {bowlName || 'Unnamed Bowl Game'}
                                            </Typography>
                                            <IconButton size="small" color="primary" onClick={() => handleEditBowlName(game)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                        <Box sx={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5,
                                            backgroundColor: homeWon ? 'rgba(5,150,105,0.08)' : 'transparent',
                                            borderRadius: 1, px: 0.5, py: 0.25,
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Avatar src={teamMap[home]?.logo} sx={{ width: 24, height: 24 }}>{home?.charAt(0)}</Avatar>
                                                <Typography variant="body2" sx={{ fontWeight: homeWon ? 700 : 600 }}>{home}</Typography>
                                            </Box>
                                            {(finished || started) && homeScore != null && (
                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>{homeScore}</Typography>
                                            )}
                                        </Box>
                                        <Box sx={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            backgroundColor: awayWon ? 'rgba(5,150,105,0.08)' : 'transparent',
                                            borderRadius: 1, px: 0.5, py: 0.25,
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Avatar src={teamMap[away]?.logo} sx={{ width: 24, height: 24 }}>{away?.charAt(0)}</Avatar>
                                                <Typography variant="body2" sx={{ fontWeight: awayWon ? 700 : 600 }}>{away}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {(finished || started) && awayScore != null && (
                                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{awayScore}</Typography>
                                                )}
                                                <IconButton size="small" color="error" onClick={() => handleDeleteGame(game.id)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    </Paper>
                                );
                            })}
                        </Box>
                    ) : (
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>No bowl games scheduled.</Typography>
                    )}
                </Box>
            )}

            {/* ═══════════════ CCG DIALOG ═══════════════════════════════ */}
            <Dialog open={ccgDialogOpen} onClose={() => setCcgDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Conference Championship Game</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <Alert severity="info">
                            Week 13 · Conference Championship
                        </Alert>

                        <FormControl size="small" fullWidth>
                            <InputLabel>Conference</InputLabel>
                            <Select
                                value={ccgConference}
                                label="Conference"
                                onChange={(e) => {
                                    setCcgConference(e.target.value);
                                    setCcgHome(null);
                                    setCcgAway(null);
                                }}
                            >
                                {CCG_CONFERENCES.map(c => (
                                    <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Autocomplete
                            options={ccgTeams.filter(t => t.name !== ccgAway?.name)}
                            getOptionLabel={(option) => option.name || ''}
                            value={ccgHome}
                            onChange={(_, v) => setCcgHome(v)}
                            disabled={!ccgConference}
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
                            options={ccgTeams.filter(t => t.name !== ccgHome?.name)}
                            getOptionLabel={(option) => option.name || ''}
                            value={ccgAway}
                            onChange={(_, v) => setCcgAway(v)}
                            disabled={!ccgConference}
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
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCcgDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateCCG} disabled={!ccgHome || !ccgAway}>
                        Schedule CCG
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ═══════════════ PLAYOFF BRACKET DIALOG ═══════════════════ */}
            <Dialog open={playoffDialogOpen} onClose={() => setPlayoffDialogOpen(false)} maxWidth="xl" fullWidth>
                <DialogTitle>
                    {postseasonPlayoffs.length > 0
                        ? 'Edit 24-Team Playoff Bracket'
                        : 'Set Up 24-Team Playoff Bracket'
                    }
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <Alert severity="info">
                            24-team single elimination. Seeds 1-8 receive a first round bye.
                            First round: #9 vs #24, #10 vs #23, etc. Higher seed is home team.
                            R1 = Week 14, R2 = Week 15, QF = Week 16, SF = Week 17, NCG = Week 18.
                        </Alert>

                        {postseasonPlayoffs.length > 0 && (
                            <Alert severity="warning">
                                Existing playoff games will be replaced. R1 and R2 placeholder games will be regenerated.
                            </Alert>
                        )}

                        <Divider />

                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Fill in the bracket by seed (1 = best, 24 = worst)
                        </Typography>

                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Each team can only appear once. Selected teams are automatically removed from other dropdowns.
                        </Typography>

                        <Grid container spacing={1}>
                            {Array.from({ length: 24 }, (_, i) => (
                                <Grid item xs={12} sm={6} md={4} key={i}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {i < 8 && (
                                            <Chip label="BYE" size="small" color="info" variant="outlined" sx={{ minWidth: 42 }} />
                                        )}
                                        <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 30 }}>
                                            #{i + 1}
                                        </Typography>
                                        <Autocomplete
                                            options={getAvailablePlayoffTeams(i)}
                                            getOptionLabel={(option) => option.name || ''}
                                            value={playoffTeams[i]}
                                            onChange={(_, v) => {
                                                const updated = [...playoffTeams];
                                                updated[i] = v;
                                                setPlayoffTeams(updated);
                                            }}
                                            renderInput={(params) => (
                                                <TextField {...params} label={`Seed ${i + 1}`} size="small" />
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
                                            sx={{ flex: 1 }}
                                            isOptionEqualToValue={(option, value) => option.name === value?.name}
                                        />
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Bracket Preview — full bracket visualization */}
                        {previewScheduleEntries.length > 0 && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                    Bracket Preview
                                </Typography>
                                <Postseason
                                    postseasonSchedule={previewScheduleEntries}
                                    teamMap={teamMap}
                                />
                            </>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPlayoffDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleGeneratePlayoffBracket}
                        startIcon={<FinalizeIcon />}
                    >
                        {postseasonPlayoffs.length > 0 ? 'Regenerate Bracket' : 'Finalize Bracket'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ═══════════════ ADVANCE TEAM DIALOG ═════════════════════ */}
            <Dialog open={advanceDialogOpen} onClose={() => setAdvanceDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Advance Winner to Next Round</DialogTitle>
                <DialogContent>
                    {advanceGame && (() => {
                        const currentRound = field(advanceGame, 'playoffRound', 'playoff_round') || 1;
                        const nextRound = currentRound + 1;
                        const nextWeek = playoffWeekForRound(nextRound);
                        return (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                                <Alert severity="info">
                                    Select the winner to advance them to {ROUND_LABELS[nextRound] || `Round ${nextRound}`} (Week {nextWeek}).
                                </Alert>

                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    Current Game: #{field(advanceGame, 'playoffHomeSeed', 'playoff_home_seed')} {field(advanceGame, 'homeTeam', 'home_team')} vs #{field(advanceGame, 'playoffAwaySeed', 'playoff_away_seed')} {field(advanceGame, 'awayTeam', 'away_team')}
                                </Typography>

                                <FormControl size="small" fullWidth>
                                    <InputLabel>Winner</InputLabel>
                                    <Select
                                        value={advanceWinner}
                                        label="Winner"
                                        onChange={(e) => setAdvanceWinner(e.target.value)}
                                    >
                                        {field(advanceGame, 'homeTeam', 'home_team') && field(advanceGame, 'homeTeam', 'home_team') !== 'TBD' && field(advanceGame, 'homeTeam', 'home_team') !== 'OPEN' && (
                                            <MenuItem value={field(advanceGame, 'homeTeam', 'home_team')}>
                                                #{field(advanceGame, 'playoffHomeSeed', 'playoff_home_seed')} {field(advanceGame, 'homeTeam', 'home_team')}
                                            </MenuItem>
                                        )}
                                        {field(advanceGame, 'awayTeam', 'away_team') && field(advanceGame, 'awayTeam', 'away_team') !== 'TBD' && field(advanceGame, 'awayTeam', 'away_team') !== 'OPEN' && (
                                            <MenuItem value={field(advanceGame, 'awayTeam', 'away_team')}>
                                                #{field(advanceGame, 'playoffAwaySeed', 'playoff_away_seed')} {field(advanceGame, 'awayTeam', 'away_team')}
                                            </MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                            </Box>
                        );
                    })()}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAdvanceDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="primary" onClick={handleAdvanceTeam} startIcon={<AdvanceIcon />}>
                        Advance Team
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ═══════════════ EDIT BOWL GAME NAME DIALOG ═══════════════════════════════ */}
            <Dialog open={editBowlDialogOpen} onClose={() => setEditBowlDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Bowl Game</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        {editingBowlGame && (
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {field(editingBowlGame, 'homeTeam', 'home_team')} vs {field(editingBowlGame, 'awayTeam', 'away_team')}
                            </Typography>
                        )}
                        <TextField
                            label="Bowl Game Name"
                            size="small"
                            fullWidth
                            value={editingBowlName}
                            onChange={(e) => setEditingBowlName(e.target.value)}
                            placeholder="e.g., Rose Bowl, Sugar Bowl, etc."
                        />
                        <Box>
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="edit-logo-upload-button"
                                type="file"
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setUploadingLogo(true);
                                        try {
                                            const result = await uploadPostseasonLogo(file);
                                            setEditingBowlLogo(result.url);
                                            // Create preview URL
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setEditingBowlLogoPreview(reader.result);
                                            };
                                            reader.readAsDataURL(file);
                                        } catch (err) {
                                            onShowSnackbar('Failed to upload logo: ' + err.message, 'error');
                                        } finally {
                                            setUploadingLogo(false);
                                        }
                                    }
                                }}
                            />
                            <label htmlFor="edit-logo-upload-button">
                                <Button
                                    variant="outlined"
                                    component="span"
                                    startIcon={uploadingLogo ? <CircularProgress size={16} /> : <UploadIcon />}
                                    disabled={uploadingLogo}
                                    fullWidth
                                    size="small"
                                >
                                    {uploadingLogo ? 'Uploading...' : editingBowlLogo ? 'Change Logo' : 'Upload Postseason Game Logo'}
                                </Button>
                            </label>
                            {editingBowlLogoPreview && (
                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                    <Avatar
                                        src={editingBowlLogoPreview}
                                        sx={{ width: 100, height: 100 }}
                                        variant="rounded"
                                    />
                                </Box>
                            )}
                            {editingBowlLogo && !editingBowlLogoPreview && (
                                <Alert severity="info" sx={{ mt: 1 }}>
                                    Logo: {editingBowlLogo}
                                </Alert>
                            )}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setEditBowlDialogOpen(false);
                        setEditingBowlGame(null);
                        setEditingBowlName('');
                        setEditingBowlLogo(null);
                        setEditingBowlLogoPreview(null);
                    }}>Cancel</Button>
                    <Button variant="contained" color="primary" onClick={handleSaveBowlName}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PostseasonAdminTab;
