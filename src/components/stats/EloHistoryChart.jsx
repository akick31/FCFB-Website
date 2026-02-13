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
import { Box, Typography, Paper, IconButton, Tooltip as MuiTooltip, useTheme, useMediaQuery } from '@mui/material';
import { ZoomIn, ZoomOut, FitScreen } from '@mui/icons-material';

const EloHistoryChart = ({ data, teams = [], showAllTeams = false }) => {
    const [zoomDomain, setZoomDomain] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(null);
    
    const teamMap = useMemo(() => {
        const map = {};
        teams.forEach(team => {
            if (team.name) {
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

    // FIXED: Filter to start at Season 11, Week 5 only
    const filteredData = useMemo(() => {
        if (!data || data.length === 0) return [];
        
        return data.filter(entry => {
            const season = entry.season || entry.season_number || 0;
            const week = entry.week || entry.week_number || 0;
            if (season < 11) return false;
            if (season === 11 && week < 5) return false;
            return true;
        });
    }, [data]);

    const chartData = useMemo(() => {
        if (!filteredData || filteredData.length === 0) return [];

        if (showAllTeams) {
            const timelineMap = new Map();
            filteredData.forEach(entry => {
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
            
            const sortedTimeline = Array.from(timelineMap.values())
                .sort((a, b) => {
                    if (a.season !== b.season) return a.season - b.season;
                    return a.week - b.week;
                });
            
            sortedTimeline.forEach((entry, index) => {
                entry.gameIndex = index + 1;
            });
            
            const teamGameMap = new Map();
            filteredData.forEach(entry => {
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
            
            const chartPoints = sortedTimeline.map((timelineEntry) => {
                const point = {
                    gameIndex: timelineEntry.gameIndex,
                    season: timelineEntry.season,
                    week: timelineEntry.week,
                };
                
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
            return filteredData.map((entry, index) => ({
                gameIndex: index + 1,
                elo: entry.elo || entry.team_elo || 1500,
                week: entry.week || entry.week_number || 'N/A',
                season: entry.season || entry.season_number || 0,
                opponent: entry.opponent || 'N/A',
                result: entry.result || '-',
                gameId: entry.game_id || entry.gameId,
            }));
        }
    }, [filteredData, showAllTeams]);

    // FIXED: Don't set initial zoom - let users see full timeline and scroll to current
    // Users can use the brush or zoom buttons to focus on recent weeks

    if (!filteredData || filteredData.length === 0) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                    No ELO history data available (starts from Season 11, Week 5)
                </Typography>
            </Paper>
        );
    }

    // FIXED: Better tooltip that finds the actually hovered line
    const AllTeamsTooltip = ({ active, payload }) => {
        if (!active || !payload || payload.length === 0) return null;

        // Filter to only lines with actual values (non-null)
        const validPayloads = payload.filter(
            p => p.value != null && p.value !== undefined && p.dataKey && p.dataKey.includes('_elo')
        );

        if (validPayloads.length === 0) return null;

        // FIXED: Find the hovered team by looking for activeDot property
        // Recharts sets activeDot: true on the actually hovered line
        let hoveredPayload = validPayloads.find(p => p.dataKey && p.name) || validPayloads[0];
        
        // If we can't determine from activeDot, just use the first valid one
        // (In showAllTeams mode with shared=false, there should only be one anyway)
        const teamName = hoveredPayload.dataKey.replace('_elo', '');
        const teamInfo = teamMap[teamName];
        
        const dataPoint = hoveredPayload.payload;
        const season = dataPoint?.season || 'N/A';
        const week = dataPoint?.week || 'N/A';

        return (
            <Paper sx={{ p: 2, border: '1px solid #ccc', maxWidth: 250 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Season {season}, Week {week}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                        sx={{
                            width: 12,
                            height: 12,
                            backgroundColor: teamInfo?.primaryColor || hoveredPayload.stroke || '#1976d2',
                            borderRadius: '50%',
                            flexShrink: 0,
                        }}
                    />
                    <Typography variant="body2" fontWeight="bold">
                        {teamInfo?.name || teamName}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ ml: 'auto' }}>
                        {hoveredPayload.value.toFixed(1)}
                    </Typography>
                </Box>
            </Paper>
        );
    };

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

    const uniqueTeams = useMemo(() => {
        if (!showAllTeams) return [];
        const teamSet = new Set();
        filteredData.forEach(entry => {
            const teamName = entry.team || entry.team_name;
            if (teamName) teamSet.add(teamName);
        });
        return Array.from(teamSet).sort();
    }, [filteredData, showAllTeams]);

    const formatXAxisLabel = (value) => {
        const dataPoint = chartData.find(d => d.gameIndex === value);
        if (dataPoint) {
            const week = dataPoint.week;
            if (week) {
                return `W${week}`;
            }
        }
        return `${value}`;
    };
    
    const seasonBoundaries = useMemo(() => {
        if (!chartData || chartData.length === 0) return [];
        const boundaries = [];
        let lastSeason = null;
        chartData.forEach((point) => {
            const currentSeason = point.season;
            
            if (lastSeason !== null && currentSeason !== lastSeason) {
                boundaries.push({
                    gameIndex: point.gameIndex,
                    season: lastSeason,
                });
            }
            lastSeason = currentSeason;
        });
        return boundaries;
    }, [chartData]);

    const handleZoomIn = () => {
        if (!chartData || chartData.length === 0) return;
        const currentDomain = zoomDomain || [chartData[0].gameIndex, chartData[chartData.length - 1].gameIndex];
        const range = currentDomain[1] - currentDomain[0];
        const newRange = range * 0.7;
        const center = (currentDomain[0] + currentDomain[1]) / 2;
        setZoomDomain([center - newRange / 2, center + newRange / 2]);
    };

    const handleZoomOut = () => {
        if (!chartData || chartData.length === 0) return;
        const currentDomain = zoomDomain || [chartData[0].gameIndex, chartData[chartData.length - 1].gameIndex];
        const range = currentDomain[1] - currentDomain[0];
        const newRange = range * 1.4;
        const center = (currentDomain[0] + currentDomain[1]) / 2;
        const newDomain = [center - newRange / 2, center + newRange / 2];
        
        if (newDomain[0] <= chartData[0].gameIndex && newDomain[1] >= chartData[chartData.length - 1].gameIndex) {
            setZoomDomain(null);
        } else {
            setZoomDomain(newDomain);
        }
    };

    const handleResetZoom = () => {
        setZoomDomain(null);
    };

    const handleMouseDown = (e) => {
        if (zoomDomain && e.button === 0) {
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
            const panX = -(deltaX / 500) * range;
            
            const newDomain = [currentDomain[0] + panX, currentDomain[1] + panX];
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

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    // On mobile, fit to viewport width and use a height that fits on screen
    const chartWidth = isMobile ? '100%' : '100%';
    const chartHeight = isMobile ? 400 : (showAllTeams ? 600 : 500);

    return (
        <Box sx={{ width: '100%', mt: 2 }}>
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
                    width: chartWidth,
                    height: chartHeight,
                    minHeight: 400,
                    cursor: zoomDomain ? (isDragging ? 'grabbing' : 'grab') : 'default',
                    userSelect: 'none'
                }}
            >
                    <ResponsiveContainer width="100%" height="100%" minHeight={400}>
                    <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="gameIndex"
                            label={{ value: 'Week', position: 'insideBottom', offset: -5 }}
                            tickFormatter={formatXAxisLabel}
                            domain={zoomDomain ? zoomDomain : ['auto', 'auto']}
                            allowDataOverflow={true}
                        />
                        
                        {seasonBoundaries.map((boundary, idx) => (
                            <ReferenceLine
                                key={`boundary-${idx}`}
                                x={boundary.gameIndex}
                                stroke="#000000"
                                strokeWidth={2}
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
                        ))}
                        
                        <YAxis
                            label={{ value: 'ELO Rating', angle: -90, position: 'insideLeft' }}
                            domain={['dataMin - 50', 'dataMax + 50']}
                        />
                        
                        <Tooltip 
                            content={showAllTeams ? <AllTeamsTooltip /> : <SingleTeamTooltip />} 
                            shared={false}
                            isAnimationActive={false}
                        />
                        
                        {showAllTeams ? (
                            uniqueTeams.map((teamName, index) => {
                                const teamInfo = teamMap[teamName];
                                let color = teamInfo?.primaryColor;
                                if (!color || !color.startsWith('#')) {
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
                                        name={teamName}
                                        connectNulls={false}
                                        isAnimationActive={false}
                                    />
                                );
                            })
                        ) : (
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
                        
                        {showAllTeams && chartData.length > 20 && (
                            <Brush
                                dataKey="gameIndex"
                                height={30}
                                stroke="#8884d8"
                                tickFormatter={formatXAxisLabel}
                                startIndex={Math.max(0, chartData.length - 20)}
                                endIndex={chartData.length - 1}
                                onChange={(domain) => {
                                    if (domain && domain.startIndex !== undefined && domain.endIndex !== undefined) {
                                        const startGameIndex = chartData[domain.startIndex]?.gameIndex;
                                        const endGameIndex = chartData[domain.endIndex]?.gameIndex;
                                        if (startGameIndex !== undefined && endGameIndex !== undefined) {
                                            setZoomDomain([startGameIndex, endGameIndex]);
                                        } else if (domain.startIndex === 0 && domain.endIndex === chartData.length - 1) {
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