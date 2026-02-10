import React, { useMemo } from 'react';
import { Box, Typography, Paper, Avatar, CircularProgress, useTheme, IconButton, Tooltip } from '@mui/material';
import { ArrowForward as ArrowForwardIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import BracketMatchup from './BracketMatchup';
import { R2_BYE_SEEDS, R1_GAMES, R2_OPPONENT_R1, playoffWeekForRound } from '../constants/playoffBracket';

// Helper to safely read schedule fields (backend uses SNAKE_CASE serialization)
const field = (game, camel, snake) => game[camel] !== undefined ? game[camel] : game[snake];

// ─── Component ──────────────────────────────────────────────────────
const PlayoffBracket = ({
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

    const getGamesForRound = (round, expectedCount) => {
        const games = [...(gamesByRound[round] || [])].sort((a, b) => {
            const sa = field(a, 'playoffHomeSeed', 'playoff_home_seed') || 99;
            const sb = field(b, 'playoffHomeSeed', 'playoff_home_seed') || 99;
            return sa - sb;
        });
        const result = [];
        for (let i = 0; i < expectedCount; i++) result.push(games[i] || null);
        return result;
    };

    const r2Data = useMemo(() =>
        R2_BYE_SEEDS.map((byeSeed, idx) => ({
            byeSeed,
            r1: R2_OPPONENT_R1[idx],
            game: findR2Game(byeSeed),
        })),
        [gamesByRound]);

    const qfData = useMemo(() => getGamesForRound(3, 4), [gamesByRound]);
    const sfData = useMemo(() => getGamesForRound(4, 2), [gamesByRound]);
    const ncgData = useMemo(() => getGamesForRound(5, 1), [gamesByRound]);

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
                backgroundColor: isWinner ? 'rgba(5,150,105,0.1)' : 'transparent',
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
        const homeWon = fin && hsc != null && hsc > asc;
        const awayWon = fin && asc != null && asc > hsc;
        const clickable = !adminMode && gid && started;
        return (
            <Paper
                elevation={1}
                onClick={() => clickable && navigate(`/game-details/${gid}`)}
                sx={{
                    borderRadius: 1, overflow: 'hidden', width,
                    cursor: clickable ? 'pointer' : 'default',
                    border: '1px solid', borderColor: 'divider',
                    transition: 'box-shadow 0.15s',
                    '&:hover': clickable ? { boxShadow: theme.shadows[4] } : {},
                }}
            >
                {renderTeamRow(home, hs, (fin || started) ? hsc : null, homeWon, true)}
                {renderTeamRow(away, as_, (fin || started) ? asc : null, awayWon, false, '0.72rem', customAwayLabel)}
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

    // ── Render ───────────────────────────────────────────────────────
    return (
        <Box>
            {/* Conference Championships */}
            {ccgGames.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
                        Conference Championships
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {ccgGames.map(game => {
                            return (
                                <Box key={game.id}>
                                    <BracketMatchup game={game} teamMap={teamMap} />
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            )}

            {/* Playoff Bracket */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 3, textAlign: 'center' }}>
                    Playoff Bracket
                </Typography>
                {playoffGames.length > 0
                    ? renderFullBracket()
                    : (
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            No playoff games scheduled for this season.
                        </Typography>
                    )
                }
            </Box>

            {/* Bowl Games */}
            {bowlGames.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
                        Bowl Games
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {bowlGames.map(game => {
                            return (
                                <Box key={game.id}>
                                    <BracketMatchup game={game} teamMap={teamMap} />
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default PlayoffBracket;
