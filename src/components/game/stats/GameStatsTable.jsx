import React from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    useTheme
} from '@mui/material';
import PropTypes from 'prop-types';
import { formatTimeOfPossession } from '../../../utils/timeUtils';

const GameStatsTable = ({ homeTeam, awayTeam, homeStats, awayStats }) => {
    const theme = useTheme();

    if (!homeStats || !awayStats) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Game statistics not available yet
                </Typography>
            </Box>
        );
    }

    // Get team colors with fallbacks
    const getTeamColors = (team) => {
        if (!team || !team.primary_color) {
            return {
                primary: theme.palette.primary.main,
                secondary: theme.palette.primary.dark
            };
        }
        
        return {
            primary: team.primary_color,
            secondary: team.secondary_color || theme.palette.primary.dark
        };
    };

    const homeColors = getTeamColors(homeTeam);
    const awayColors = getTeamColors(awayTeam);


    const statsData = [
        {
            label: 'Total Yards',
            home: homeStats.total_yards,
            away: awayStats.total_yards,
            isHeader: true,
        },
        {
            label: 'Yards per Play',
            home: homeStats.average_yards_per_play?.toFixed(2),
            away: awayStats.average_yards_per_play?.toFixed(2),
        },
        {
            label: 'Passing',
            home: homeStats.pass_yards,
            away: awayStats.pass_yards,
            isHeader: true,
        },
        {
            label: 'Completions/Attempts',
            home: `${homeStats.pass_completions || 0}/${homeStats.pass_attempts || 0}`,
            away: `${awayStats.pass_completions || 0}/${awayStats.pass_attempts || 0}`,
        },
        {
            label: 'Yards per Pass',
            home: homeStats.pass_attempts === 0 ? '0.00' : (homeStats.pass_yards / homeStats.pass_attempts).toFixed(2),
            away: awayStats.pass_attempts === 0 ? '0.00' : (awayStats.pass_yards / awayStats.pass_attempts).toFixed(2),
        },
        {
            label: 'Longest Pass',
            home: homeStats.longest_pass,
            away: awayStats.longest_pass,
        },
        {
            label: 'Pass Successes',
            home: homeStats.pass_successes,
            away: awayStats.pass_successes,
        },
        {
            label: 'Sacks Forced',
            home: homeStats.sacks_forced,
            away: awayStats.sacks_forced,
        },
        {
            label: 'Interceptions Thrown',
            home: homeStats.interceptions_lost,
            away: awayStats.interceptions_lost,
        },
        {
            label: 'Passing Touchdowns',
            home: homeStats.pass_touchdowns,
            away: awayStats.pass_touchdowns,
        },
        {
            label: 'Rushing',
            home: homeStats.rush_yards,
            away: awayStats.rush_yards,
            isHeader: true,
        },
        {
            label: 'Rushing Attempts',
            home: homeStats.rush_attempts,
            away: awayStats.rush_attempts,
        },
        {
            label: 'Yards per Rush',
            home: homeStats.rush_attempts === 0 ? '0.00' : (homeStats.rush_yards / homeStats.rush_attempts).toFixed(2),
            away: awayStats.rush_attempts === 0 ? '0.00' : (awayStats.rush_yards / awayStats.rush_attempts).toFixed(2),
        },
        {
            label: 'Longest Run',
            home: homeStats.longest_run,
            away: awayStats.longest_run,
        },
        {
            label: 'Rush Successes',
            home: homeStats.rush_successes,
            away: awayStats.rush_successes,
        },
        {
            label: 'Rushing Touchdowns',
            home: homeStats.rush_touchdowns,
            away: awayStats.rush_touchdowns,
        },
        {
            label: 'Turnovers',
            home: homeStats.turnovers_lost,
            away: awayStats.turnovers_lost,
            isHeader: true,
        },
        {
            label: 'Fumbles Lost',
            home: homeStats.fumbles_lost,
            away: awayStats.fumbles_lost,
        },
        {
            label: 'Interceptions Thrown',
            home: homeStats.interceptions_lost,
            away: awayStats.interceptions_lost,
        },
        {
            label: 'Scoop and Scores Lost',
            home: homeStats.fumble_return_tds_committed,
            away: awayStats.fumble_return_tds_committed,
        },
        {
            label: 'Pick Sixes Thrown',
            home: homeStats.pick_sixes_thrown,
            away: awayStats.pick_sixes_thrown,
        },
        {
            label: 'Turnover Touchdowns Committed',
            home: homeStats.turnover_touchdowns_lost,
            away: awayStats.turnover_touchdowns_lost,
        },
        {
            label: 'Safeties Committed',
            home: homeStats.safeties_committed,
            away: awayStats.safeties_committed,
        },
        {
            label: 'Efficiency',
            isHeader: true,
            home: '-',
            away: '-'
        },
        {
            label: 'First Downs',
            home: homeStats.first_downs,
            away: awayStats.first_downs,
        },
        {
            label: '3rd Down Efficiency',
            home: `${homeStats.third_down_conversion_success || 0}-${homeStats.third_down_conversion_attempts || 0}`,
            away: `${awayStats.third_down_conversion_success || 0}-${awayStats.third_down_conversion_attempts || 0}`,
        },
        {
            label: '4th Down Efficiency',
            home: `${homeStats.fourth_down_conversion_success || 0}-${homeStats.fourth_down_conversion_attempts || 0}`,
            away: `${awayStats.fourth_down_conversion_success || 0}-${awayStats.fourth_down_conversion_attempts || 0}`,
        },
        {
            label: 'Red Zone Efficiency',
            home: `${homeStats.red_zone_successes || 0}-${homeStats.red_zone_attempts || 0}`,
            away: `${awayStats.red_zone_successes || 0}-${awayStats.red_zone_attempts || 0}`,
        },
        {
            label: 'Special Teams',
            isHeader: true,
            home: '-',
            away: '-',
        },
        {
            label: 'Field Goals Made/Attempted',
            home: `${homeStats.field_goal_made || 0}/${homeStats.field_goal_attempts || 0}`,
            away: `${awayStats.field_goal_made || 0}/${awayStats.field_goal_attempts || 0}`,
        },
        {
            label: 'Longest Field Goal',
            home: homeStats.longest_field_goal,
            away: awayStats.longest_field_goal,
        },
        {
            label: 'Field Goals Blocked',
            home: homeStats.blocked_opponent_field_goals,
            away: awayStats.blocked_opponent_field_goals,
        },
        {
            label: 'Punts',
            home: homeStats.punts_attempted,
            away: awayStats.punts_attempted,
        },
        {
            label: 'Longest Punt',
            home: homeStats.longest_punt,
            away: awayStats.longest_punt,
        },
        {
            label: 'Average Punt',
            home: homeStats.average_punt_length?.toFixed(2),
            away: awayStats.average_punt_length?.toFixed(2),
        },
        {
            label: 'Punts Blocked',
            home: homeStats.blocked_opponent_punt,
            away: awayStats.blocked_opponent_punt,
        },
        {
            label: 'Punt Return Touchdowns',
            home: homeStats.punt_return_td,
            away: awayStats.punt_return_td,
        },
        {
            label: 'Kick Return Touchdowns',
            home: homeStats.kick_return_td,
            away: awayStats.kick_return_td,
        },
        {
            label: 'Drives',
            home: homeStats.number_of_drives,
            away: awayStats.number_of_drives,
            isHeader: true,
        },
        {
            label: 'Possession',
            home: formatTimeOfPossession(homeStats.time_of_possession),
            away: formatTimeOfPossession(awayStats.time_of_possession),
            isHeader: true,
        },
        {
            label: 'Game Performance',
            isHeader: true,
            home: '-',
            away: '-',
        },
        {
            label: 'Average Difference',
            home: homeStats.average_diff?.toFixed(2),
            away: '-'
        },
        {
            label: 'Average Offensive Difference',
            home: homeStats.average_offensive_diff?.toFixed(2),
            away: awayStats.average_offensive_diff?.toFixed(2),
        },
        {
            label: 'Average Defensive Difference',
            home: homeStats.average_defensive_diff?.toFixed(2),
            away: awayStats.average_defensive_diff?.toFixed(2),
        },
        {
            label: 'Average Off. Special Teams Difference',
            home: homeStats.average_offensive_special_teams_diff?.toFixed(2),
            away: awayStats.average_offensive_special_teams_diff?.toFixed(2),
        },
        {
            label: 'Average Def. Special Teams Difference',
            home: homeStats.average_defensive_special_teams_diff?.toFixed(2),
            away: awayStats.average_defensive_special_teams_diff?.toFixed(2),
        },
        {
            label: 'Average Response Time',
            home: formatTimeOfPossession(homeStats.average_response_speed?.toFixed(0)),
            away: formatTimeOfPossession(awayStats.average_response_speed?.toFixed(0)),
        },
    ];

    return (
        <Box sx={{ maxWidth: 600, margin: 'auto' }}>
            <Table size="small" sx={{ '& .MuiTableCell-root': { py: 0.25 } }}>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ width: '50%' }}></TableCell>
                        <TableCell
                            sx={{
                                width: '25%',
                                align: "center",
                                borderBottom: `2px solid ${homeColors.primary}`,
                                py: 1,
                                backgroundColor: 'white'
                            }}
                        >
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <img 
                                    src={homeTeam?.logo} 
                                    alt={`${homeTeam?.name} Logo`} 
                                    style={{ width: 20, height: 20, marginBottom: 2 }} 
                                />
                                <Typography variant="caption" sx={{ fontWeight: 600, color: homeColors.primary, fontSize: '0.7rem' }}>
                                    {homeTeam?.name || 'Home'}
                                </Typography>
                            </Box>
                        </TableCell>
                        <TableCell
                            sx={{
                                width: '25%',
                                align: "center",
                                borderBottom: `2px solid ${awayColors.primary}`,
                                py: 1,
                                backgroundColor: 'white'
                            }}
                        >
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <img 
                                    src={awayTeam?.logo} 
                                    alt={`${awayTeam?.name} Logo`} 
                                    style={{ width: 20, height: 20, marginBottom: 2 }} 
                                />
                                <Typography variant="caption" sx={{ fontWeight: 600, color: awayColors.primary, fontSize: '0.7rem' }}>
                                    {awayTeam?.name || 'Away'}
                                </Typography>
                            </Box>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {statsData.map((stat, index) => (
                        <TableRow
                            key={index}
                            sx={{
                                backgroundColor: stat.isHeader ? theme.palette.grey[100] : 'inherit',
                                '&:hover': { backgroundColor: theme.palette.action.hover }
                            }}
                        >
                            <TableCell
                                sx={{
                                    fontWeight: stat.isHeader ? 600 : 400,
                                    pl: stat.isHeader ? 1 : 2,
                                    fontSize: "0.7rem",
                                    py: 0.25,
                                    borderRight: stat.isHeader ? '2px solid' : 'none',
                                    borderColor: theme.palette.divider
                                }}
                            >
                                {stat.label}
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: stat.isHeader ? 600 : 400,
                                    textAlign: "center",
                                    fontSize: "0.7rem",
                                    py: 0.25,
                                    color: 'black',
                                    backgroundColor: `${homeColors.primary}15`
                                }}
                            >
                                {stat.home !== undefined && stat.home !== null ? stat.home : 0}
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: stat.isHeader ? 600 : 400,
                                    textAlign: "center",
                                    fontSize: "0.7rem",
                                    py: 0.25,
                                    color: 'black',
                                    backgroundColor: `${awayColors.primary}15`
                                }}
                            >
                                {stat.away !== undefined && stat.away !== null ? stat.away : 0}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    );
};

GameStatsTable.propTypes = {
    homeTeam: PropTypes.object,
    awayTeam: PropTypes.object,
    homeStats: PropTypes.object,
    awayStats: PropTypes.object
};

export default GameStatsTable; 