import React, { useMemo } from 'react';
import { Box, Typography, Paper, Avatar, CircularProgress, useTheme, IconButton, Tooltip } from '@mui/material';
import { ArrowForward as ArrowForwardIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import BracketMatchup from './BracketMatchup';
import { R2_BYE_SEEDS, R1_GAMES, R2_OPPONENT_R1, playoffWeekForRound, QF_SEED_GROUPS, SF_SEED_GROUPS } from '../constants/playoffBracket';
import { field } from '../../utils/fieldHelper';
import { conferences } from '../constants/conferences';
import { formatConferenceName } from '../../utils/conferenceUtils';

// ─── Component ──────────────────────────────────────────────────────
const Postseason = ({
    postseasonSchedule = [],
    teamMap = {},
    loading = false,
    adminMode = false,
    onAdvanceTeam,
    onDeleteGame,
}) => {
    const navigate = useNavigate();
    const theme = useTheme();

    // ── Categorize games ────────────────────────────────────────────
    const playoffGames = useMemo(() =>
        postseasonSchedule.filter(g => {
            const gt = field(g, 'gameType', 'game_type');
            return gt === 'PLAYOFFS' || gt === 'NATIONAL_CHAMPIONSHIP';
        }), [postseasonSchedule]);

    const ccgGames = useMemo(() =>
        postseasonSchedule.filter(g => field(g, 'gameType', 'game_type') === 'CONFERENCE_CHAMPIONSHIP'),
        [postseasonSchedule]);

    const bowlGames = useMemo(() =>
        postseasonSchedule.filter(g => field(g, 'gameType', 'game_type') === 'BOWL'),
        [postseasonSchedule]);

    // ── Group playoff games by round ────────────────────────────────
    const gamesByRound = useMemo(() => {
        const rounds = {};
        playoffGames.forEach(g => {
            const r = field(g, 'playoffRound', 'playoff_round') || 0;
            if (!rounds[r]) rounds[r] = [];
            rounds[r].push(g);
        });
        return rounds;
    }, [playoffGames]);

    // ── Build seed → team name mapping from all playoff game data ───
    const seedToTeam = useMemo(() => {
        const mapping = {};
        playoffGames.forEach(g => {
            const hs = field(g, 'playoffHomeSeed', 'playoff_home_seed');
            const as_ = field(g, 'playoffAwaySeed', 'playoff_away_seed');
            const home = field(g, 'homeTeam', 'home_team');
            const away = field(g, 'awayTeam', 'away_team');
            if (hs && home && home !== 'TBD' && home !== 'OPEN') mapping[hs] = home;
            if (as_ && away && away !== 'TBD' && away !== 'OPEN') mapping[as_] = away;
        });
        return mapping;
    }, [playoffGames]);

    // ── Finders ─────────────────────────────────────────────────────
    const findR1Game = (highSeed, lowSeed) =>
        (gamesByRound[1] || []).find(g => {
            const hs = field(g, 'playoffHomeSeed', 'playoff_home_seed');
            const as_ = field(g, 'playoffAwaySeed', 'playoff_away_seed');
            return (hs === highSeed && as_ === lowSeed) || (hs === lowSeed && as_ === highSeed);
        });

    const findR2Game = (byeSeed) =>
        (gamesByRound[2] || []).find(g => {
            const hs = field(g, 'playoffHomeSeed', 'playoff_home_seed');
            const as_ = field(g, 'playoffAwaySeed', 'playoff_away_seed');
            return hs === byeSeed || as_ === byeSeed;
        });

    // Sort games by bracket position using seed groups.
    // Finds the minimum seed in a game and returns its group index (bracket slot).
    // Falls back to 99 for upset teams whose seed isn't in any group.
    const getGameBracketPos = (game, seedGroups) => {
        const hs = field(game, 'playoffHomeSeed', 'playoff_home_seed') || 99;
        const as_ = field(game, 'playoffAwaySeed', 'playoff_away_seed') || 99;
        const minSeed = Math.min(hs, as_);
        for (let i = 0; i < seedGroups.length; i++) {
            if (seedGroups[i].includes(minSeed)) return i;
        }
        // Fallback for double-upset: try max seed as well
        const maxSeed = Math.max(hs === 99 ? 0 : hs, as_ === 99 ? 0 : as_);
        for (let i = 0; i < seedGroups.length; i++) {
            if (seedGroups[i].includes(maxSeed)) return i;
        }
        return 99;
    };

    const getGamesForRound = (round, expectedCount, seedGroups) => {
        const roundGames = gamesByRound[round] || [];
        const result = Array(expectedCount).fill(null);
        for (const game of roundGames) {
            const pos = getGameBracketPos(game, seedGroups);
            if (pos >= 0 && pos < expectedCount) {
                result[pos] = game;
            }
        }
        return result;
    };

    const r2Data = useMemo(() =>
        R2_BYE_SEEDS.map((byeSeed, idx) => ({
            byeSeed,
            r1: R2_OPPONENT_R1[idx],
            game: findR2Game(byeSeed),
        })),
        [gamesByRound]);

    const qfData = useMemo(() => getGamesForRound(3, 4, QF_SEED_GROUPS), [gamesByRound]);
    const sfData = useMemo(() => getGamesForRound(4, 2, SF_SEED_GROUPS), [gamesByRound]);
    const ncgData = useMemo(() => getGamesForRound(5, 1, [[1, 2, 3, 4, 5, 6, 7, 8]]), [gamesByRound]);

    // ── Helper to get team display name ───────────────────────────────
    const getTeamDisplayName = (teamName) => {
        if (!teamName || teamName === 'TBD' || teamName === 'OPEN') return null;
        const td = teamMap[teamName];
        return td?.abbreviation || teamName?.substring(0, 14);
    };

    // ── Helper to get "Winner of" label from a game ────────────────────
    const getWinnerLabel = (game) => {
        if (!game) return null;
        const home = field(game, 'homeTeam', 'home_team');
        const away = field(game, 'awayTeam', 'away_team');
        const homeName = getTeamDisplayName(home);
        const awayName = getTeamDisplayName(away);
        if (homeName && awayName) {
            return `${homeName}/${awayName}`;
        }
        return null;
    };

    // ── Get Quarterfinal labels from Round 2 games ─────────────────────
    const getQFLabels = (qfIndex) => {
        // QF 0: R2 Game 0 vs R2 Game 1
        // QF 1: R2 Game 2 vs R2 Game 3
        // QF 2: R2 Game 4 vs R2 Game 5
        // QF 3: R2 Game 6 vs R2 Game 7
        const r2Game1Idx = qfIndex * 2;
        const r2Game2Idx = qfIndex * 2 + 1;
        const r2Game1 = r2Data[r2Game1Idx]?.game;
        const r2Game2 = r2Data[r2Game2Idx]?.game;
        return {
            top: getWinnerLabel(r2Game1) || `R2 Game ${r2Game1Idx + 1}`,
            bottom: getWinnerLabel(r2Game2) || `R2 Game ${r2Game2Idx + 1}`,
        };
    };

    // ── Get Semifinal labels from Quarterfinal games ───────────────────
    const getSFLabels = (sfIndex) => {
        // SF 0: QF 0 vs QF 1
        // SF 1: QF 2 vs QF 3
        const qfGame1Idx = sfIndex * 2;
        const qfGame2Idx = sfIndex * 2 + 1;
        const qfGame1 = qfData[qfGame1Idx];
        const qfGame2 = qfData[qfGame2Idx];
        return {
            top: getWinnerLabel(qfGame1) || `QF ${qfGame1Idx + 1}`,
            bottom: getWinnerLabel(qfGame2) || `QF ${qfGame2Idx + 1}`,
        };
    };

    // ── Get Championship label from Semifinal games ────────────────────
    const getNCGLabel = () => {
        const sfGame1 = sfData[0];
        const sfGame2 = sfData[1];
        return {
            top: getWinnerLabel(sfGame1) || 'SF 1',
            bottom: getWinnerLabel(sfGame2) || 'SF 2',
        };
    };

    // ── Rendering helpers ───────────────────────────────────────────
    const renderTeamRow = (teamName, seed, score, isWinner, isTop, fontSize = '0.72rem', customLabel = null) => {
        const td = teamMap[teamName];
        const isTBD = !teamName || teamName === 'TBD' || teamName === 'OPEN';
        const displayText = isTBD && customLabel ? customLabel : (isTBD ? 'TBD' : (td?.abbreviation || teamName?.substring(0, 14)));
        return (
            <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                px: 0.75, py: 0.4,
                backgroundColor: 'transparent',
                borderBottom: isTop ? '1px solid' : 'none', borderColor: 'divider',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
                    {seed != null && (
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.65rem', minWidth: 18, textAlign: 'right' }}>
                            {seed}
                        </Typography>
                    )}
                    {!isTBD && (
                        <Avatar src={td?.logo} sx={{ width: 18, height: 18, flexShrink: 0 }}>{teamName?.charAt(0)}</Avatar>
                    )}
                    <Typography variant="caption" noWrap sx={{
                        fontWeight: isWinner ? 700 : 400, fontSize,
                        color: isTBD ? 'text.disabled' : 'text.primary',
                        fontStyle: isTBD ? 'italic' : 'normal', maxWidth: 110,
                    }}>
                        {displayText}
                    </Typography>
                </Box>
                {score != null && (
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem', pl: 0.5 }}>{score}</Typography>
                )}
            </Box>
        );
    };

    const formatBracketQuarter = (q) => {
        if (q >= 6) return `${q - 4}OT`;
        if (q === 5) return 'OT';
        if (q === 4) return '4th';
        if (q === 3) return '3rd';
        if (q === 2) return '2nd';
        if (q === 1) return '1st';
        return '';
    };

    const renderGameCard = (game, width, customAwayLabel = null) => {
        if (!game) return null;
        const home = field(game, 'homeTeam', 'home_team');
        const away = field(game, 'awayTeam', 'away_team');
        const hs = field(game, 'playoffHomeSeed', 'playoff_home_seed');
        const as_ = field(game, 'playoffAwaySeed', 'playoff_away_seed');
        const fin = field(game, 'finished', 'finished');
        const started = field(game, 'started', 'started');
        const hsc = field(game, 'homeScore', 'home_score');
        const asc = field(game, 'awayScore', 'away_score');
        const gid = field(game, 'gameId', 'game_id');
        const quarter = field(game, 'quarter', 'quarter');
        const clock = field(game, 'clock', 'clock') || field(game, 'gameClock', 'game_clock');
        const status = field(game, 'status', 'status') || field(game, 'gameStatus', 'game_status');
        const homeWon = fin && hsc != null && hsc > asc;
        const awayWon = fin && asc != null && asc > hsc;
        const clickable = !adminMode && gid && (started || fin);

        let statusText = null;
        let isFinal = false;
        if (fin || status === 'FINAL' || status === 'COMPLETED') {
            isFinal = true;
            statusText = 'Final';
        } else if (started) {
            if (status === 'HALFTIME') {
                statusText = 'Halftime';
            } else if (status === 'OPENING_KICKOFF') {
                statusText = 'Kickoff';
            } else if (status === 'END_OF_REGULATION') {
                statusText = 'End of Reg';
            } else if (status === 'OVERTIME') {
                statusText = 'OT';
            } else {
                const qtr = formatBracketQuarter(quarter);
                const time = (quarter >= 5) ? '' : (clock || '');
                if (qtr && time) statusText = `${qtr} | ${time}`;
                else if (qtr) statusText = qtr;
                else if (status) statusText = status.replace(/_/g, ' ');
            }
        }

        return (
            <Paper
                component={clickable ? 'a' : 'div'}
                href={clickable ? `/game-details/${gid}` : undefined}
                elevation={1}
                onClick={(e) => {
                    if (!clickable) return;
                    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                    e.preventDefault();
                    navigate(`/game-details/${gid}`);
                }}
                sx={{
                    borderRadius: 1, overflow: 'hidden', width,
                    cursor: clickable ? 'pointer' : 'default',
                    border: '1px solid', borderColor: 'divider',
                    transition: 'box-shadow 0.15s',
                    textDecoration: 'none', color: 'inherit',
                    '&:hover': clickable ? { boxShadow: theme.shadows[4] } : {},
                }}
            >
                {renderTeamRow(home, hs, (fin || started) ? hsc : null, homeWon, true)}
                {renderTeamRow(away, as_, (fin || started) ? asc : null, awayWon, false, '0.72rem', customAwayLabel)}
                {statusText && (
                    <Box sx={{
                        textAlign: 'center', py: 0.2, px: 0.5,
                        backgroundColor: isFinal ? theme.palette.grey[200] : theme.palette.warning.light + '30',
                        borderTop: '1px solid', borderColor: 'divider',
                    }}>
                        <Typography variant="caption" sx={{
                            fontWeight: 600, fontSize: '0.6rem',
                            color: isFinal ? theme.palette.text.secondary : theme.palette.warning.dark,
                            textTransform: 'uppercase',
                        }}>
                            {statusText}
                        </Typography>
                    </Box>
                )}
                {adminMode && (onAdvanceTeam || onDeleteGame) && (
                    <Box sx={{
                        display: 'flex', justifyContent: 'flex-end', gap: 0.25,
                        borderTop: '1px solid', borderColor: 'divider',
                        px: 0.25, py: 0.1,
                    }}>
                        {onAdvanceTeam && (
                            <Tooltip title="Advance winner" arrow>
                                <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={(e) => { e.stopPropagation(); onAdvanceTeam(game); }}
                                    sx={{ p: 0.25 }}
                                >
                                    <ArrowForwardIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                            </Tooltip>
                        )}
                        {onDeleteGame && (
                            <Tooltip title="Delete game" arrow>
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={(e) => { e.stopPropagation(); onDeleteGame(game.id); }}
                                    sx={{ p: 0.25 }}
                                >
                                    <DeleteIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                )}
            </Paper>
        );
    };

    const renderPlaceholder = (width, topLabel = 'TBD', bottomLabel = 'TBD') => (
        <Paper elevation={0} sx={{
            borderRadius: 1, border: '1px dashed', borderColor: 'divider',
            width, opacity: 0.55,
        }}>
            <Box sx={{ px: 0.75, py: 0.4, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.6rem', fontStyle: 'italic' }}>{topLabel}</Typography>
            </Box>
            <Box sx={{ px: 0.75, py: 0.4 }}>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.6rem', fontStyle: 'italic' }}>{bottomLabel}</Typography>
            </Box>
        </Paper>
    );

    // ── Horizontal connectors (1:1, R1 → R2) ─────────────────────────
    const renderHorizontalConnectors = (count) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: 24, flexShrink: 0 }}>
            {Array(count).fill(null).map((_, i) => (
                <Box key={i} sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', borderTop: '2px solid', borderColor: 'grey.300' }} />
                </Box>
            ))}
        </Box>
    );

    // ── Merge connector lines between rounds ────────────────────────
    const renderConnectors = (numPairs) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: 32, flexShrink: 0 }}>
            {Array(numPairs).fill(null).map((_, i) => (
                <Box key={i} sx={{ flex: 1, position: 'relative' }}>
                    {/* top-left → center */}
                    <Box sx={{ position: 'absolute', top: '25%', left: 0, width: '50%', borderTop: '2px solid', borderColor: 'grey.300' }} />
                    {/* bottom-left → center */}
                    <Box sx={{ position: 'absolute', top: '75%', left: 0, width: '50%', borderTop: '2px solid', borderColor: 'grey.300' }} />
                    {/* vertical bar */}
                    <Box sx={{ position: 'absolute', top: '25%', height: '50%', left: '50%', borderLeft: '2px solid', borderColor: 'grey.300' }} />
                    {/* center → right */}
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', width: '50%', borderTop: '2px solid', borderColor: 'grey.300' }} />
                </Box>
            ))}
        </Box>
    );

    // ── Column header ───────────────────────────────────────────────
    const RoundHeader = ({ label, weekNum, isChampionship }) => (
        <Box sx={{ textAlign: 'center', mb: 0.5 }}>
            <Typography variant="caption" sx={{
                fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
                color: isChampionship ? 'error.main' : 'text.secondary', fontSize: '0.6rem',
                display: 'block',
            }}>
                {label}
            </Typography>
            {weekNum && (
                <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.55rem' }}>
                    Wk {weekNum}
                </Typography>
            )}
        </Box>
    );

    // ── Main bracket ────────────────────────────────────────────────
    const renderFullBracket = () => {
        const W = 195; // card width
        const ROW_H = 84; // increased since bye badges removed (8 rows instead of 16)
        const totalHeight = 8 * ROW_H;

        return (
            <Box sx={{
                overflowX: 'auto', pb: 2,
                display: 'flex', justifyContent: 'center',
            }}>
                <Box sx={{
                    display: 'flex', alignItems: 'stretch', minHeight: totalHeight,
                    width: 'fit-content',
                }}>
                    {/* ── Column 1: First Round (8 games) ────────────── */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: W, flexShrink: 0 }}>
                        <RoundHeader label="First Round" weekNum={playoffWeekForRound(1)} />
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            {R1_GAMES.map((entry, idx) => {
                                const game = findR1Game(entry.highSeed, entry.lowSeed);
                                return (
                                    <Box key={idx} sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 0.25 }}>
                                        {game
                                            ? renderGameCard(game, W - 6)
                                            : renderPlaceholder(W - 6, `#${entry.highSeed}`, `#${entry.lowSeed}`)
                                        }
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>

                    {renderHorizontalConnectors(8)}

                    {/* ── Column 2: Second Round (bye teams appear here) */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: W, flexShrink: 0 }}>
                        <RoundHeader label="Second Round" weekNum={playoffWeekForRound(2)} />
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            {r2Data.map((d, idx) => {
                                const byeTeamName = seedToTeam[d.byeSeed];
                                const r1Game = findR1Game(d.r1.h, d.r1.l);
                                let winnerLabel = `#${d.r1.h} / #${d.r1.l}`;
                                if (r1Game) {
                                    const r1Home = field(r1Game, 'homeTeam', 'home_team');
                                    const r1Away = field(r1Game, 'awayTeam', 'away_team');
                                    const homeTeam = getTeamDisplayName(r1Home);
                                    const awayTeam = getTeamDisplayName(r1Away);
                                    if (homeTeam && awayTeam) {
                                        winnerLabel = `${homeTeam}/${awayTeam}`;
                                    }
                                }
                                return (
                                    <Box key={idx} sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 0.25 }}>
                                        {d.game
                                            ? renderGameCard(d.game, W - 6, winnerLabel)
                                            : renderPlaceholder(W - 6, `#${d.byeSeed} ${byeTeamName || '(BYE)'}`, winnerLabel)
                                        }
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>

                    {renderConnectors(4)}

                    {/* ── Column 3: Quarterfinals ────────────────────── */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: W, flexShrink: 0 }}>
                        <RoundHeader label="Quarterfinals" weekNum={playoffWeekForRound(3)} />
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            {qfData.map((game, idx) => {
                                const labels = getQFLabels(idx);
                                return (
                                    <Box key={idx} sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 0.25 }}>
                                        {game
                                            ? renderGameCard(game, W - 6)
                                            : renderPlaceholder(W - 6, labels.top, labels.bottom)
                                        }
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>

                    {renderConnectors(2)}

                    {/* ── Column 4: Semifinals ──────────────────────── */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: W, flexShrink: 0 }}>
                        <RoundHeader label="Semifinals" weekNum={playoffWeekForRound(4)} />
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            {sfData.map((game, idx) => {
                                const labels = getSFLabels(idx);
                                return (
                                    <Box key={idx} sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 0.25 }}>
                                        {game
                                            ? renderGameCard(game, W - 6)
                                            : renderPlaceholder(W - 6, labels.top, labels.bottom)
                                        }
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>

                    {renderConnectors(1)}

                    {/* ── Column 5: Championship ────────────────────── */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: W, flexShrink: 0 }}>
                        <RoundHeader label="Championship" weekNum={playoffWeekForRound(5)} isChampionship />
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 0.25 }}>
                                {ncgData[0]
                                    ? renderGameCard(ncgData[0], W - 6)
                                    : (() => {
                                        const labels = getNCGLabel();
                                        return renderPlaceholder(W - 6, labels.top, labels.bottom);
                                    })()
                                }
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        );
    };

    // ── Loading state ───────────────────────────────────────────────
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress size={40} />
            </Box>
        );
    }

    // ── Helper: get conference info (label + logo) ──────────────────
    const getConferenceInfo = (confValue) => {
        if (!confValue) return { label: null, logo: null };
        const conf = conferences.find(c => c.value === confValue);
        if (conf) return conf;
        return { label: formatConferenceName(confValue), logo: null };
    };

    // ── Shared grid layout for postseason game cards ─────────────────
    const cardGridSx = {
        display: 'grid',
        gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
        },
        gap: 2.5,
    };

    // ── Section header ───────────────────────────────────────────────
    const SectionHeader = ({ children }) => (
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
            {children}
        </Typography>
    );

    // GameCardHeader removed — title/logo now passed as props to BracketMatchup

    // ── Derive CCG card header info ──────────────────────────────────
    const getCCGHeaderInfo = (game) => {
        const homeTeam = field(game, 'homeTeam', 'home_team');
        const awayTeam = field(game, 'awayTeam', 'away_team');
        const confValue = teamMap[homeTeam]?.conference || teamMap[awayTeam]?.conference;
        const confInfo = getConferenceInfo(confValue);
        return {
            logo: confInfo.logo,
            title: confInfo.label ? `${confInfo.label} Championship` : 'Conference Championship',
        };
    };

    // ── Derive Bowl card header info ─────────────────────────────────
    const getBowlHeaderInfo = (game) => {
        const bowlName = field(game, 'postseasonGameName', 'postseason_game_name');
        const gameLogo = field(game, 'postseasonGameLogo', 'postseason_game_logo');
        const logoUrl = gameLogo
            ? (gameLogo.startsWith('http') ? gameLogo : `${import.meta.env.VITE_API_URL || 'http://localhost:1313'}/images/${gameLogo}`)
            : null;
        return {
            logo: logoUrl,
            title: bowlName || 'Bowl Game',
        };
    };

    // ── Render ───────────────────────────────────────────────────────
    return (
        <Box>
            {/* Playoff Bracket */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 3, textAlign: 'center' }}>
                    Playoff Bracket
                </Typography>
                {playoffGames.length > 0
                    ? renderFullBracket()
                    : (
                        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                            No playoff games scheduled for this season.
                        </Typography>
                    )
                }
            </Box>

            {/* Conference Championships */}
            {ccgGames.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <SectionHeader>Conference Championships</SectionHeader>
                    <Box sx={cardGridSx}>
                        {ccgGames.map(game => {
                            const { logo, title } = getCCGHeaderInfo(game);
                            return (
                                <Box key={game.id}>
                                    <BracketMatchup game={game} teamMap={teamMap} title={title} titleLogo={logo} />
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            )}

            {/* Bowl Games */}
            {bowlGames.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <SectionHeader>Bowl Games</SectionHeader>
                    <Box sx={cardGridSx}>
                        {bowlGames.map(game => {
                            const { logo, title } = getBowlHeaderInfo(game);
                            return (
                                <Box key={game.id}>
                                    <BracketMatchup game={game} teamMap={teamMap} title={title} titleLogo={logo} />
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default Postseason;
