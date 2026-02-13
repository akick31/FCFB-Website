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
import { Box, Typography, Paper, Avatar, IconButton, Tooltip as MuiTooltip, useTheme, useMediaQuery } from '@mui/material';
import { ZoomIn, ZoomOut, FitScreen } from '@mui/icons-material';

const RankingsHistoryChart = ({ data, teams = [], showAllTeams = false }) => {
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
                    logo: team.logo || null,
                };
            }
        });
        return map;
    }, [teams]);

    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

        if (showAllTeams) {
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
            
            const sortedTimeline = Array.from(timelineMap.values())
                .sort((a, b) => {
                    if (a.season !== b.season) return a.season - b.season;
                    return a.week - b.week;
                });
            
            sortedTimeline.forEach((entry, index) => {
                entry.gameIndex = index + 1;
            });
            
            const teamGameMap = new Map();
            data.forEach(game => {
                const season = game.season || game.season_number || 0;
                const week = game.week || game.week_number || 0;
                const key = `${season}_${week}`;
                const timelineEntry = timelineMap.get(key);
                
                if (!timelineEntry) return;
                
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
            
            const chartPoints = sortedTimeline.map((timelineEntry) => {
                const point = {
                    gameIndex: timelineEntry.gameIndex,
                    season: timelineEntry.season,
                    week: timelineEntry.week,
                };
                
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
            const teamRankings = [];
            data.forEach(game => {
                const season = game.season || game.season_number || 0;
                const week = game.week || game.week_number || 0;
                
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

    // FIXED: Better tooltip that finds the actually hovered line
    const AllTeamsTooltip = ({ active, payload }) => {
        if (!active || !payload || payload.length === 0) return null;

        const validPayloads = payload.filter(
            p => p.value != null && p.value !== undefined && p.dataKey && p.dataKey.includes('_rank')
        );

        if (validPayloads.length === 0) return null;

        // FIXED: Find the hovered team
        let hoveredPayload = validPayloads.find(p => p.dataKey && p.name) || validPayloads[0];
        
        const teamName = hoveredPayload.dataKey.replace('_rank', '');
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
                            backgroundColor: teamInfo?.primaryColor || hoveredPayload.stroke || '#1976d2',
                            borderRadius: '50%',
                            flexShrink: 0,
                        }}
                    />
                    <Typography variant="body2" fontWeight="bold">
                        {teamInfo?.name || teamName}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ ml: 'auto' }}>
                        #{hoveredPayload.value}
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

    const yAxisDomain = [1, 25];

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
                            domain={zoomDomain ? zoomDomain : ['auto', 'auto']}
                            allowDataOverflow={true}
                            tickFormatter={(value) => {
                                const dataPoint = chartData.find(d => d.gameIndex === value);
                                if (dataPoint && dataPoint.week) {
                                    return `W${dataPoint.week}`;
                                }
                                return `${value}`;
                            }}
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
                            label={{ value: 'Rank', angle: -90, position: 'insideLeft', offset: 10 }}
                            domain={yAxisDomain}
                            reversed={true}
                            allowDataOverflow={false}
                        />
                        
                        <Tooltip 
                            content={showAllTeams ? <AllTeamsTooltip /> : <SingleTeamTooltip />} 
                            shared={false}
                            isAnimationActive={false}
                        />
                        
                        {showAllTeams ? (
                            uniqueTeams.map((teamName) => {
                                const teamInfo = teamMap[teamName];
                                let color = teamInfo?.primaryColor || '#1976d2';
                                if (!color || !color.startsWith('#')) {
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
                                        name={teamName}
                                        connectNulls={false}
                                        isAnimationActive={false}
                                    />
                                );
                            })
                        ) : (
                            <Line
                                type="linear"
                                dataKey="rank"
                                stroke="#1976d2"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        )}
                        
                        {showAllTeams && chartData.length > 20 && (
                            <Brush
                                dataKey="gameIndex"
                                height={30}
                                stroke="#8884d8"
                                tickFormatter={(value) => {
                                    const dataPoint = chartData.find(d => d.gameIndex === value);
                                    if (dataPoint && dataPoint.week) {
                                        return `W${dataPoint.week}`;
                                    }
                                    return `${value}`;
                                }}
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

export default RankingsHistoryChart;