import React, { useMemo, useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Brush,
    ReferenceLine,
} from 'recharts';
import { Box, Typography, Paper, Avatar, IconButton, Tooltip as MuiTooltip } from '@mui/material';
import { ZoomIn, ZoomOut, FitScreen } from '@mui/icons-material';

/**
 * Rankings History Chart Component
 * Displays a line chart of coaches poll rankings over time
 * Supports single team or all teams view
 */
const RankingsHistoryChart = ({ data, teams = [], showAllTeams = false }) => {
    // Zoom state for line charts
    const [zoomDomain, setZoomDomain] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(null);
    // Build team map for colors, names, and logos
    const teamMap = useMemo(() => {
        const map = {};
        teams.forEach(team => {
            if (team.name) {
                const primaryColor = team.primaryColor || team.primary_color;
                map[team.name] = {
                    primaryColor: primaryColor || '#1976d2',
                    abbreviation: team.abbreviation || team.name?.substring(0, 3).toUpperCase(),
                    name: team.name,
                    logo: team.logo || null,
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
            const timelineMap = new Map();
            data.forEach(game => {
                const season = game.season || game.season_number || 0;
                const week = game.week || game.week_number || 0;
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
            
            // Create a map of team -> game index -> rank
            const teamGameMap = new Map();
            data.forEach(game => {
                const season = game.season || game.season_number || 0;
                const week = game.week || game.week_number || 0;
                const key = `${season}_${week}`;
                const timelineEntry = timelineMap.get(key);
                
                if (!timelineEntry) return;
                
                // Process home team rank
                if (game.home_team_rank && game.home_team_rank >= 1 && game.home_team_rank <= 25) {
                    const teamName = game.home_team || game.homeTeam;
                    if (teamName) {
                        if (!teamGameMap.has(teamName)) {
                            teamGameMap.set(teamName, new Map());
                        }
                        teamGameMap.get(teamName).set(timelineEntry.gameIndex, {
                            rank: game.home_team_rank,
                            season,
                            week,
                        });
                    }
                }
                
                // Process away team rank
                if (game.away_team_rank && game.away_team_rank >= 1 && game.away_team_rank <= 25) {
                    const teamName = game.away_team || game.awayTeam;
                    if (teamName) {
                        if (!teamGameMap.has(teamName)) {
                            teamGameMap.set(teamName, new Map());
                        }
                        teamGameMap.get(teamName).set(timelineEntry.gameIndex, {
                            rank: game.away_team_rank,
                            season,
                            week,
                        });
                    }
                }
            });
            
            // Build chart data points
            const chartPoints = sortedTimeline.map((timelineEntry) => {
                const point = {
                    gameIndex: timelineEntry.gameIndex,
                    season: timelineEntry.season,
                    week: timelineEntry.week,
                };
                
                // Add rank for each team at this game index
                teamGameMap.forEach((gameMap, teamName) => {
                    const teamRank = gameMap.get(timelineEntry.gameIndex);
                    if (teamRank) {
                        point[`${teamName}_rank`] = teamRank.rank;
                    }
                });
                
                return point;
            });
            
            return chartPoints;
        } else {
            // Single team view
            const teamRankings = [];
            data.forEach(game => {
                const season = game.season || game.season_number || 0;
                const week = game.week || game.week_number || 0;
                
                // Check if this team is home or away
                const isHome = game.home_team === teams[0]?.name || game.homeTeam === teams[0]?.name;
                const rank = isHome ? (game.home_team_rank || game.homeTeamRank) : (game.away_team_rank || game.awayTeamRank);
                
                if (rank && rank >= 1 && rank <= 25) {
                    teamRankings.push({
                        gameIndex: teamRankings.length + 1,
                        rank,
                        week,
                        season,
                        opponent: isHome ? (game.away_team || game.awayTeam) : (game.home_team || game.homeTeam),
                    });
                }
            });
            
            return teamRankings;
        }
    }, [data, showAllTeams, teams]);

    if (!data || data.length === 0) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                    No rankings history data available
                </Typography>
            </Paper>
        );
    }

    // Custom tooltip for all teams view - only show the hovered team
    const AllTeamsTooltip = ({ active, payload, label, coordinate }) => {
        if (!active || !payload || payload.length === 0) {
            return null;
        }

        // With shared={false}, payload should only contain the hovered line's data
        // But filter to ensure we only show valid rank data
        const validPayloads = payload.filter(
            p => p.value != null && p.value !== undefined && p.dataKey && p.dataKey.includes('_rank')
        );

        if (validPayloads.length === 0) {
            return null;
        }

        // Try to identify which line is actually being hovered
        // If we have coordinate info, use it to find the closest line
        let hoveredPayload = validPayloads[0];
        
        if (coordinate && validPayloads.length > 1) {
            // Find the payload whose Y coordinate is closest to the mouse Y coordinate
            // This helps identify which line is actually being hovered
            let closestPayload = validPayloads[0];
            let minDistance = Infinity;
            
            validPayloads.forEach(p => {
                // Calculate distance from mouse Y to the payload's Y position
                // The payload should have coordinate information
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
        
        const teamName = hoveredPayload.dataKey.replace('_rank', '');
        const teamInfo = teamMap[teamName];
        
        if (!teamInfo && !teamName) {
            return null;
        }

        const dataPoint = hoveredPayload.payload;
        const season = dataPoint?.season || 'N/A';
        const week = dataPoint?.week || 'N/A';

        return (
            <Paper sx={{ p: 2, border: '1px solid #ccc', maxWidth: 250 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Season {season}, Week {week}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {teamInfo?.logo && (
                        <Avatar
                            src={teamInfo.logo}
                            alt={teamInfo.name}
                            sx={{ width: 24, height: 24 }}
                        />
                    )}
                    <Box
                        sx={{
                            width: 12,
                            height: 12,
                            backgroundColor: teamInfo?.primaryColor || '#1976d2',
                            borderRadius: '50%',
                            flexShrink: 0,
                        }}
                    />
                    <Typography variant="body2" sx={{ flex: 1, fontWeight: 'bold' }}>
                        {teamInfo?.name || teamName}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        #{hoveredPayload.value}
                    </Typography>
                </Box>
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
                        <strong>Rank:</strong> #{data.rank}
                    </Typography>
                    <Typography variant="body2">
                        <strong>Season:</strong> {data.season}
                    </Typography>
                    <Typography variant="body2">
                        <strong>Week:</strong> {data.week}
                    </Typography>
                    {data.opponent && (
                        <Typography variant="body2">
                            <strong>Opponent:</strong> {data.opponent}
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
        data.forEach(game => {
            if (game.home_team_rank && game.home_team_rank >= 1 && game.home_team_rank <= 25) {
                teamSet.add(game.home_team || game.homeTeam);
            }
            if (game.away_team_rank && game.away_team_rank >= 1 && game.away_team_rank <= 25) {
                teamSet.add(game.away_team || game.awayTeam);
            }
        });
        return Array.from(teamSet).filter(Boolean).sort();
    }, [data, showAllTeams]);

    // Format X-axis label - show week instead of game number
    const formatXAxisLabel = (value, payload) => {
        if (!payload || !payload.payload) return `Game ${value}`;
        const dataPoint = payload.payload;
        const season = dataPoint.season || dataPoint.season_number;
        const week = dataPoint.week || dataPoint.week_number;
        if (season && week) {
            return `S${season} W${week}`;
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
        chartData.forEach((point, index) => {
            const currentSeason = point.season || point.season_number;
            const currentWeek = point.week || point.week_number;
            
            // Check for season change OR significant week decrease (indicating new season)
            if (lastSeason !== null && lastWeek !== null) {
                const seasonChanged = currentSeason !== lastSeason;
                // Week decreased significantly (e.g., 14 -> 1, 12 -> 2) indicates new season
                // Only trigger if week decreased by more than 2 (to avoid false positives)
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

    // Y-axis: rank 1 at top, 25 at bottom (reversed)
    const yAxisDomain = [1, 25];

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
                        domain={zoomDomain ? zoomDomain : ['auto', 'auto']}
                        allowDataOverflow={true}
                        tickFormatter={(value) => {
                            const dataPoint = chartData.find(d => d.gameIndex === value);
                            if (dataPoint) {
                                const season = dataPoint.season || dataPoint.season_number;
                                const week = dataPoint.week !== undefined && dataPoint.week !== null ? dataPoint.week : (dataPoint.week_number !== undefined && dataPoint.week_number !== null ? dataPoint.week_number : null);
                                if (season && week !== null && week !== undefined && week > 0) {
                                    return `W${week}`;
                                }
                            }
                            return `Game ${value}`;
                        }}
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
                        label={{ value: 'Rank', angle: -90, position: 'insideLeft', offset: 10 }}
                        domain={yAxisDomain}
                        reversed={true}
                        allowDataOverflow={false}
                    />
                    <Tooltip 
                        content={showAllTeams ? <AllTeamsTooltip /> : <SingleTeamTooltip />} 
                        shared={false}
                        filterNull={true}
                    />
                    {showAllTeams ? (
                        // Render a line for each team
                        uniqueTeams.map((teamName) => {
                            const teamInfo = teamMap[teamName];
                            let color = teamInfo?.primaryColor || '#1976d2';
                            if (!color || color.trim() === '' || color === '#000000' || color === '#ffffff' || color === '#fff' || color === '#000' || !color.startsWith('#')) {
                                color = '#1976d2';
                            }

                            return (
                                <Line
                                    key={teamName}
                                    type="linear"
                                    dataKey={`${teamName}_rank`}
                                    stroke={color}
                                    strokeWidth={1.5}
                                    dot={false}
                                    activeDot={{ r: 6, fill: color, strokeWidth: 2, stroke: '#fff' }}
                                    connectNulls={false}
                                    isAnimationActive={false}
                                    hide={false}
                                />
                            );
                        })
                    ) : (
                        // Single team line
                        <Line
                            type="linear"
                            dataKey="rank"
                            stroke="#1976d2"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    )}
                    {/* Add zoom brush for all teams view - allows manual zoom by dragging */}
                    {showAllTeams && chartData.length > 0 && (
                        <Brush
                            dataKey="gameIndex"
                            height={30}
                            stroke="#8884d8"
                            tickFormatter={(value) => {
                                const dataPoint = chartData.find(d => d.gameIndex === value);
                                if (dataPoint) {
                                    const season = dataPoint.season || dataPoint.season_number;
                                    const week = dataPoint.week || dataPoint.week_number;
                                    if (season && week) {
                                        return `W${week}`;
                                    }
                                }
                                return `Game ${value}`;
                            }}
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

export default RankingsHistoryChart;
