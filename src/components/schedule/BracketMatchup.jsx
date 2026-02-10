import React from 'react';
import { Box, Typography, Avatar, Paper, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { field } from '../../utils/fieldHelper';

const BracketMatchup = ({ game, teamMap = {}, compact = false }) => {
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
    const clickable = gameId && started;

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
            {/* Home team row */}
            <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                px: 1, py: 0.5,
                backgroundColor: homeWon ? 'rgba(5, 150, 105, 0.12)' : 'transparent',
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
                backgroundColor: awayWon ? 'rgba(5, 150, 105, 0.12)' : 'transparent',
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
        </Paper>
    );
};

export default BracketMatchup;
