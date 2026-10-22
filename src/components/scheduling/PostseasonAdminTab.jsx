import PostseasonMatchupCard from './PostseasonMatchupCard';
import { playoffAdvancement } from '../../utils/playoffAdvancement';
import { btnPrimarySx, btnLiveSx, ctrlSx, cardGridSx } from './postseasonStyles';
import ConferenceChampionshipDialog from './ConferenceChampionshipDialog';
import PlayoffBracketDialog from './PlayoffBracketDialog';
import AdvanceWinnerDialog from './AdvanceWinnerDialog';
import EditPostseasonBowlDialog from './EditPostseasonBowlDialog';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Box, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import Panel from '../ui/Panel';
import {
    createScheduleEntry,
    createBulkScheduleEntries,
    updateScheduleEntry,
    deleteScheduleEntry,
} from '../../api/scheduleApi';
import { uploadPostseasonLogo } from '../../api/uploadApi';
import { useConferencesMap, activeConferenceList } from '../../hooks/useConferencesMap';
import Postseason from '../schedule/Postseason';
import { ROUND_LABELS, playoffWeekForRound, CFP_LOGO_URL } from '../../constants/playoffBracket';
import { camelOrSnakeField } from '../../utils/fieldHelper';
import { initialPlayoffGames } from '../../utils/initialPlayoffGames';
import { isRealTeam } from '../../utils/teamDataUtils';
import { resolveLogoUrl } from '../../utils/logoUrl';

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

    const postseasonCCG = useMemo(
        () =>
            postseasonSchedule.filter(
                (g) => camelOrSnakeField(g, 'gameType', 'game_type') === 'CONFERENCE_CHAMPIONSHIP'
            ),
        [postseasonSchedule]
    );
    const postseasonPlayoffs = useMemo(
        () =>
            postseasonSchedule.filter((g) => {
                const gt = camelOrSnakeField(g, 'gameType', 'game_type');
                return gt === 'PLAYOFFS' || gt === 'NATIONAL_CHAMPIONSHIP';
            }),
        [postseasonSchedule]
    );
    const postseasonBowls = useMemo(
        () => postseasonSchedule.filter((g) => camelOrSnakeField(g, 'gameType', 'game_type') === 'BOWL'),
        [postseasonSchedule]
    );

    const playoffOnlySchedule = postseasonPlayoffs;

    const selectedPlayoffTeamNames = useMemo(
        () => new Set(playoffTeams.filter((t) => t !== null).map((t) => t.name)),
        [playoffTeams]
    );

    const getAvailablePlayoffTeams = (seedIndex) =>
        allTeams.filter((t) => {
            if (!t.active || !isRealTeam(t)) {
                return false;
            }
            if (playoffTeams[seedIndex]?.name === t.name) {
                return true;
            }
            return !selectedPlayoffTeamNames.has(t.name);
        });

    const ccgTeams = useMemo(() => {
        if (!ccgConference) {
            return [];
        }
        return allTeams
            .filter((t) => t.conference === ccgConference && t.active && isRealTeam(t))
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }, [ccgConference, allTeams]);

    const previewScheduleEntries = useMemo(() => {
        if (!playoffTeams.some((t) => t !== null)) {
            return [];
        }
        const { firstRoundGames, secondRoundGames } = initialPlayoffGames(playoffTeams);
        return [...firstRoundGames, ...secondRoundGames].map((game, index) => ({
            id: `preview-r${game.playoffRound}-${index % 8}`,
            home_team: game.homeTeam || 'TBD',
            away_team: game.awayTeam || 'TBD',
            game_type: game.gameType,
            playoff_round: game.playoffRound,
            playoff_home_seed: game.playoffHomeSeed,
            playoff_away_seed: game.playoffAwaySeed,
            week: game.week,
        }));
    }, [playoffTeams]);

    const loadExistingBracket = () => {
        const newPlayoffTeams = Array(24).fill(null);
        postseasonPlayoffs.forEach((g) => {
            const hs = camelOrSnakeField(g, 'playoffHomeSeed', 'playoff_home_seed');
            const awaySeed = camelOrSnakeField(g, 'playoffAwaySeed', 'playoff_away_seed');
            const home = camelOrSnakeField(g, 'homeTeam', 'home_team');
            const away = camelOrSnakeField(g, 'awayTeam', 'away_team');
            if (hs && home && home !== 'TBD' && !newPlayoffTeams[hs - 1]) {
                const team = allTeams.find((t) => t.name === home);
                if (team) {
                    newPlayoffTeams[hs - 1] = team;
                }
            }
            if (awaySeed && away && away !== 'TBD' && !newPlayoffTeams[awaySeed - 1]) {
                const team = allTeams.find((t) => t.name === away);
                if (team) {
                    newPlayoffTeams[awaySeed - 1] = team;
                }
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
        setEditingBowlName(camelOrSnakeField(game, 'postseasonGameName', 'postseason_game_name') || '');
        setEditingBowlVenue(camelOrSnakeField(game, 'venue', 'venue') || '');
        const logoUrl = camelOrSnakeField(game, 'postseasonGameLogo', 'postseason_game_logo');
        setEditingBowlLogo(logoUrl || null);
        setEditingBowlLogoPreview(logoUrl ? resolveLogoUrl(logoUrl) : null);
        setEditBowlDialogOpen(true);
    };

    const handleUploadBowlLogo = async (e) => {
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
    };

    const handleCancelBowlEdit = () => {
        setEditBowlDialogOpen(false);
        setEditingBowlGame(null);
        setEditingBowlName('');
        setEditingBowlVenue('');
        setEditingBowlLogo(null);
        setEditingBowlLogoPreview(null);
    };

    const handleSaveBowlName = async () => {
        if (!editingBowlGame) {
            return;
        }
        try {
            await updateScheduleEntry(editingBowlGame.id, {
                season: editingBowlGame.season || season,
                week: camelOrSnakeField(editingBowlGame, 'week', 'week'),
                subdivision: camelOrSnakeField(editingBowlGame, 'subdivision', 'subdivision'),
                homeTeam: camelOrSnakeField(editingBowlGame, 'homeTeam', 'home_team'),
                awayTeam: camelOrSnakeField(editingBowlGame, 'awayTeam', 'away_team'),
                gameType: camelOrSnakeField(editingBowlGame, 'gameType', 'game_type'),
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
        const validTeams = playoffTeams.filter((t) => t !== null);
        if (validTeams.length !== 24) {
            onShowSnackbar(`Please fill all 24 playoff spots (${validTeams.length}/24 filled)`, 'error');
            return;
        }
        const uniqueTeams = new Set(validTeams.map((t) => t.name));
        if (uniqueTeams.size !== 24) {
            onShowSnackbar('Each team can only appear once in the bracket!', 'error');
            return;
        }

        try {
            const existingPlayoffIds = postseasonPlayoffs.map((g) => g.id).filter(Boolean);
            for (const id of existingPlayoffIds) {
                await deleteScheduleEntry(id);
            }

            const firstRoundWeek = playoffWeekForRound(1);
            const secondRoundWeek = playoffWeekForRound(2);

            const { firstRoundGames, secondRoundGames } = initialPlayoffGames(playoffTeams);
            await createBulkScheduleEntries(
                [...firstRoundGames, ...secondRoundGames].map((game) => ({
                    ...game,
                    season,
                    subdivision: 'FBS',
                    postseasonGameLogo: CFP_LOGO_URL,
                    postseasonGameName: ROUND_LABELS[game.playoffRound],
                }))
            );

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
        const plan = playoffAdvancement(game, winner, schedule || postseasonSchedule, season);
        if (plan.operation === 'update') {
            await updateScheduleEntry(plan.scheduleEntryId, plan.entry);
        } else {
            await createScheduleEntry(plan.entry);
        }
        return plan.message;
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
    const autoAdvanceSeasonRef = useRef(null);

    useEffect(() => {
        const scope = { active: true };
        autoAdvanceSeasonRef.current = scope;
        return () => {
            scope.active = false;
        };
    }, [season]);

    useEffect(() => {
        let active = true;
        const seasonScope = autoAdvanceSeasonRef.current;
        const isCurrent = () => active && seasonScope.active;
        const runAutoAdvance = async () => {
            const finishedPlayoffGames = postseasonSchedule.filter((g) => {
                const gt = camelOrSnakeField(g, 'gameType', 'game_type');
                const finished = camelOrSnakeField(g, 'finished', 'finished');
                return (gt === 'PLAYOFFS' || gt === 'NATIONAL_CHAMPIONSHIP') && finished;
            });

            let localSchedule = [...postseasonSchedule];
            let advanced = false;
            for (const game of finishedPlayoffGames) {
                if (!isCurrent()) {
                    return;
                }
                if (autoAdvancedRef.current.has(game.id)) {
                    continue;
                }

                const homeTeam = camelOrSnakeField(game, 'homeTeam', 'home_team');
                const awayTeam = camelOrSnakeField(game, 'awayTeam', 'away_team');
                const homeScore = camelOrSnakeField(game, 'homeScore', 'home_score');
                const awayScore = camelOrSnakeField(game, 'awayScore', 'away_score');
                const currentRound = camelOrSnakeField(game, 'playoffRound', 'playoff_round') || 1;
                const nextRound = currentRound + 1;

                if (homeScore == null || awayScore == null || homeScore === awayScore) {
                    continue;
                }

                const winner = homeScore > awayScore ? homeTeam : awayTeam;

                const alreadyAdvanced = localSchedule.some((g) => {
                    const pr = camelOrSnakeField(g, 'playoffRound', 'playoff_round');
                    const ht = camelOrSnakeField(g, 'homeTeam', 'home_team');
                    const at = camelOrSnakeField(g, 'awayTeam', 'away_team');
                    return pr === nextRound && (ht === winner || at === winner);
                });

                if (alreadyAdvanced) {
                    autoAdvancedRef.current.add(game.id);
                    continue;
                }

                autoAdvancedRef.current.add(game.id);
                try {
                    const msg = await advanceTeamToNextRound(game, winner, localSchedule);
                    if (!isCurrent()) {
                        return;
                    }
                    onShowSnackbar(msg);
                    advanced = true;

                    const homeSeed = camelOrSnakeField(game, 'playoffHomeSeed', 'playoff_home_seed');
                    const awaySeed = camelOrSnakeField(game, 'playoffAwaySeed', 'playoff_away_seed');
                    const winnerSeed = winner === homeTeam ? homeSeed : awaySeed;
                    localSchedule = [
                        ...localSchedule,
                        {
                            id: `pending-${game.id}`,
                            game_type: nextRound >= 5 ? 'NATIONAL_CHAMPIONSHIP' : 'PLAYOFFS',
                            playoff_round: nextRound,
                            home_team: winner,
                            away_team: 'OPEN',
                            playoff_home_seed: winnerSeed,
                            playoff_away_seed: null,
                            finished: false,
                        },
                    ];
                } catch {
                    if (isCurrent()) {
                        console.error('Auto-advance failed for game', game.id);
                    }
                    autoAdvancedRef.current.delete(game.id);
                }
            }

            if (isCurrent() && advanced) {
                onRefresh();
            }
        };

        if (postseasonSchedule.length > 0) {
            runAutoAdvance();
        }
        return () => {
            active = false;
        };
    }, [postseasonSchedule]);

    return (
        <Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '10px', mb: '16px', alignItems: 'center' }}>
                <Box
                    component="button"
                    type="button"
                    onClick={() => {
                        setCcgConference('');
                        setCcgHome(null);
                        setCcgAway(null);
                        setCcgDialogOpen(true);
                    }}
                    sx={btnPrimarySx}
                >
                    + Add CCG
                </Box>
                <Box component="button" type="button" onClick={handleOpenPlayoffDialog} sx={btnLiveSx}>
                    {postseasonPlayoffs.length > 0 ? 'Edit playoff bracket' : 'Set up playoff bracket'}
                </Box>
                <Box component="button" type="button" onClick={() => onOpenAddGameDialog('BOWL', 14)} sx={ctrlSx}>
                    + Add bowl game
                </Box>
                <Box component="button" type="button" onClick={() => onOpenAddGameDialog('PLAYOFFS', null)} sx={ctrlSx}>
                    + Add playoff game
                </Box>
            </Box>

            {postseasonLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box>
                    <Panel header="Conference championships" sx={{ mb: '16px' }}>
                        {postseasonCCG.length > 0 ? (
                            <Box sx={cardGridSx}>
                                {postseasonCCG.map((game) => (
                                    <PostseasonMatchupCard
                                        key={game.id}
                                        game={game}
                                        teamMap={teamMap}
                                        onDelete={handleDeleteGame}
                                    />
                                ))}
                            </Box>
                        ) : (
                            <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>
                                No conference championship games scheduled.
                            </Box>
                        )}
                    </Panel>

                    <Panel header="Playoff bracket" sx={{ mb: '16px' }}>
                        <Box sx={{ p: '16px' }}>
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
                        </Box>
                    </Panel>

                    <Panel header="Bowl games">
                        {postseasonBowls.length > 0 ? (
                            <Box sx={cardGridSx}>
                                {postseasonBowls.map((game) => (
                                    <PostseasonMatchupCard
                                        key={game.id}
                                        game={game}
                                        teamMap={teamMap}
                                        showEdit
                                        onEdit={handleEditBowlName}
                                        onDelete={handleDeleteGame}
                                    />
                                ))}
                            </Box>
                        ) : (
                            <Box sx={{ p: 3, textAlign: 'center', color: 'var(--text-muted)' }}>
                                No bowl games scheduled.
                            </Box>
                        )}
                    </Panel>
                </Box>
            )}

            <ConferenceChampionshipDialog
                open={ccgDialogOpen}
                onClose={() => setCcgDialogOpen(false)}
                conference={ccgConference}
                onConferenceChange={setCcgConference}
                onHomeChange={setCcgHome}
                onAwayChange={setCcgAway}
                conferences={CCG_CONFERENCES}
                teams={ccgTeams}
                awayTeam={ccgAway}
                homeTeam={ccgHome}
                teamMap={teamMap}
                onSubmit={handleCreateCCG}
            />

            <PlayoffBracketDialog
                open={playoffDialogOpen}
                onClose={() => setPlayoffDialogOpen(false)}
                existingGames={postseasonPlayoffs}
                getAvailableTeams={getAvailablePlayoffTeams}
                teams={playoffTeams}
                onTeamsChange={setPlayoffTeams}
                teamMap={teamMap}
                previewScheduleEntries={previewScheduleEntries}
                onSubmit={handleGeneratePlayoffBracket}
            />

            <AdvanceWinnerDialog
                open={advanceDialogOpen}
                onClose={() => setAdvanceDialogOpen(false)}
                game={advanceGame}
                winner={advanceWinner}
                onWinnerChange={setAdvanceWinner}
                onSubmit={handleAdvanceTeam}
            />

            <EditPostseasonBowlDialog
                open={editBowlDialogOpen}
                onClose={() => setEditBowlDialogOpen(false)}
                game={editingBowlGame}
                name={editingBowlName}
                onNameChange={setEditingBowlName}
                venueNames={venueNames}
                venue={editingBowlVenue}
                onVenueChange={setEditingBowlVenue}
                uploading={uploadingLogo}
                logo={editingBowlLogo}
                logoPreview={editingBowlLogoPreview}
                onUpload={handleUploadBowlLogo}
                onCancel={handleCancelBowlEdit}
                onSubmit={handleSaveBowlName}
            />
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
