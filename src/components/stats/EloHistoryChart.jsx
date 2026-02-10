import React, { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { Box, Typography, Paper } from '@mui/material';

/**
 * ELO History Chart Component
 * Displays a line chart of ELO ratings over time
 * Supports single team or all teams view
 */
const EloHistoryChart = ({ data, teams = [], showAllTeams = false }) => {
    // Build team map for colors and names
    const teamMap = useMemo(() => {
        const map = {};
        teams.forEach(team => {
            if (team.name) {
                // Handle both camelCase and snake_case from API
                const primaryColor = team.primaryColor || team.primary_color;
                map[team.name] = {
                    primaryColor: primaryColor || '#1976d2',
                    abbreviation: team.abbreviation || team.name?.substring(0, 3).toUpperCase(),
                    name: team.name,
                };
            }
        });
        return map;
    }, [teams]);

    // Transform data for chart
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

        if (showAllTeams) {
            // Group by chronological timeline (season + week combinations)
            // Each point represents a specific season+week, and shows ELO for all teams that played in that week
            
            // First, get all unique season+week combinations and sort chronologically
            const timelineMap = new Map();
            data.forEach(entry => {
                const season = entry.season || entry.season_number || 0;
                const week = entry.week || entry.week_number || 0;
                const key = `${season}_${week}`;
                if (!timelineMap.has(key)) {
                    timelineMap.set(key, {
                        season,
                        week,
                        gameIndex: timelineMap.size + 1,
                    });
                }
            });
            
            // Sort timeline entries chronologically
            const sortedTimeline = Array.from(timelineMap.values())
                .sort((a, b) => {
                    if (a.season !== b.season) return a.season - b.season;
                    return a.week - b.week;
                });
            
            // Reassign gameIndex based on sorted order
            sortedTimeline.forEach((entry, index) => {
                entry.gameIndex = index + 1;
            });
            
            // Create a map of team -> game index -> elo
            const teamGameMap = new Map();
            data.forEach(entry => {
                const teamName = entry.team || entry.team_name;
                if (!teamName) return;
                
                const season = entry.season || entry.season_number || 0;
                const week = entry.week || entry.week_number || 0;
                const key = `${season}_${week}`;
                const timelineEntry = timelineMap.get(key);
                
                if (!timelineEntry) return;
                
                if (!teamGameMap.has(teamName)) {
                    teamGameMap.set(teamName, new Map());
                }
                teamGameMap.get(teamName).set(timelineEntry.gameIndex, {
                    elo: entry.elo || entry.team_elo || 1500,
                    season,
                    week,
                });
            });
            
            // Build chart data points - one per timeline entry
            const chartPoints = sortedTimeline.map((timelineEntry) => {
                const point = {
                    gameIndex: timelineEntry.gameIndex,
                    season: timelineEntry.season,
                    week: timelineEntry.week,
                };
                
                // Add ELO for each team at this game index (only if they played in this week)
                teamGameMap.forEach((gameMap, teamName) => {
                    const teamElo = gameMap.get(timelineEntry.gameIndex);
                    if (teamElo) {
                        point[`${teamName}_elo`] = teamElo.elo;
                    }
                });
                
                return point;
            });
            
            return chartPoints;
        } else {
            // Single team view - simple sequential games
            return data.map((entry, index) => ({
                gameIndex: index + 1,
                elo: entry.elo || entry.team_elo || 1500,
                week: entry.week || entry.week_number || 'N/A',
                season: entry.season || entry.season_number || 0,
                opponent: entry.opponent || 'N/A',
                result: entry.result || '-',
                gameId: entry.game_id || entry.gameId,
            }));
        }
    }, [data, showAllTeams]);

    if (!data || data.length === 0) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                    No ELO history data available
                </Typography>
            </Paper>
        );
    }

    // Custom tooltip for all teams view
    const AllTeamsTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            // Show all teams that have data at this point
            const teamsAtPoint = payload
                .filter(p => p.value != null && p.value !== undefined)
                .map(p => {
                    const teamName = p.dataKey.replace('_elo', '');
                    const teamInfo = teamMap[teamName];
                    return {
                        name: teamInfo?.name || teamName,
                        abbreviation: teamInfo?.abbreviation || teamName?.substring(0, 3).toUpperCase(),
                        elo: p.value,
                        color: teamInfo?.primaryColor || '#1976d2',
                    };
                })
                .sort((a, b) => b.elo - a.elo); // Sort by ELO descending

            return (
                <Paper sx={{ p: 2, border: '1px solid #ccc', maxWidth: 300, maxHeight: 400, overflow: 'auto' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Game #{label}
                    </Typography>
                    {teamsAtPoint.length > 0 ? (
                        teamsAtPoint.map((team, index) => (
                            <Box key={team.name} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Box
                                    sx={{
                                        width: 12,
                                        height: 12,
                                        backgroundColor: team.color,
                                        borderRadius: '50%',
                                        flexShrink: 0,
                                    }}
                                />
                                <Typography variant="body2" sx={{ flex: 1 }}>
                                    {team.abbreviation || team.name}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    {team.elo.toFixed(1)}
                                </Typography>
                            </Box>
                        ))
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            No data at this point
                        </Typography>
                    )}
                </Paper>
            );
        }
        return null;
    };

    // Custom tooltip for single team view
    const SingleTeamTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <Paper sx={{ p: 2, border: '1px solid #ccc' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Game #{data.gameIndex}
                    </Typography>
                    <Typography variant="body2">
                        <strong>Season:</strong> {data.season}
                    </Typography>
                    <Typography variant="body2">
                        <strong>Week:</strong> {data.week}
                    </Typography>
                    <Typography variant="body2">
                        <strong>ELO:</strong> {data.elo?.toFixed(1) || 'N/A'}
                    </Typography>
                    {data.opponent && data.opponent !== 'N/A' && (
                        <Typography variant="body2">
                            <strong>Opponent:</strong> {data.opponent}
                        </Typography>
                    )}
                    {data.result && data.result !== '-' && (
                        <Typography variant="body2">
                            <strong>Result:</strong> {data.result}
                        </Typography>
                    )}
                </Paper>
            );
        }
        return null;
    };

    // Get unique team names from data
    const uniqueTeams = useMemo(() => {
        if (!showAllTeams) return [];
        const teamSet = new Set();
        data.forEach(entry => {
            const teamName = entry.team || entry.team_name;
            if (teamName) teamSet.add(teamName);
        });
        return Array.from(teamSet).sort();
    }, [data, showAllTeams]);

    // Format X-axis label
    const formatXAxisLabel = (value) => {
        return `Game ${value}`;
    };

    return (
        <Box sx={{ width: '100%', height: showAllTeams ? 600 : 500, minHeight: 400, mt: 2 }}>
            <ResponsiveContainer width="100%" height="100%" minHeight={400}>
                <LineChart
                    data={chartData}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="gameIndex"
                        label={{ value: 'Game Number', position: 'insideBottom', offset: -5 }}
                        tickFormatter={formatXAxisLabel}
                    />
                    <YAxis
                        label={{ value: 'ELO Rating', angle: -90, position: 'insideLeft' }}
                        domain={['dataMin - 50', 'dataMax + 50']}
                    />
                    <Tooltip content={showAllTeams ? <AllTeamsTooltip /> : <SingleTeamTooltip />} />
                    {!showAllTeams && <Legend />}
                    {/* Hide legend for all teams view - too many teams to be useful */}
                    {showAllTeams ? (
                        // Render a line for each team
                        uniqueTeams.map((teamName, index) => {
                            const teamInfo = teamMap[teamName];
                            // Use team's primary color from database, or generate a distinct color if missing/invalid
                            let color = teamInfo?.primaryColor;
                            // Only fallback to generated color if color is missing, null, or invalid
                            if (!color || color.trim() === '' || color === '#000000' || color === '#ffffff' || color === '#fff' || color === '#000' || !color.startsWith('#')) {
                                // Generate a distinct color using golden angle for better distribution
                                color = `hsl(${(index * 137.508) % 360}, 70%, 50%)`;
                            }
                            const displayName = teamInfo?.abbreviation || teamName?.substring(0, 10) || teamName;

                            return (
                                <Line
                                    key={teamName}
                                    type="linear"
                                    dataKey={`${teamName}_elo`}
                                    stroke={color}
                                    strokeWidth={1.5}
                                    dot={false}
                                    activeDot={{ r: 5, fill: color }}
                                    name={`${teamName}_elo`}
                                    connectNulls={false}
                                    isAnimationActive={false}
                                />
                            );
                        })
                    ) : (
                        // Single team line
                        <Line
                            type="linear"
                            dataKey="elo"
                            stroke="#1976d2"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                            name="ELO Rating"
                        />
                    )}
                </LineChart>
            </ResponsiveContainer>
        </Box>
    );
};

export default EloHistoryChart;
