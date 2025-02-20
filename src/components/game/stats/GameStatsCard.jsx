import React from 'react';
import {Box, Card, Grid, Paper, Typography, useTheme} from "@mui/material";

const StatsGrid = ({ stats }) => (
    <Grid container spacing={2}>
        {Object.entries(stats).map(([label, value]) => (
            <Grid item xs={6} key={label}>
                <Typography variant="body2" sx={{ fontWeight: '500' }}>
                    {label}:
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    {value}
                </Typography>
            </Grid>
        ))}
    </Grid>
);

const GameStatsCard = ({ team, stats, teamLogo }) => (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
        {/* Team Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box
                sx={{
                    width: 40,
                    height: 40,
                    overflow: 'hidden',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mr: 2,
                }}
            >
                <img
                    src={teamLogo}
                    alt={team}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                    }}
                />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#004260' }}>
                {team} Statistics
            </Typography>
        </Box>

        {/* Stats Sections */}
        <Grid container spacing={3}>
            {/* Offensive Stats */}
            <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#004260' }}>
                        Offensive Stats
                    </Typography>
                    <StatsGrid stats={{
                        'Total Yards': stats.total_yards,
                        'Pass Yards': stats.pass_yards,
                        'Rush Yards': stats.rush_yards,
                        'Yards/Play': stats.average_yards_per_play.toFixed(1),
                        '3rd Down %': (stats.third_down_conversion_percentage * 100).toFixed(1) + '%',
                        '4th Down %': (stats.fourth_down_conversion_percentage * 100).toFixed(1) + '%',
                    }} />
                </Box>
            </Grid>

            {/* Defensive Stats */}
            <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#004260' }}>
                        Defensive Stats
                    </Typography>
                    <StatsGrid stats={{
                        'Sacks Forced': stats.sacks_forced,
                        'Interceptions': stats.interceptions_forced,
                        'Fumbles Forced': stats.fumbles_forced,
                        'Turnovers Forced': stats.turnovers_forced,
                        'Safeties': stats.safeties_forced,
                        'Defensive TDs': stats.turnover_touchdowns_forced,
                    }} />
                </Box>
            </Grid>

            {/* Special Teams */}
            <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#004260' }}>
                        Special Teams
                    </Typography>
                    <StatsGrid stats={{
                        'FG Percentage': (stats.field_goal_percentage * 100).toFixed(1) + '%',
                        'Punt Avg': stats.average_punt_length.toFixed(1),
                        'Kick Return TDs': stats.kick_return_td,
                        'Punt Return TDs': stats.punt_return_td,
                        'Touchback %': (stats.touchback_percentage * 100).toFixed(1) + '%',
                        'Onside %': (stats.onside_success_percentage * 100).toFixed(1) + '%',
                    }} />
                </Box>
            </Grid>

            {/* Game Overview */}
            <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#004260' }}>
                        Game Overview
                    </Typography>
                    <StatsGrid stats={{
                        'Time of Possession': `${Math.floor(stats.time_of_possession / 60)}:${(stats.time_of_possession % 60).toString().padStart(2, '0')}`,
                        'Red Zone %': (stats.red_zone_success_percentage * 100).toFixed(1) + '%',
                        'Turnover Diff': stats.turnover_differential,
                        'Largest Lead': stats.largest_lead,
                        'Q1 Score': stats.q1_score,
                        'Q2 Score': stats.q2_score,
                        'Q3 Score': stats.q3_score,
                        'Q4 Score': stats.q4_score,
                        'OT Score': stats.ot_score,
                    }} />
                </Box>
            </Grid>
        </Grid>
    </Paper>
);

export default GameStatsCard;