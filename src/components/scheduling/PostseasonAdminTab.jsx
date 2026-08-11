import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    Box,
    Grid,
    TextField,
    Autocomplete,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    CircularProgress,
    Divider,
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import PropTypes from 'prop-types';
import Panel from '../ui/Panel';
import TeamMark from '../ui/TeamMark';
import { createScheduleEntry, updateScheduleEntry, deleteScheduleEntry } from '../../api/scheduleApi';
import { uploadPostseasonLogo } from '../../api/uploadApi';
import { useConferencesMap, activeConferenceList } from '../constants/conferences';
import Postseason from '../schedule/Postseason';
import { R2_BYE_SEEDS, QF_SEED_GROUPS, SF_SEED_GROUPS, ROUND_LABELS, playoffWeekForRound, CFP_LOGO_URL } from '../constants/playoffBracket';
import { field } from '../../utils/fieldHelper';
import { isRealTeam } from '../../utils/teamDataUtils';
import { resolveLogoUrl } from '../../utils/logoUrl';

const btnPrimarySx = { border: 0, background: 'var(--brand-deep)', color: '#fff', borderRadius: 'var(--r-sm)', px: '14px', py: '9px', font: 'inherit', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' };
const btnLiveSx = { border: 0, background: 'var(--live)', color: '#fff', borderRadius: 'var(--r-sm)', px: '14px', py: '9px', font: 'inherit', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' };
const ctrlSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text-muted)', borderRadius: 'var(--r-sm)', px: '14px', py: '9px', font: 'inherit', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', '&:hover': { borderColor: 'var(--brand)', color: 'var(--text)' } };
const cardGridSx = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px', padding: '16px' };
const cardSx = { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r)', overflow: 'hidden' };
const teamRowSx = (won) => ({ display: 'flex', alignItems: 'center', gap: '8px', px: '12px', py: '7px', background: won ? 'color-mix(in srgb, var(--field) 10%, transparent)' : 'transparent', borderBottom: '1px solid var(--line-soft)', '&:last-of-type': { borderBottom: 0 } });
const removeXSx = { border: 0, background: 'transparent', color: 'var(--live)', cursor: 'pointer', fontSize: '0.95rem', ml: 'auto' };
const labelSx = { display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: 'var(--text-dim)', mb: '5px' };
const inputSx = { border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.82rem', width: '100%' };
const selectSx = { border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 'var(--r-sm)', px: '10px', height: '38px', boxSizing: 'border-box', font: 'inherit', fontSize: '0.82rem', cursor: 'pointer', width: '100%', '& option': { background: 'var(--surface)', color: 'var(--text)' } };
const dialogPaperSx = { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)' };
const dialogTitleSx = { color: 'var(--text)', fontWeight: 800, fontSize: '1.05rem' };
const autocompleteSx = { '& .MuiOutlinedInput-root': { borderRadius: 'var(--r-sm)' } };

const PostseasonAdminTab = ({
    season,
    postseasonSchedule = [],
    postseasonLoading = false,
    allTeams = [],
    teamMap = {},
    venueNames = [],
    onRefresh,
    onShowSnackbar,
    onOpenAddGameDialog,
}) => {
    useConferencesMap();
    const CCG_CONFERENCES = activeConferenceList().filter((c) => c.code !== 'FBS_INDEPENDENT');
    const [playoffTeams, setPlayoffTeams] = useState(Array(24).fill(null));
    const [playoffDialogOpen, setPlayoffDialogOpen] = useState(false);

    const [advanceDialogOpen, setAdvanceDialogOpen] = useState(false);
    const [advanceGame, setAdvanceGame] = useState(null);
    const [advanceWinner, setAdvanceWinner] = useState('');

    const [editBowlDialogOpen, setEditBowlDialogOpen] = useState(false);
    const [editingBowlGame, setEditingBowlGame] = useState(null);
    const [editingBowlName, setEditingBowlName] = useState('');
    const [editingBowlVenue, setEditingBowlVenue] = useState('');
    const [editingBowlLogo, setEditingBowlLogo] = useState(null);
    const [editingBowlLogoPreview, setEditingBowlLogoPreview] = useState(null);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    const [ccgDialogOpen, setCcgDialogOpen] = useState(false);
    const [ccgConference, setCcgConference] = useState('');
    const [ccgHome, setCcgHome] = useState(null);
    const [ccgAway, setCcgAway] = useState(null);

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

    const playoffOnlySchedule = postseasonPlayoffs;

    const selectedPlayoffTeamNames = useMemo(() =>
        new Set(playoffTeams.filter(t => t !== null).map(t => t.name)),
        [playoffTeams]
    );

    const getAvailablePlayoffTeams = (seedIndex) =>
        allTeams.filter(t => {
            if (!t.active || !isRealTeam(t)) return false;
            if (playoffTeams[seedIndex]?.name === t.name) return true;
            return !selectedPlayoffTeamNames.has(t.name);
        });

    const ccgTeams = useMemo(() => {
        if (!ccgConference) return [];
        return allTeams
            .filter(t => t.conference === ccgConference && t.active && isRealTeam(t))
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }, [ccgConference, allTeams]);

    const previewScheduleEntries = useMemo(() => {
        if (!playoffTeams.some(t => t !== null)) return [];
        const entries = [];

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

    const handleEditBowlName = (game) => {
        setEditingBowlGame(game);
        setEditingBowlName(field(game, 'postseasonGameName', 'postseason_game_name') || '');
        setEditingBowlVenue(field(game, 'venue', 'venue') || '');
        const logoUrl = field(game, 'postseasonGameLogo', 'postseason_game_logo');
        setEditingBowlLogo(logoUrl || null);
        setEditingBowlLogoPreview(logoUrl ? resolveLogoUrl(logoUrl) : null);
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
                neutralSite: true,
                venue: editingBowlVenue.trim() || null,
            });
            onShowSnackbar('Bowl game updated successfully');
            setEditBowlDialogOpen(false);
            setEditingBowlGame(null);
            setEditingBowlName('');
            setEditingBowlVenue('');
            setEditingBowlLogo(null);
            setEditingBowlLogoPreview(null);
            onRefresh();
        } catch (err) {
            console.error('Error updating bowl game:', err);
            onShowSnackbar('Failed to update bowl game: ' + err.message, 'error');
        }
    };

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
            const existingPlayoffIds = postseasonPlayoffs.map(g => g.id).filter(Boolean);
            for (const id of existingPlayoffIds) {
                await deleteScheduleEntry(id);
            }

            const firstRoundWeek = playoffWeekForRound(1);
            const secondRoundWeek = playoffWeekForRound(2);

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

    const advanceTeamToNextRound = async (game, winner, schedule) => {
        const sched = schedule || postseasonSchedule;
        const currentRound = field(game, 'playoffRound', 'playoff_round') || 1;
        const nextRound = currentRound + 1;
        const home = field(game, 'homeTeam', 'home_team');
        const homeSeed = field(game, 'playoffHomeSeed', 'playoff_home_seed');
        const awaySeed = field(game, 'playoffAwaySeed', 'playoff_away_seed');
        const winnerSeed = winner === home ? homeSeed : awaySeed;
        const gameType = nextRound >= 5 ? 'NATIONAL_CHAMPIONSHIP' : 'PLAYOFFS';
        const nextWeek = playoffWeekForRound(nextRound);

        if (currentRound === 1 && homeSeed) {
            const byeSeed = 17 - homeSeed;
            const r2Placeholder = sched.find(g => {
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
                    awayTeam: winner,
                    gameType: 'PLAYOFFS',
                    playoffRound: 2,
                    playoffHomeSeed: byeSeed,
                    playoffAwaySeed: winnerSeed,
                    postseasonGameLogo: CFP_LOGO_URL,
                    postseasonGameName: ROUND_LABELS[2],
                });
                return `${winner} (#${winnerSeed}) advances to face #${byeSeed} in ${ROUND_LABELS[2]} (Week ${nextWeek})!`;
            }
        }

        const nextRoundGames = sched.filter(g => {
            const gt = field(g, 'gameType', 'game_type');
            const pr = field(g, 'playoffRound', 'playoff_round');
            return (gt === 'PLAYOFFS' || gt === 'NATIONAL_CHAMPIONSHIP') && pr === nextRound;
        });

        const isPlaceholder = (name) => !name || name === 'TBD' || name === 'OPEN';
        let targetGame = null;

        if (currentRound === 2) {
            const qfGroupIndex = QF_SEED_GROUPS.findIndex(group => group.includes(winnerSeed));
            if (qfGroupIndex !== -1) {
                const groupSeeds = QF_SEED_GROUPS[qfGroupIndex];
                targetGame = nextRoundGames.find(g => {
                    const h = field(g, 'homeTeam', 'home_team');
                    const a = field(g, 'awayTeam', 'away_team');
                    const hs = field(g, 'playoffHomeSeed', 'playoff_home_seed');
                    const as = field(g, 'playoffAwaySeed', 'playoff_away_seed');
                    return (isPlaceholder(h) || isPlaceholder(a)) &&
                           (groupSeeds.includes(hs) || groupSeeds.includes(as));
                });
            }
        } else if (currentRound === 3) {
            const sfGroupIndex = SF_SEED_GROUPS.findIndex(group => group.includes(winnerSeed));
            if (sfGroupIndex !== -1) {
                const groupSeeds = SF_SEED_GROUPS[sfGroupIndex];
                targetGame = nextRoundGames.find(g => {
                    const h = field(g, 'homeTeam', 'home_team');
                    const a = field(g, 'awayTeam', 'away_team');
                    const hs = field(g, 'playoffHomeSeed', 'playoff_home_seed');
                    const as = field(g, 'playoffAwaySeed', 'playoff_away_seed');
                    return (isPlaceholder(h) || isPlaceholder(a)) &&
                           (groupSeeds.includes(hs) || groupSeeds.includes(as));
                });
            }
        } else if (currentRound === 4) {
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
                homeTeam: isPlaceholder(h) ? winner : h,
                awayTeam: isPlaceholder(a) ? winner : a,
                gameType,
                playoffRound: nextRound,
                playoffHomeSeed: isPlaceholder(h) ? winnerSeed : existingHomeSeed,
                playoffAwaySeed: isPlaceholder(a) ? winnerSeed : existingAwaySeed,
                postseasonGameLogo: CFP_LOGO_URL,
                postseasonGameName: ROUND_LABELS[nextRound],
            });
        } else {
            await createScheduleEntry({
                season,
                week: nextWeek,
                subdivision: 'FBS',
                homeTeam: winner,
                awayTeam: 'OPEN',
                gameType,
                playoffRound: nextRound,
                playoffHomeSeed: winnerSeed,
                playoffAwaySeed: null,
                postseasonGameLogo: CFP_LOGO_URL,
                postseasonGameName: ROUND_LABELS[nextRound],
            });
        }

        return `${winner} advanced to ${ROUND_LABELS[nextRound] || `Round ${nextRound}`} (Week ${nextWeek})!`;
    };

    const handleAdvanceTeam = async () => {
        if (!advanceGame || !advanceWinner) {
            onShowSnackbar('Please select a winner', 'error');
            return;
        }
        try {
            const msg = await advanceTeamToNextRound(advanceGame, advanceWinner);
            onShowSnackbar(msg);
            setAdvanceDialogOpen(false);
            setAdvanceGame(null);
            setAdvanceWinner('');
            onRefresh();
        } catch (err) {
            console.error('Error advancing team:', err);
            onShowSnackbar('Failed to advance team: ' + err.message, 'error');
        }
    };

    const autoAdvancedRef = useRef(new Set());

    useEffect(() => {
        const runAutoAdvance = async () => {
            const finishedPlayoffGames = postseasonSchedule.filter(g => {
                const gt = field(g, 'gameType', 'game_type');
                const finished = field(g, 'finished', 'finished');
                return (gt === 'PLAYOFFS' || gt === 'NATIONAL_CHAMPIONSHIP') && finished;
            });

            let localSchedule = [...postseasonSchedule];
            let advanced = false;
            for (const game of finishedPlayoffGames) {
                if (autoAdvancedRef.current.has(game.id)) continue;

                const homeTeam = field(game, 'homeTeam', 'home_team');
                const awayTeam = field(game, 'awayTeam', 'away_team');
                const homeScore = field(game, 'homeScore', 'home_score');
                const awayScore = field(game, 'awayScore', 'away_score');
                const currentRound = field(game, 'playoffRound', 'playoff_round') || 1;
                const nextRound = currentRound + 1;

                if (homeScore == null || awayScore == null || homeScore === awayScore) continue;

                const winner = homeScore > awayScore ? homeTeam : awayTeam;

                const alreadyAdvanced = localSchedule.some(g => {
                    const pr = field(g, 'playoffRound', 'playoff_round');
                    const ht = field(g, 'homeTeam', 'home_team');
                    const at = field(g, 'awayTeam', 'away_team');
                    return pr === nextRound && (ht === winner || at === winner);
                });

                if (alreadyAdvanced) {
                    autoAdvancedRef.current.add(game.id);
                    continue;
                }

                autoAdvancedRef.current.add(game.id);
                try {
                    const msg = await advanceTeamToNextRound(game, winner, localSchedule);
                    onShowSnackbar(msg);
                    advanced = true;

                    const homeSeed = field(game, 'playoffHomeSeed', 'playoff_home_seed');
                    const awaySeed = field(game, 'playoffAwaySeed', 'playoff_away_seed');
                    const winnerSeed = winner === homeTeam ? homeSeed : awaySeed;
                    localSchedule = [...localSchedule, {
                        id: `pending-${game.id}`,
                        game_type: nextRound >= 5 ? 'NATIONAL_CHAMPIONSHIP' : 'PLAYOFFS',
                        playoff_round: nextRound,
                        home_team: winner,
                        away_team: 'OPEN',
                        playoff_home_seed: winnerSeed,
                        playoff_away_seed: null,
                        finished: false,
                    }];
                } catch (err) {
                    console.error('Auto-advance failed for game', game.id, err);
                    autoAdvancedRef.current.delete(game.id);
                }
            }

            if (advanced) {
                onRefresh();
            }
        };

        if (postseasonSchedule.length > 0) {
            runAutoAdvance();
        }
    }, [postseasonSchedule]);

    const renderMatchupCard = (game, { showEdit } = {}) => {
        const home = field(game, 'homeTeam', 'home_team');
        const away = field(game, 'awayTeam', 'away_team');
        const finished = field(game, 'finished', 'finished');
        const started = field(game, 'started', 'started');
        const homeScore = field(game, 'homeScore', 'home_score');
        const awayScore = field(game, 'awayScore', 'away_score');
        const logo = field(game, 'postseasonGameLogo', 'postseason_game_logo');
        const bowlName = field(game, 'postseasonGameName', 'postseason_game_name');
        const homeWon = finished && homeScore != null && homeScore > awayScore;
        const awayWon = finished && awayScore != null && awayScore > homeScore;

        return (
            <Box key={game.id} sx={cardSx}>
                {(logo || showEdit) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', px: '12px', py: '9px', borderBottom: '1px solid var(--line-soft)', background: 'var(--surface-2)' }}>
                        {logo && <Avatar src={resolveLogoUrl(logo)} variant="rounded" sx={{ width: 28, height: 28 }} />}
                        {showEdit && <Box sx={{ fontWeight: 700, fontSize: '0.82rem' }}>{bowlName || 'Unnamed bowl game'}</Box>}
                        {showEdit && <Box component="button" type="button" onClick={() => handleEditBowlName(game)} sx={{ ...removeXSx, color: 'var(--brand)', fontSize: '0.72rem', fontWeight: 700 }}>Edit</Box>}
                    </Box>
                )}
                <Box sx={teamRowSx(homeWon)}>
                    <TeamMark team={teamMap[home] || { name: home }} size={22} />
                    <Box sx={{ fontWeight: homeWon ? 800 : 600, fontSize: '0.85rem' }}>{home}</Box>
                    {(finished || started) && homeScore != null && <Box sx={{ ml: 'auto', fontFamily: 'var(--cond)', fontWeight: 800 }}>{homeScore}</Box>}
                </Box>
                <Box sx={teamRowSx(awayWon)}>
                    <TeamMark team={teamMap[away] || { name: away }} size={22} />
                    <Box sx={{ fontWeight: awayWon ? 800 : 600, fontSize: '0.85rem' }}>{away}</Box>
                    {(finished || started) && awayScore != null && <Box sx={{ ml: 'auto', fontFamily: 'var(--cond)', fontWeight: 800 }}>{awayScore}</Box>}
                    <Box component="button" type="button" onClick={() => handleDeleteGame(game.id)} sx={removeXSx}>&times;</Box>
                </Box>
            </Box>
        );
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '10px', mb: '16px', alignItems: 'center' }}>
                <Box component="button" type="button" onClick={() => { setCcgConference(''); setCcgHome(null); setCcgAway(null); setCcgDialogOpen(true); }} sx={btnPrimarySx}>+ Add CCG</Box>
                <Box component="button" type="button" onClick={handleOpenPlayoffDialog} sx={btnLiveSx}>
                    {postseasonPlayoffs.length > 0 ? 'Edit playoff bracket' : 'Set up playoff bracket'}
                </Box>
                <Box component="button" type="button" onClick={() => onOpenAddGameDialog('BOWL', 14)} sx={ctrlSx}>+ Add bowl game</Box>
                <Box component="button" type="button" onClick={() => onOpenAddGameDialog('PLAYOFFS', null)} sx={ctrlSx}>+ Add playoff game</Box>
            </Box>

            {postseasonLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
            ) : (
                <Box>
                    <Panel header="Conference championships" sx={{ mb: '16px' }}>
                        {postseasonCCG.length > 0 ? (
                            <Box sx={cardGridSx}>{postseasonCCG.map((game) => renderMatchupCard(game))}</Box>
                        ) : (
                            <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>No conference championship games scheduled.</Box>
                        )}
                    </Panel>

                    <Panel header="Playoff bracket" sx={{ mb: '16px' }}>
                        <Box sx={{ p: '16px' }}>
                            <Postseason
                                postseasonSchedule={playoffOnlySchedule}
                                teamMap={teamMap}
                                adminMode={true}
                                onAdvanceTeam={(game) => { setAdvanceGame(game); setAdvanceWinner(''); setAdvanceDialogOpen(true); }}
                                onDeleteGame={(gameId) => handleDeleteGame(gameId)}
                            />
                        </Box>
                    </Panel>

                    <Panel header="Bowl games">
                        {postseasonBowls.length > 0 ? (
                            <Box sx={cardGridSx}>{postseasonBowls.map((game) => renderMatchupCard(game, { showEdit: true }))}</Box>
                        ) : (
                            <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>No bowl games scheduled.</Box>
                        )}
                    </Panel>
                </Box>
            )}

            <Dialog open={ccgDialogOpen} onClose={() => setCcgDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: dialogPaperSx }}>
                <DialogTitle sx={dialogTitleSx}>Add Conference Championship Game</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', mt: '6px' }}>
                        <Alert severity="info">
                            Week 13 · Conference Championship
                        </Alert>

                        <Box>
                            <Box component="label" sx={labelSx}>Conference</Box>
                            <Box
                                component="select"
                                value={ccgConference}
                                onChange={(e) => {
                                    setCcgConference(e.target.value);
                                    setCcgHome(null);
                                    setCcgAway(null);
                                }}
                                sx={selectSx}
                            >
                                <option value="">Select conference...</option>
                                {CCG_CONFERENCES.map(c => (
                                    <option key={c.code} value={c.code}>{c.label}</option>
                                ))}
                            </Box>
                        </Box>

                        <Autocomplete
                            options={ccgTeams.filter(t => t.name !== ccgAway?.name)}
                            getOptionLabel={(option) => option.name || ''}
                            value={ccgHome}
                            onChange={(_, v) => setCcgHome(v)}
                            disabled={!ccgConference}
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
                            options={ccgTeams.filter(t => t.name !== ccgHome?.name)}
                            getOptionLabel={(option) => option.name || ''}
                            value={ccgAway}
                            onChange={(_, v) => setCcgAway(v)}
                            disabled={!ccgConference}
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
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: '20px', pb: '18px' }}>
                    <Box component="button" type="button" onClick={() => setCcgDialogOpen(false)} sx={ctrlSx}>Cancel</Box>
                    <Box component="button" type="button" onClick={handleCreateCCG} disabled={!ccgHome || !ccgAway} sx={{ ...btnPrimarySx, opacity: (!ccgHome || !ccgAway) ? 0.6 : 1, pointerEvents: (!ccgHome || !ccgAway) ? 'none' : 'auto' }}>
                        Schedule CCG
                    </Box>
                </DialogActions>
            </Dialog>

            <Dialog open={playoffDialogOpen} onClose={() => setPlayoffDialogOpen(false)} maxWidth="xl" fullWidth PaperProps={{ sx: dialogPaperSx }}>
                <DialogTitle sx={dialogTitleSx}>
                    {postseasonPlayoffs.length > 0
                        ? 'Edit 24-Team Playoff Bracket'
                        : 'Set Up 24-Team Playoff Bracket'
                    }
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', mt: '6px' }}>
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

                        <Box sx={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text)' }}>
                            Fill in the bracket by seed (1 = best, 24 = worst)
                        </Box>

                        <Box sx={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                            Each team can only appear once. Selected teams are automatically removed from other dropdowns.
                        </Box>

                        <Grid container spacing={1}>
                            {Array.from({ length: 24 }, (_, i) => (
                                <Grid item xs={12} sm={6} md={4} key={i}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {i < 8 && (
                                            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 42, height: 22, border: '1px solid var(--brand)', color: 'var(--brand)', borderRadius: 'var(--r-sm)', fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.05em' }}>BYE</Box>
                                        )}
                                        <Box component="span" sx={{ fontWeight: 700, minWidth: 30, fontSize: '0.85rem', color: 'var(--text)' }}>
                                            #{i + 1}
                                        </Box>
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
                                                        <TeamMark team={teamMap[option.name] || { name: option.name, abbreviation: option.abbreviation }} size={20} />
                                                        <Box component="span" sx={{ fontSize: '0.85rem' }}>{option.name}</Box>
                                                    </Box>
                                                );
                                            }}
                                            sx={{ ...autocompleteSx, flex: 1 }}
                                            isOptionEqualToValue={(option, value) => option.name === value?.name}
                                        />
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>

                        {previewScheduleEntries.length > 0 && (
                            <>
                                <Divider sx={{ my: '10px' }} />
                                <Box sx={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text)', mb: '4px' }}>
                                    Bracket Preview
                                </Box>
                                <Postseason
                                    postseasonSchedule={previewScheduleEntries}
                                    teamMap={teamMap}
                                />
                            </>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: '20px', pb: '18px' }}>
                    <Box component="button" type="button" onClick={() => setPlayoffDialogOpen(false)} sx={ctrlSx}>Cancel</Box>
                    <Box component="button" type="button" onClick={handleGeneratePlayoffBracket} sx={btnLiveSx}>
                        {postseasonPlayoffs.length > 0 ? 'Regenerate Bracket' : 'Finalize Bracket'}
                    </Box>
                </DialogActions>
            </Dialog>

            <Dialog open={advanceDialogOpen} onClose={() => setAdvanceDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: dialogPaperSx }}>
                <DialogTitle sx={dialogTitleSx}>Advance Winner to Next Round</DialogTitle>
                <DialogContent>
                    {advanceGame && (() => {
                        const currentRound = field(advanceGame, 'playoffRound', 'playoff_round') || 1;
                        const nextRound = currentRound + 1;
                        const nextWeek = playoffWeekForRound(nextRound);
                        return (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', mt: '6px' }}>
                                <Alert severity="info">
                                    Select the winner to advance them to {ROUND_LABELS[nextRound] || `Round ${nextRound}`} (Week {nextWeek}).
                                </Alert>

                                <Box sx={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)' }}>
                                    Current Game: #{field(advanceGame, 'playoffHomeSeed', 'playoff_home_seed')} {field(advanceGame, 'homeTeam', 'home_team')} vs #{field(advanceGame, 'playoffAwaySeed', 'playoff_away_seed')} {field(advanceGame, 'awayTeam', 'away_team')}
                                </Box>

                                <Box>
                                    <Box component="label" sx={labelSx}>Winner</Box>
                                    <Box component="select" value={advanceWinner} onChange={(e) => setAdvanceWinner(e.target.value)} sx={selectSx}>
                                        <option value="">Select winner...</option>
                                        {field(advanceGame, 'homeTeam', 'home_team') && field(advanceGame, 'homeTeam', 'home_team') !== 'TBD' && field(advanceGame, 'homeTeam', 'home_team') !== 'OPEN' && (
                                            <option value={field(advanceGame, 'homeTeam', 'home_team')}>
                                                #{field(advanceGame, 'playoffHomeSeed', 'playoff_home_seed')} {field(advanceGame, 'homeTeam', 'home_team')}
                                            </option>
                                        )}
                                        {field(advanceGame, 'awayTeam', 'away_team') && field(advanceGame, 'awayTeam', 'away_team') !== 'TBD' && field(advanceGame, 'awayTeam', 'away_team') !== 'OPEN' && (
                                            <option value={field(advanceGame, 'awayTeam', 'away_team')}>
                                                #{field(advanceGame, 'playoffAwaySeed', 'playoff_away_seed')} {field(advanceGame, 'awayTeam', 'away_team')}
                                            </option>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        );
                    })()}
                </DialogContent>
                <DialogActions sx={{ px: '20px', pb: '18px' }}>
                    <Box component="button" type="button" onClick={() => setAdvanceDialogOpen(false)} sx={ctrlSx}>Cancel</Box>
                    <Box component="button" type="button" onClick={handleAdvanceTeam} sx={btnPrimarySx}>
                        Advance Team
                    </Box>
                </DialogActions>
            </Dialog>

            <Dialog open={editBowlDialogOpen} onClose={() => setEditBowlDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: dialogPaperSx }}>
                <DialogTitle sx={dialogTitleSx}>Edit Bowl Game</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px', mt: '6px' }}>
                        {editingBowlGame && (
                            <Box sx={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                                {field(editingBowlGame, 'homeTeam', 'home_team')} vs {field(editingBowlGame, 'awayTeam', 'away_team')}
                            </Box>
                        )}
                        <Box>
                            <Box component="label" sx={labelSx}>Bowl game name</Box>
                            <Box component="input" value={editingBowlName} onChange={(e) => setEditingBowlName(e.target.value)} placeholder="e.g., Rose Bowl, Sugar Bowl, etc." sx={inputSx} />
                        </Box>
                        <Box>
                            <Box component="label" sx={labelSx}>Venue</Box>
                            <Autocomplete
                                freeSolo
                                options={venueNames}
                                inputValue={editingBowlVenue}
                                onInputChange={(_, v) => setEditingBowlVenue(v || '')}
                                sx={autocompleteSx}
                                renderInput={(params) => (
                                    <TextField {...params} size="small" placeholder="e.g., Mercedes-Benz Stadium, Atlanta, GA" />
                                )}
                            />
                        </Box>
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
                            <Box component="label" htmlFor="edit-logo-upload-button" sx={{ ...ctrlSx, width: '100%', justifyContent: 'center', gap: '8px', opacity: uploadingLogo ? 0.6 : 1, pointerEvents: uploadingLogo ? 'none' : 'auto' }}>
                                {uploadingLogo ? <CircularProgress size={14} /> : <UploadIcon sx={{ fontSize: 16 }} />}
                                {uploadingLogo ? 'Uploading...' : editingBowlLogo ? 'Change Logo' : 'Upload Postseason Game Logo'}
                            </Box>
                            {editingBowlLogoPreview && (
                                <Box sx={{ mt: '12px', display: 'flex', justifyContent: 'center' }}>
                                    <Avatar
                                        src={editingBowlLogoPreview}
                                        sx={{ width: 100, height: 100 }}
                                        variant="rounded"
                                    />
                                </Box>
                            )}
                            {editingBowlLogo && !editingBowlLogoPreview && (
                                <Alert severity="info" sx={{ mt: '8px' }}>
                                    Logo: {editingBowlLogo}
                                </Alert>
                            )}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: '20px', pb: '18px' }}>
                    <Box component="button" type="button" onClick={() => {
                        setEditBowlDialogOpen(false);
                        setEditingBowlGame(null);
                        setEditingBowlName('');
                        setEditingBowlVenue('');
                        setEditingBowlLogo(null);
                        setEditingBowlLogoPreview(null);
                    }} sx={ctrlSx}>Cancel</Box>
                    <Box component="button" type="button" onClick={handleSaveBowlName} sx={btnPrimarySx}>
                        Save
                    </Box>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

PostseasonAdminTab.propTypes = {
    season: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    postseasonSchedule: PropTypes.array,
    postseasonLoading: PropTypes.bool,
    allTeams: PropTypes.array,
    teamMap: PropTypes.object,
    venueNames: PropTypes.arrayOf(PropTypes.string),
    onRefresh: PropTypes.func.isRequired,
    onShowSnackbar: PropTypes.func.isRequired,
    onOpenAddGameDialog: PropTypes.func.isRequired,
};

export default PostseasonAdminTab;
