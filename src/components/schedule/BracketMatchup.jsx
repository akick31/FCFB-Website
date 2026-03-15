import React from 'react';
import { Box, Typography, Avatar, Paper, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { field } from '../../utils/fieldHelper';

const BracketMatchup = ({ game, teamMap = {}, compact = false, title = null, titleLogo = null }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const home = field(game, 'homeTeam', 'home_team');
    const away = field(game, 'awayTeam', 'away_team');
    const homeData = teamMap[home];
    const awayData = teamMap[away];
    const finished = field(game, 'finished', 'finished');
    const started = field(game, 'started', 'started');
    const homeScore = field(game, 'homeScore', 'home_score');
    const awayScore = field(game, 'awayScore', 'away_score');
    const homeSeed = field(game, 'playoffHomeSeed', 'playoff_home_seed');
    const awaySeed = field(game, 'playoffAwaySeed', 'playoff_away_seed');
    const gameId = field(game, 'gameId', 'game_id');
    const homeWon = finished && homeScore != null && homeScore > awayScore;
    const awayWon = finished && awayScore != null && awayScore > homeScore;
    const clickable = !!gameId;

    // Game status info
    const quarter = field(game, 'quarter', 'quarter');
    const clock = field(game, 'clock', 'clock') || field(game, 'gameClock', 'game_clock');
    const status = field(game, 'status', 'status') || field(game, 'gameStatus', 'game_status');

    const formatQuarter = (q) => {
        if (q >= 6) return `${q - 4}OT`;
        if (q === 5) return 'OT';
        if (q === 4) return '4th';
        if (q === 3) return '3rd';
        if (q === 2) return '2nd';
        if (q === 1) return '1st';
        return '';
    };

    const getStatusText = () => {
        if (finished || status === 'FINAL' || status === 'COMPLETED') {
            if (quarter >= 6) return `Final/${quarter - 4}OT`;
            if (quarter === 5) return 'Final/OT';
            return 'Final';
        }
        if (started) {
            const qtr = formatQuarter(quarter);
            const time = (quarter >= 5) ? '' : (clock || '0:00');
            return time ? `${qtr} ${time}` : qtr;
        }
        return null;
    };

    const statusText = getStatusText();

    return (
        <Paper
            elevation={2}
            onClick={() => clickable && navigate(`/game-details/${gameId}`)}
            sx={{
                borderRadius: 1.5,
                overflow: 'hidden',
                cursor: clickable ? 'pointer' : 'default',
                transition: 'transform 0.15s, box-shadow 0.15s',
                '&:hover': clickable ? {
                    transform: 'scale(1.02)',
                    boxShadow: theme.shadows[6],
                } : {},
                minWidth: compact ? 160 : 200,
                maxWidth: compact ? 200 : 260,
            }}
        >
            {/* Title Header (CCG name, Bowl name, etc.) */}
            {title && (
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1,
                    py: 0.5,
                    backgroundColor: '#C9960C',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}>
                    {titleLogo && (
                        <Avatar src={titleLogo} sx={{ width: 18, height: 18, flexShrink: 0 }} variant="rounded" />
                    )}
                    <Typography variant="caption" noWrap sx={{
                        fontWeight: 700,
                        color: 'white',
                        fontSize: '0.7rem',
                        lineHeight: 1.2,
                    }}>
                        {title}
                    </Typography>
                </Box>
            )}

            {/* Home team row */}
            <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                px: 1, py: 0.5,
                backgroundColor: 'transparent',
                borderBottom: '1px solid',
                borderColor: 'divider',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {homeSeed && (
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', minWidth: 20 }}>
                            {homeSeed}
                        </Typography>
                    )}
                    <Avatar src={homeData?.logo} sx={{ width: compact ? 18 : 22, height: compact ? 18 : 22 }}>
                        {home?.charAt(0)}
                    </Avatar>
                    <Typography
                        variant="caption"
                        sx={{
                            fontWeight: homeWon ? 800 : 500,
                            fontSize: compact ? '0.7rem' : '0.75rem',
                            maxWidth: compact ? 80 : 120,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontStyle: (!home || home === 'TBD' || home === 'OPEN') ? 'italic' : 'normal',
                            color: (!home || home === 'TBD' || home === 'OPEN') ? 'text.disabled' : 'text.primary',
                        }}
                    >
                        {(!home || home === 'TBD' || home === 'OPEN') ? 'TBD' : home}
                    </Typography>
                </Box>
                {(finished || started) && homeScore != null && (
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                        {homeScore}
                    </Typography>
                )}
            </Box>
            {/* Away team row */}
            <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                px: 1, py: 0.5,
                backgroundColor: 'transparent',
                borderBottom: statusText ? '1px solid' : 'none',
                borderColor: 'divider',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {awaySeed && (
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', minWidth: 20 }}>
                            {awaySeed}
                        </Typography>
                    )}
                    <Avatar src={awayData?.logo} sx={{ width: compact ? 18 : 22, height: compact ? 18 : 22 }}>
                        {away?.charAt(0)}
                    </Avatar>
                    <Typography
                        variant="caption"
                        sx={{
                            fontWeight: awayWon ? 800 : 500,
                            fontSize: compact ? '0.7rem' : '0.75rem',
                            maxWidth: compact ? 80 : 120,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontStyle: (!away || away === 'TBD' || away === 'OPEN') ? 'italic' : 'normal',
                            color: (!away || away === 'TBD' || away === 'OPEN') ? 'text.disabled' : 'text.primary',
                        }}
                    >
                        {(!away || away === 'TBD' || away === 'OPEN') ? 'TBD' : away}
                    </Typography>
                </Box>
                {(finished || started) && awayScore != null && (
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
                        {awayScore}
                    </Typography>
                )}
            </Box>

            {/* Game Status Row (Quarter/Time or Final) */}
            {statusText && (
                <Box sx={{
                    textAlign: 'center',
                    py: 0.3,
                    px: 1,
                    backgroundColor: finished ? theme.palette.grey[100] : theme.palette.warning.light + '30',
                }}>
                    <Typography variant="caption" sx={{
                        fontWeight: 600,
                        fontSize: '0.65rem',
                        color: finished ? 'text.secondary' : theme.palette.warning.dark,
                        textTransform: 'uppercase',
                    }}>
                        {statusText}
                    </Typography>
                </Box>
            )}
        </Paper>
    );
};

export default BracketMatchup;
