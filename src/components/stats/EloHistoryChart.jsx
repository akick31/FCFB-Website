import React, { useMemo, useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Brush,
    ReferenceLine,
} from 'recharts';
import { Box, Typography, Paper, IconButton, Tooltip as MuiTooltip } from '@mui/material';
import { ZoomIn, ZoomOut, FitScreen } from '@mui/icons-material';

/**
 * ELO History Chart Component
 * Displays a line chart of ELO ratings over time
 * Supports single team or all teams view
 */
const EloHistoryChart = ({ data, teams = [], showAllTeams = false }) => {
    // Zoom state for line charts
    const [zoomDomain, setZoomDomain] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(null);
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

    // Custom tooltip for all teams view - shows only the team being hovered
    const AllTeamsTooltip = ({ active, payload, label, coordinate }) => {
        if (!active || !payload || payload.length === 0) {
            return null;
        }

        // Filter to only show payloads with valid values
        // With shared={false}, there should only be one, but filter just in case
        const validPayloads = payload.filter(
            p => p.value != null && p.value !== undefined && p.dataKey && p.dataKey.includes('_elo')
        );

        if (validPayloads.length === 0) {
            return null;
        }

        // Try to identify which line is actually being hovered
        // If we have coordinate info, use it to find the closest line
        let hoveredPayload = validPayloads[0];
        
        if (coordinate && validPayloads.length > 1) {
            // Find the payload whose Y coordinate is closest to the mouse Y coordinate
            let closestPayload = validPayloads[0];
            let minDistance = Infinity;
            
            validPayloads.forEach(p => {
                if (p.coordinate && coordinate.y !== undefined) {
                    const distance = Math.abs(p.coordinate.y - coordinate.y);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestPayload = p;
                    }
                }
            });
            
            hoveredPayload = closestPayload;
        }
        
        const teamName = hoveredPayload.dataKey.replace('_elo', '');
        const teamInfo = teamMap[teamName];
        
        if (!teamInfo && !teamName) {
            return null;
        }

        const teamData = {
            name: teamInfo?.name || teamName,
            abbreviation: teamInfo?.abbreviation || teamName?.substring(0, 3).toUpperCase(),
            elo: hoveredPayload.value,
            color: teamInfo?.primaryColor || '#1976d2',
        };

        // Get season and week from the payload's payload (the data point)
        const dataPoint = hoveredPayload.payload;
        const season = dataPoint?.season || 'N/A';
        const week = dataPoint?.week || 'N/A';

        return (
            <Paper sx={{ p: 2, border: '1px solid #ccc', maxWidth: 250 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Game #{label}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box
                        sx={{
                            width: 12,
                            height: 12,
                            backgroundColor: teamData.color,
                            borderRadius: '50%',
                            flexShrink: 0,
                        }}
                    />
                    <Typography variant="body2" sx={{ flex: 1, fontWeight: 'bold' }}>
                        {teamData.name}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {teamData.elo.toFixed(1)}
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                    Season {season}, Week {week}
                </Typography>
            </Paper>
        );
    };

    // Custom tooltip for single team view
    const SingleTeamTooltip = ({ active, payload }) => {
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

    // Format X-axis label - show week instead of game number
    const formatXAxisLabel = (value) => {
        const dataPoint = chartData.find(d => d.gameIndex === value);
        if (dataPoint) {
            const season = dataPoint.season || dataPoint.season_number;
            const week = dataPoint.week || dataPoint.week_number;
            if (season && week) {
                return `W${week}`;
            }
        }
        return `Game ${value}`;
    };
    
    // Get season boundaries for visual delineation
    // Detect when season changes OR when week decreases significantly (14 -> 1 indicates new season)
    const seasonBoundaries = useMemo(() => {
        if (!chartData || chartData.length === 0) return [];
        const boundaries = [];
        let lastSeason = null;
        let lastWeek = null;
        chartData.forEach((point) => {
            const currentSeason = point.season || point.season_number;
            const currentWeek = point.week || point.week_number;
            
            // Check for season change OR significant week decrease (indicating new season)
            if (lastSeason !== null && lastWeek !== null) {
                const seasonChanged = currentSeason !== lastSeason;
                // Week decreased significantly (e.g., 14 -> 1, 12 -> 2) indicates new season
                const weekDecreasedSignificantly = currentWeek < lastWeek && (lastWeek - currentWeek) > 2;
                
                if (seasonChanged || weekDecreasedSignificantly) {
                    // Use the gameIndex from the current point for the boundary
                    const boundaryGameIndex = point.gameIndex;
                    if (boundaryGameIndex) {
                        boundaries.push({
                            gameIndex: boundaryGameIndex,
                            season: seasonChanged ? lastSeason : (currentSeason > 0 ? currentSeason - 1 : currentSeason),
                        });
                    }
                }
            }
            lastSeason = currentSeason;
            lastWeek = currentWeek;
        });
        return boundaries;
    }, [chartData]);

    // Zoom handlers - allow zooming beyond data bounds
    const handleZoomIn = () => {
        if (!chartData || chartData.length === 0) return;
        const currentDomain = zoomDomain || [chartData[0].gameIndex, chartData[chartData.length - 1].gameIndex];
        const range = currentDomain[1] - currentDomain[0];
        const newRange = range * 0.7; // Zoom in by 30%
        const center = (currentDomain[0] + currentDomain[1]) / 2;
        // Allow zooming beyond bounds - don't constrain to data range
        setZoomDomain([center - newRange / 2, center + newRange / 2]);
    };

    const handleZoomOut = () => {
        if (!chartData || chartData.length === 0) return;
        const currentDomain = zoomDomain || [chartData[0].gameIndex, chartData[chartData.length - 1].gameIndex];
        const range = currentDomain[1] - currentDomain[0];
        const newRange = range * 1.4; // Zoom out by 40%
        const center = (currentDomain[0] + currentDomain[1]) / 2;
        const newDomain = [center - newRange / 2, center + newRange / 2];
        // Check if we've zoomed out enough to see all data
        if (newDomain[0] <= chartData[0].gameIndex && newDomain[1] >= chartData[chartData.length - 1].gameIndex) {
            setZoomDomain(null); // Reset to full view
        } else {
            setZoomDomain(newDomain);
        }
    };

    const handleResetZoom = () => {
        setZoomDomain(null);
    };

    // Pan/drag handlers for line charts - enable when zoomed
    const handleMouseDown = (e) => {
        if (zoomDomain && e.button === 0) { // Left mouse button
            // Don't start dragging if clicking on buttons or icons
            const target = e.target;
            if (target.closest('button') || target.closest('[role="button"]') || 
                target.closest('.MuiIconButton-root') || target.closest('.MuiTooltip-root')) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
            setDragStart({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseMove = useMemo(() => {
        return (e) => {
            if (!isDragging || !dragStart || !zoomDomain || chartData.length === 0) {
                return;
            }
            
            e.preventDefault();
            const deltaX = e.clientX - dragStart.x;
            
            if (Math.abs(deltaX) < 1) return;
            
            const currentDomain = zoomDomain;
            const range = currentDomain[1] - currentDomain[0];
            // Dragging right (positive deltaX) should pan left (decrease domain)
            const panX = -(deltaX / 500) * range;
            
            const newDomain = [currentDomain[0] + panX, currentDomain[1] + panX];
            // Update immediately for smooth dragging
            setZoomDomain(newDomain);
            
            setDragStart({ x: e.clientX, y: e.clientY });
        };
    }, [isDragging, dragStart, zoomDomain, chartData]);

    const handleMouseUp = useMemo(() => {
        return () => {
            setIsDragging(false);
            setDragStart(null);
        };
    }, []);

    useEffect(() => {
        if (isDragging) {
            const moveHandler = (e) => handleMouseMove(e);
            const upHandler = () => handleMouseUp();
            
            window.addEventListener('mousemove', moveHandler);
            window.addEventListener('mouseup', upHandler);
            window.addEventListener('mouseleave', upHandler);
            
            return () => {
                window.removeEventListener('mousemove', moveHandler);
                window.removeEventListener('mouseup', upHandler);
                window.removeEventListener('mouseleave', upHandler);
            };
        }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <Box sx={{ width: '100%', height: showAllTeams ? 600 : 500, minHeight: 400, mt: 2 }}>
            {/* Zoom controls */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 1 }}>
                <MuiTooltip title="Zoom In">
                    <IconButton size="small" onClick={handleZoomIn} disabled={!chartData || chartData.length === 0}>
                        <ZoomIn />
                    </IconButton>
                </MuiTooltip>
                <MuiTooltip title="Zoom Out">
                    <IconButton size="small" onClick={handleZoomOut} disabled={!chartData || chartData.length === 0}>
                        <ZoomOut />
                    </IconButton>
                </MuiTooltip>
                <MuiTooltip title="Reset Zoom">
                    <IconButton size="small" onClick={handleResetZoom} disabled={zoomDomain === null}>
                        <FitScreen />
                    </IconButton>
                </MuiTooltip>
            </Box>
            <Box
                onMouseDown={handleMouseDown}
                onContextMenu={(e) => e.preventDefault()}
                sx={{
                    cursor: zoomDomain ? (isDragging ? 'grabbing' : 'grab') : 'default',
                    userSelect: 'none'
                }}
            >
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
                        label={{ value: 'Week', position: 'insideBottom', offset: -5 }}
                        tickFormatter={formatXAxisLabel}
                        domain={zoomDomain ? zoomDomain : ['auto', 'auto']}
                        allowDataOverflow={true}
                    />
                    {/* Add CLEAR season boundary lines - solid black with SEASON X label */}
                    {seasonBoundaries.length > 0 && seasonBoundaries.map((boundary, idx) => {
                        if (!boundary.gameIndex) return null;
                        return (
                            <ReferenceLine
                                key={`boundary-${idx}`}
                                x={boundary.gameIndex}
                                stroke="#000000"
                                strokeWidth={2}
                                strokeDasharray="0"
                                label={{
                                    value: `SEASON ${boundary.season + 1}`,
                                    position: 'insideLeft',
                                    fill: '#000000',
                                    fontSize: 11,
                                    fontWeight: 'bold',
                                    angle: -90,
                                    offset: 10
                                }}
                            />
                        );
                    })}
                    <YAxis
                        label={{ value: 'ELO Rating', angle: -90, position: 'insideLeft' }}
                        domain={['dataMin - 50', 'dataMax + 50']}
                    />
                    <Tooltip 
                        content={showAllTeams ? <AllTeamsTooltip /> : <SingleTeamTooltip />} 
                        shared={false}
                        filterNull={false}
                    />
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
                    {/* Add zoom brush for all teams view - allows manual zoom by dragging */}
                    {showAllTeams && chartData.length > 0 && (
                        <Brush
                            dataKey="gameIndex"
                            height={30}
                            stroke="#8884d8"
                            tickFormatter={formatXAxisLabel}
                            startIndex={zoomDomain ? chartData.findIndex(d => d.gameIndex >= zoomDomain[0]) : Math.max(0, chartData.length - 20)}
                            endIndex={zoomDomain ? chartData.findIndex(d => d.gameIndex >= zoomDomain[1]) : chartData.length - 1}
                            onChange={(domain) => {
                                if (domain && domain.startIndex !== undefined && domain.endIndex !== undefined) {
                                    const startGameIndex = chartData[domain.startIndex]?.gameIndex;
                                    const endGameIndex = chartData[domain.endIndex]?.gameIndex;
                                    if (startGameIndex !== undefined && endGameIndex !== undefined) {
                                        setZoomDomain([startGameIndex, endGameIndex]);
                                    } else if (domain.startIndex === 0 && domain.endIndex === chartData.length - 1) {
                                        // Reset zoom if brush covers entire range
                                        setZoomDomain(null);
                                    }
                                }
                            }}
                        />
                    )}
                    </LineChart>
                </ResponsiveContainer>
            </Box>
        </Box>
    );
};

export default EloHistoryChart;
