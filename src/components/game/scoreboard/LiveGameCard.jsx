import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Chip, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
    formatBallLocationWithTeam,
    getGameStatusInfo,
    isGameOngoing
} from './utils/scoreboardFormatters';
import {
    formatScoreboardQuarter,
    formatDownAndDistance,
} from '../../../utils/gameUtils';
import { getPreviousPlay } from '../../../api/playApi';
import { getGameStatsByIdAndTeam } from '../../../api/gameStatsApi';
import { conferences } from '../../constants/conferences';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:1313';

// ── Game type badge ─────────────────────────────────────────────
const GameTypeInfo = ({ game, homeTeamData }) => {
    const theme = useTheme();
    const gameType = game.game_type;
    const postseasonLogo = game.postseason_game_logo
        ? `${API_BASE}/images/${game.postseason_game_logo}`
        : null;
    const bowlName = game.bowl_game_name;
    const confData = homeTeamData?.conference
        ? conferences.find(c => c.value === homeTeamData.conference)
        : null;

    const logoBox = (src) =>
        src ? (
            <Box sx={{ width: 18, height: 18, flexShrink: 0, display: 'flex', alignItems: 'center', backgroundColor: theme.palette.grey[100], borderRadius: 0.5 }}>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </Box>
        ) : null;

    const label = (text, logoSrc) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {logoBox(logoSrc)}
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                {text}
            </Typography>
        </Box>
    );

    switch (gameType) {
        case 'CONFERENCE_GAME': return label(confData?.label || 'Conference', confData?.logo);
        case 'CONFERENCE_CHAMPIONSHIP': return label(`${confData?.label || 'Conf'} Championship`, confData?.logo);
        case 'PLAYOFFS': return label('Playoffs', postseasonLogo);
        case 'NATIONAL_CHAMPIONSHIP': return label('Natl Championship', postseasonLogo);
        case 'BOWL': return label(bowlName || 'Bowl Game', postseasonLogo);
        case 'OUT_OF_CONFERENCE': return label('Out of Conference', null);
        case 'SCRIMMAGE': return label('Scrimmage', null);
        default: return label(gameType || 'Game', null);
    }
};

// ── Main card ──────────────────────────────────────────────────
const LiveGameCard = ({ game, homeTeamData, awayTeamData }) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const homeTeamName = game.homeTeam || game.home_team;
    const awayTeamName = game.awayTeam || game.away_team;
    const homeScore = game.homeScore || game.home_score || 0;
    const awayScore = game.awayScore || game.away_score || 0;
    const gameStatus = game.game_status;
    const isOngoing = isGameOngoing(gameStatus);
    const statusInfo = getGameStatusInfo(gameStatus);
    const possession = game.possession;
    const waitingOn = game.waiting_on;
    const gameId = game.game_id;
    const isChewMode = (game.game_mode === 'CHEW');

    const [homeWinProb, setHomeWinProb] = useState(null);
    const [homeStats, setHomeStats] = useState(null);
    const [awayStats, setAwayStats] = useState(null);

    // Win probability
    useEffect(() => {
        if (!gameId || !isOngoing) { setHomeWinProb(null); return; }
        getPreviousPlay(gameId)
            .then(play => {
                if (play?.win_probability != null) {
                    const wp = parseFloat(play.win_probability);
                    const p = play.possession || possession;
                    setHomeWinProb(p === 'HOME' ? wp : p === 'AWAY' ? 1 - wp : null);
                }
            })
            .catch(() => {});
    }, [gameId, isOngoing, possession]);

    // Quarter scores — fetch once per game
    useEffect(() => {
        if (!gameId || !homeTeamName || !awayTeamName) return;
        Promise.all([
            getGameStatsByIdAndTeam(gameId, homeTeamName).catch(() => null),
            getGameStatsByIdAndTeam(gameId, awayTeamName).catch(() => null),
        ]).then(([h, a]) => {
            setHomeStats(h?.data || h || null);
            setAwayStats(a?.data || a || null);
        });
    }, [gameId, homeTeamName, awayTeamName]);

    const handleClick = () => gameId && navigate(`/game-details/${gameId}`);

    const getWaitingOnInfo = () => {
        if (!waitingOn) return null;
        if (waitingOn === 'HOME') return { logo: homeTeamData?.logo, name: homeTeamData?.abbreviation || homeTeamName?.substring(0, 3) };
        if (waitingOn === 'AWAY') return { logo: awayTeamData?.logo, name: awayTeamData?.abbreviation || awayTeamName?.substring(0, 3) };
        return null;
    };
    const waitInfo = getWaitingOnInfo();

    const renderTeamRow = (teamName, teamData, score, isHome, isWinner, stats) => {
        const hasPossession = isOngoing && ((isHome && possession === 'HOME') || (!isHome && possession === 'AWAY'));
        const ranking = teamData?.coaches_poll_ranking;
        return (
            <Box sx={{
                display: 'flex', alignItems: 'center',
                px: 1.5, py: 0.85,
                borderBottom: isHome ? 'none' : '1px solid',
                borderColor: 'divider',
                backgroundColor: 'transparent',
            }}>
                {/* Left side: Team info (fixed ~35%) */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, width: '35%', minWidth: 0, flexShrink: 0 }}>
                    <Box sx={{
                        width: 7, height: 7, borderRadius: '50%',
                        backgroundColor: hasPossession ? theme.palette.warning.main : 'transparent',
                        flexShrink: 0,
                        boxShadow: hasPossession ? `0 0 6px ${theme.palette.warning.main}` : 'none',
                    }} />
                    <Box sx={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {teamData?.logo
                            ? <img src={teamData.logo} alt={teamName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            : <Typography sx={{ color: theme.palette.primary.main, fontSize: '0.75rem', fontWeight: 600 }}>{teamName?.charAt(0) || '?'}</Typography>
                        }
                    </Box>
                    {ranking > 0 && (
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, backgroundColor: theme.palette.warning.main, color: 'white', px: 0.4, py: 0.1, borderRadius: 0.5, minWidth: 16, textAlign: 'center', flexShrink: 0 }}>
                            #{ranking}
                        </Typography>
                    )}
                    <Typography sx={{
                        fontSize: '1.0rem', fontWeight: 700,
                        color: isWinner ? theme.palette.primary.main : 'text.primary',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                        {teamName && teamName.length > 12 ? teamData?.abbreviation || teamName.substring(0, 12) : teamName || ''}
                    </Typography>
                </Box>
                {/* Middle: Quarter scores (if available) */}
                {showQuarters && (
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, gap: 0.25 }}>
                        {quarterCols.map(key => (
                            <Typography key={key} sx={{
                                fontSize: '0.8rem', fontWeight: 500,
                                color: 'text.secondary',
                                textAlign: 'center', flex: 1, minWidth: 0,
                            }}>
                                {stats?.[key] != null ? stats[key] : '-'}
                            </Typography>
                        ))}
                    </Box>
                )}
                {/* Right: Total score */}
                <Typography sx={{
                    fontSize: '1.15rem', fontWeight: 800,
                    color: isWinner ? theme.palette.primary.main : 'text.primary',
                    minWidth: 40, textAlign: 'right', flexShrink: 0,
                }}>
                    {score}
                </Typography>
            </Box>
        );
    };

    const isHomeWinning = homeScore > awayScore;
    const isAwayWinning = awayScore > homeScore;
    const isFinal = !isOngoing;

    const homeWinPct = homeWinProb != null ? Math.round(homeWinProb * 100) : null;
    const awayWinPct = homeWinProb != null ? 100 - homeWinPct : null;

    const homeColor = homeTeamData?.primaryColor || homeTeamData?.primary_color || theme.palette.primary.main;
    const awayColor = awayTeamData?.primaryColor || awayTeamData?.primary_color || theme.palette.error.main;

    const showQuarters = !!(homeStats || awayStats);
    const hasOT = showQuarters && ['ot_score'].some(k =>
        (homeStats?.[k] != null && homeStats[k] !== 0) || (awayStats?.[k] != null && awayStats[k] !== 0)
    );
    const quarterCols = ['q1_score', 'q2_score', 'q3_score', 'q4_score', ...(hasOT ? ['ot_score'] : [])];
    const quarterHeaders = ['Q1', 'Q2', 'Q3', 'Q4', ...(hasOT ? ['OT'] : [])];

    return (
        <Paper
            elevation={2}
            onClick={handleClick}
            sx={{
                borderRadius: 2, overflow: 'hidden',
                cursor: gameId ? 'pointer' : 'default',
                transition: 'transform 0.15s, box-shadow 0.15s',
                '&:hover': gameId ? { transform: 'translateY(-2px)', boxShadow: theme.shadows[6] } : {},
                border: '1px solid', borderColor: isOngoing ? theme.palette.primary.main + '40' : 'divider',
            }}
        >
            {/* ─── Top Bar: Game Type | Quarter Headers | CHEW chip ─── */}
            <Box sx={{
                display: 'flex', alignItems: 'center',
                px: 1.5, py: 0.6,
                backgroundColor: isFinal ? theme.palette.grey[100] : theme.palette.primary.main + '10',
                borderBottom: '1px solid',
                borderColor: isOngoing ? theme.palette.primary.main + '30' : 'divider',
            }}>
                <Box sx={{ width: '35%', minWidth: 0, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {isFinal ? (
                        <Chip label={statusInfo.status} size="small" sx={{ backgroundColor: statusInfo.color, color: 'white', fontWeight: 600, fontSize: '0.65rem', height: 20, '& .MuiChip-label': { px: 0.75 } }} />
                    ) : (
                        <GameTypeInfo game={game} homeTeamData={homeTeamData} />
                    )}
                    {isChewMode && (
                        <Chip label="CHEW" size="small" sx={{ backgroundColor: theme.palette.error.main, color: 'white', fontWeight: 700, fontSize: '0.6rem', height: 18, '& .MuiChip-label': { px: 0.5 } }} />
                    )}
                </Box>
                {showQuarters && (
                    <>
                        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, gap: 0.25 }}>
                            {quarterHeaders.map(h => (
                                <Typography key={h} sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'text.disabled', textAlign: 'center', flex: 1, minWidth: 0 }}>
                                    {h}
                                </Typography>
                            ))}
                        </Box>
                        <Box sx={{ minWidth: 40, flexShrink: 0 }} />
                    </>
                )}
            </Box>

            {/* ─── Team Rows ─── */}
            {renderTeamRow(awayTeamName, awayTeamData, awayScore, false, isFinal ? isAwayWinning : false, awayStats)}
            {renderTeamRow(homeTeamName, homeTeamData, homeScore, true, isFinal ? isHomeWinning : false, homeStats)}

            {/* ─── Bottom Bar: Spread | Game State | Waiting On ─── */}
            <Box sx={{
                display: 'flex', alignItems: 'center',
                px: 1.5, py: 0.5,
                backgroundColor: theme.palette.grey[50],
                borderTop: '1px solid', borderColor: 'divider',
                gap: 0.5, minHeight: 32,
            }}>
                {/* Left: Spread */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 48 }}>
                    {game.home_vegas_spread !== null && game.home_vegas_spread !== undefined && (
                        <>
                            <Box sx={{ width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {homeTeamData?.logo
                                    ? <img src={homeTeamData.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    : <Typography sx={{ fontSize: '0.55rem', fontWeight: 600 }}>{homeTeamName?.charAt(0)}</Typography>
                                }
                            </Box>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'text.secondary' }}>
                                {game.home_vegas_spread > 0 ? '+' : ''}{game.home_vegas_spread}
                            </Typography>
                        </>
                    )}
                </Box>

                {/* Center: Quarter + Clock + Down & Distance */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    {isOngoing && game.quarter && (
                        <>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: theme.palette.primary.main }}>
                                    {formatScoreboardQuarter(game.quarter)}
                                </Typography>
                                {game.quarter < 5 && (
                                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.primary', backgroundColor: theme.palette.primary.main + '18', px: 0.6, py: 0.1, borderRadius: 0.75 }}>
                                        {game.clock || game.game_clock || '0:00'}
                                    </Typography>
                                )}
                            </Box>
                            {game.down && (
                                <Typography sx={{ fontSize: '0.68rem', fontWeight: 500, color: 'text.secondary', textAlign: 'center' }}>
                                    {formatDownAndDistance(game.down, game.yards_to_go || game.yardsToGo || 0)}
                                    {game.ball_location && (
                                        <Typography component="span" sx={{ fontSize: '0.68rem', color: 'text.disabled', mx: 0.35 }}>
                                            {' at '}
                                        </Typography>
                                    )}
                                    {game.ball_location && formatBallLocationWithTeam(
                                        game.ball_location, game.possession, homeTeamName, awayTeamName, homeTeamData, awayTeamData
                                    )}
                                </Typography>
                            )}
                        </>
                    )}
                </Box>

                {/* Right: Waiting On */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 48, justifyContent: 'flex-end' }}>
                    {waitInfo && (
                        <>
                            <Typography sx={{ fontSize: '0.62rem', color: 'text.secondary', fontWeight: 500 }}>
                                Waiting On:
                            </Typography>
                            {waitInfo.logo
                                ? <Box sx={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src={waitInfo.logo} alt="Waiting On" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                  </Box>
                                : <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: theme.palette.primary.main }}>{waitInfo.name}</Typography>
                            }
                        </>
                    )}
                </Box>
            </Box>

            {/* ─── Win Probability ─── */}
            {isOngoing && homeWinPct != null && (
                <Box sx={{ px: 1.5, py: 0.6, borderTop: '1px solid', borderColor: 'divider', backgroundColor: theme.palette.grey[50] }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: awayColor }}>
                            {awayTeamData?.abbreviation || awayTeamName?.substring(0, 4)} {awayWinPct}%
                        </Typography>
                        <Typography sx={{ fontSize: '0.55rem', fontWeight: 500, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Win Probability
                        </Typography>
                        <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: homeColor }}>
                            {homeWinPct}% {homeTeamData?.abbreviation || homeTeamName?.substring(0, 4)}
                        </Typography>
                    </Box>
                    {/* Thin line with junction marker */}
                    <Box sx={{ position: 'relative', display: 'flex', height: 3, borderRadius: 2 }}>
                        <Box sx={{ width: `${awayWinPct}%`, height: '100%', backgroundColor: awayColor, borderRadius: '2px 0 0 2px', transition: 'width 0.5s ease' }} />
                        <Box sx={{ width: `${homeWinPct}%`, height: '100%', backgroundColor: homeColor, borderRadius: '0 2px 2px 0', transition: 'width 0.5s ease' }} />
                        <Box sx={{
                            position: 'absolute',
                            left: `${awayWinPct}%`,
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 9, height: 9,
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            border: '2px solid',
                            borderColor: awayWinPct >= homeWinPct ? awayColor : homeColor,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                            zIndex: 1,
                        }} />
                    </Box>
                </Box>
            )}
        </Paper>
    );
};

export default LiveGameCard;
