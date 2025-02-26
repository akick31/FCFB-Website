import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Box } from '@mui/material';

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60); // Get minutes
    const remainingSeconds = seconds % 60;  // Get the remaining seconds
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`; // Format as mm:ss
}

const StatsTable = ({ homeTeam, awayTeam, homeStats, awayStats }) => {
    const statsData = [
        {
            label: 'Total Yards',
            home: homeStats.total_yards,
            away: awayStats.total_yards,
            isHeader: true,
        },
        {
            label: 'Yard per Play',
            home: homeStats.average_yards_per_play.toFixed(2),
            away: awayStats.average_yards_per_play.toFixed(2),
        },
        {
            label: 'Passing',
            home: homeStats.pass_yards,
            away: awayStats.pass_yards,
            isHeader: true,
        },
        {
            label: 'Completions/Attempts',
            home: `${homeStats.pass_completions}/${homeStats.pass_attempts}`,
            away: `${awayStats.pass_completions}/${awayStats.pass_attempts}`,
        },
        {
            label: 'Yards per Pass',
            home: (homeStats.pass_attempts === 0 ? 0.0 : (homeStats.pass_yards / homeStats.pass_attempts).toFixed(2)),
            away: (awayStats.pass_attempts === 0 ? 0.0 : (awayStats.pass_yards / awayStats.pass_attempts).toFixed(2)),
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
            home: (homeStats.rush_attempts === 0 ? 0.0 : (homeStats.rush_yards / homeStats.rush_attempts).toFixed(2)),
            away: (awayStats.rush_attempts === 0 ? 0.0 : (awayStats.rush_yards / awayStats.rush_attempts).toFixed(2)),
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
        },
        {
            label: 'First Downs',
            home: homeStats.first_downs,
            away: awayStats.first_downs,
        },
        {
            label: '3rd Down Efficiency',
            home: `${homeStats.third_down_conversion_success}-${homeStats.third_down_conversion_attempts}`,
            away: `${awayStats.third_down_conversion_success}-${awayStats.third_down_conversion_attempts}`,
        },
        {
            label: '4th Down Efficiency',
            home: `${homeStats.fourth_down_conversion_success}-${homeStats.fourth_down_conversion_attempts}`,
            away: `${awayStats.fourth_down_conversion_success}-${awayStats.fourth_down_conversion_attempts}`,
        },
        {
            label: 'Red Zone Efficiency',
            home: `${homeStats.red_zone_successes}-${homeStats.red_zone_attempts}`,
            away: `${awayStats.red_zone_successes}-${awayStats.red_zone_attempts}`,
        },
        {
            label: 'Special Teams',
            isHeader: true,
        },
        {
            label: 'Field Goals Made/Attempted',
            home: `${homeStats.field_goal_made}/${homeStats.field_goal_attempts}`,
            away: `${awayStats.field_goal_made}/${awayStats.field_goal_attempts}`,
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
            home: homeStats.average_punt_length.toFixed(2),
            away: awayStats.average_punt_length.toFixed(2),
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
            home: formatTime(homeStats.time_of_possession),
            away: formatTime(awayStats.time_of_possession),
            isHeader: true,
        },
        {
            label: 'Fake CFB',
            isHeader: true,
        },
        {
            label: 'Average Difference',
            home: homeStats.average_diff.toFixed(2),
        },
        {
            label: 'Average Offensive Difference',
            home: homeStats.average_offensive_diff.toFixed(2),
            away: awayStats.average_offensive_diff.toFixed(2),
        },
        {
            label: 'Average Defensive Difference',
            home: homeStats.average_defensive_diff.toFixed(2),
            away: awayStats.average_defensive_diff.toFixed(2),
        },
        {
            label: 'Average Off. Special Teams Difference',
            home: homeStats.average_offensive_special_teams_diff.toFixed(2),
            away: awayStats.average_offensive_special_teams_diff.toFixed(2),
        },
        {
            label: 'Average Def. Special Teams Difference',
            home: homeStats.average_defensive_special_teams_diff.toFixed(2),
            away: awayStats.average_defensive_special_teams_diff.toFixed(2),
        },
        {
            label: 'Average Response Time',
            home: formatTime(Number(homeStats.average_response_speed.toFixed(0))),
            away: formatTime(Number(awayStats.average_response_speed.toFixed(0))),
        },
    ];

    return (
        <Box sx={{ maxWidth: 600, margin: 'auto', padding: 2 }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell></TableCell>
                        <TableCell
                            sx={{
                                width: '10%',
                                align: "center"
                            }}
                        >
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <img src={homeTeam.logo} alt={`${homeTeam.name} Logo`} style={{ width: 30, height: 30 }} />
                            </Box>
                        </TableCell>
                        <TableCell
                            sx={{
                                width: '10%',
                                align: "center"
                            }}
                        >
                            <Box display="flex" flexDirection="column" alignItems="center">
                                <img src={awayTeam.logo} alt={`${awayTeam.name} Logo`} style={{ width: 30, height: 30 }} />
                            </Box>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {statsData.map((stat, index) => (
                        <TableRow
                            key={index}
                            sx={{
                                backgroundColor: index % 2 === 0 ? "#f5f5f5" : "inherit",
                            }}
                        >
                            {/* Label column */}
                            <TableCell
                                sx={{
                                    fontWeight: stat.isHeader ? "bold" : "normal",
                                    pl: stat.isHeader ? 1 : 3,
                                    fontSize: "0.85rem",
                                    py: 0.5,
                                    width: '40%'
                                }}
                            >
                                {stat.label}
                            </TableCell>

                            {/* Home Stats */}
                            <TableCell
                                sx={{
                                    fontWeight: stat.isHeader ? "bold" : "normal",
                                    textAlign: "center",
                                    fontSize: "0.85rem",
                                    py: 0.5,
                                }}
                            >
                                {stat.home}
                            </TableCell>

                            {/* Away Stats */}
                            <TableCell
                                sx={{
                                    fontWeight: stat.isHeader ? "bold" : "normal",
                                    textAlign: "center",
                                    fontSize: "0.85rem",
                                    py: 0.5,
                                }}
                            >
                                {stat.away}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    );
};

export default StatsTable;