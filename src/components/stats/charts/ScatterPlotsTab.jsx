import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tabs,
    Tab,
    Grid,
} from '@mui/material';
import { getGameStatsBySeasonAndWeek } from '../../../api/gameStatsApi';
import { getFilteredSeasonStats } from '../../../api/seasonStatsApi';
import { getAllTeams } from '../../../api/teamApi';
import { getAllSeasons } from '../../../api/seasonApi';
import { getCurrentSeason } from '../../../api/seasonApi';
import ScatterPlotChart from '../ScatterPlotChart';

/**
 * Scatter Plots Tab Component
 * Displays performance scatter plots for teams
 */
const ScatterPlotsTab = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [gameStatsData, setGameStatsData] = useState([]);
    const [seasonStatsData, setSeasonStatsData] = useState([]);
    
    // Filter states
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [selectedWeek, setSelectedWeek] = useState(null);
    const [viewMode, setViewMode] = useState('season'); // 'season' or 'week'
    const [activeChart, setActiveChart] = useState(0); // 0: avg diff, 1: 3rd/4th down, 2: success rate
    
    // Data states
    const [teams, setTeams] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [weeks, setWeeks] = useState([]);

    // Initialize data
    useEffect(() => {
        const initData = async () => {
            try {
                setLoading(true);
                const [teamsData, seasonsData, currentSeasonData] = await Promise.all([
                    getAllTeams(),
                    getAllSeasons(),
                    getCurrentSeason(),
                ]);
                
                setTeams(teamsData.filter(t => t.active).sort((a, b) => (a.name || '').localeCompare(b.name || '')));
                const seasonNumbers = seasonsData.map(s => s.season_number || s.seasonNumber).sort((a, b) => b - a);
                setSeasons(seasonNumbers);
                
                if (currentSeasonData && seasonNumbers.includes(currentSeasonData)) {
                    setSelectedSeason(currentSeasonData);
                }
            } catch (err) {
                console.error('Error initializing scatter plots:', err);
                setError('Failed to load initial data');
            } finally {
                setLoading(false);
            }
        };
        
        initData();
    }, []);

    // Fetch stats data
    const fetchStats = async () => {
        if (!selectedSeason) {
            setError('Please select a season');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            if (viewMode === 'season') {
                // Use season_stats for overall season view
                const response = await getFilteredSeasonStats(null, null, selectedSeason, null, 0, 1000);
                setSeasonStatsData(response.content || []);
                setGameStatsData([]);
            } else {
                // Use game_stats for week-by-week view
                const week = selectedWeek;
                if (!week) {
                    setError('Please select a week');
                    setGameStatsData([]);
                    setSeasonStatsData([]);
                    return;
                }
                const data = await getGameStatsBySeasonAndWeek(selectedSeason, week);
                setGameStatsData(data);
                setSeasonStatsData([]);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
            setError(err.message || 'Failed to fetch stats');
            setGameStatsData([]);
            setSeasonStatsData([]);
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch when season/week changes
    useEffect(() => {
        if (selectedSeason && (viewMode === 'season' || selectedWeek)) {
            fetchStats();
        }
    }, [selectedSeason, selectedWeek, viewMode]);

    // Calculate scatter plot data
    const scatterPlotData = useMemo(() => {
        if (viewMode === 'season') {
            // Use season_stats data
            if (!seasonStatsData || seasonStatsData.length === 0) return [];
            
            return seasonStatsData
                .filter(stat => {
                    // Handle both snake_case and camelCase field names
                    const avgOffDiff = stat.average_offensive_diff ?? stat.averageOffensiveDiff;
                    const avgDefDiff = stat.average_defensive_diff ?? stat.averageDefensiveDiff;
                    return avgOffDiff != null && avgDefDiff != null;
                })
                .map(stat => {
                    // Handle both snake_case and camelCase field names
                    const avgOffDiff = stat.average_offensive_diff ?? stat.averageOffensiveDiff;
                    const avgDefDiff = stat.average_defensive_diff ?? stat.averageDefensiveDiff;
                    
                    // Calculate 3rd/4th down success rate (combined) - convert from percentage to decimal
                    const thirdDownPct = (stat.third_down_conversion_percentage ?? stat.thirdDownConversionPercentage ?? 0) / 100;
                    const fourthDownPct = (stat.fourth_down_conversion_percentage ?? stat.fourthDownConversionPercentage ?? 0) / 100;
                    const offenseThirdFourthDown = (thirdDownPct + fourthDownPct) / 2;
                    
                    // Defensive 3rd/4th down from opponent stats - convert from percentage to decimal
                    const oppThirdDownPct = (stat.opponent_third_down_conversion_percentage ?? stat.opponentThirdDownConversionPercentage ?? 0) / 100;
                    const oppFourthDownPct = (stat.opponent_fourth_down_conversion_percentage ?? stat.opponentFourthDownConversionPercentage ?? 0) / 100;
                    const defenseThirdFourthDown = (oppThirdDownPct + oppFourthDownPct) / 2;
                    
                    // Success rate (pass + rush combined) - as decimal, not percentage
                    const passAttempts = stat.pass_attempts ?? stat.passAttempts ?? 0;
                    const rushAttempts = stat.rush_attempts ?? stat.rushAttempts ?? 0;
                    const totalAttempts = passAttempts + rushAttempts;
                    const passSuccesses = stat.pass_successes ?? stat.passSuccesses ?? 0;
                    const rushSuccesses = stat.rush_successes ?? stat.rushSuccesses ?? 0;
                    const offenseSuccessRate = totalAttempts > 0
                        ? (passSuccesses + rushSuccesses) / totalAttempts
                        : null;
                    
                    // Defensive success rate from opponent stats - as decimal
                    const oppPassAttempts = stat.opponent_pass_attempts ?? stat.opponentPassAttempts ?? 0;
                    const oppRushAttempts = stat.opponent_rush_attempts ?? stat.opponentRushAttempts ?? 0;
                    const oppTotalAttempts = oppPassAttempts + oppRushAttempts;
                    const oppPassSuccesses = stat.opponent_pass_successes ?? stat.opponentPassSuccesses ?? 0;
                    const oppRushSuccesses = stat.opponent_rush_successes ?? stat.opponentRushSuccesses ?? 0;
                    const defenseSuccessRate = oppTotalAttempts > 0
                        ? (oppPassSuccesses + oppRushSuccesses) / oppTotalAttempts
                        : null;
                    
                    return {
                        team: stat.team,
                        offense: avgOffDiff,
                        defense: avgDefDiff,
                        thirdFourthDown: offenseThirdFourthDown,
                        defenseThirdFourthDown: defenseThirdFourthDown,
                        successRate: offenseSuccessRate,
                        defenseSuccessRate: defenseSuccessRate,
                    };
                });
        } else {
            // Use game_stats data for week-by-week
            if (!gameStatsData || gameStatsData.length === 0) return [];
            
            // Create a map of game_id -> [team1Stats, team2Stats]
            const gameStatsMap = new Map();
            gameStatsData.forEach(stat => {
                const gameId = stat.game_id || stat.gameId;
                if (!gameStatsMap.has(gameId)) {
                    gameStatsMap.set(gameId, []);
                }
                gameStatsMap.get(gameId).push(stat);
            });
            
            // Group stats by team and calculate defensive stats from opponents
            const teamStatsMap = new Map();
            
            // Helper function to process team stats (moved outside to fix ESLint)
            const processTeamStats = (teamStat, opponentStat, map) => {
                const teamName = teamStat.team;
                if (!map.has(teamName)) {
                    map.set(teamName, {
                        team: teamName,
                        offenseAvgDiff: [],
                        defenseAvgDiff: [],
                        offenseThirdFourthDown: [],
                        defenseThirdFourthDown: [],
                        offenseSuccessRate: [],
                        defenseSuccessRate: [],
                    });
                }
                
                const teamData = map.get(teamName);
                
                // Average diff - handle both snake_case and camelCase
                const avgOffDiff = teamStat.average_offensive_diff ?? teamStat.averageOffensiveDiff;
                const avgDefDiff = teamStat.average_defensive_diff ?? teamStat.averageDefensiveDiff;
                if (avgOffDiff != null) {
                    teamData.offenseAvgDiff.push(avgOffDiff);
                }
                if (avgDefDiff != null) {
                    teamData.defenseAvgDiff.push(avgDefDiff);
                }
                
                // 3rd/4th down success (offensive from team, defensive from opponent) - convert from percentage to decimal
                const thirdDownPct = (teamStat.third_down_conversion_percentage ?? teamStat.thirdDownConversionPercentage ?? 0) / 100;
                const fourthDownPct = (teamStat.fourth_down_conversion_percentage ?? teamStat.fourthDownConversionPercentage ?? 0) / 100;
                const combinedThirdFourth = (thirdDownPct + fourthDownPct) / 2;
                teamData.offenseThirdFourthDown.push(combinedThirdFourth);
                
                // Defensive 3rd/4th down from opponent - convert from percentage to decimal
                const oppThirdDownPct = (opponentStat.third_down_conversion_percentage ?? opponentStat.thirdDownConversionPercentage ?? 0) / 100;
                const oppFourthDownPct = (opponentStat.fourth_down_conversion_percentage ?? opponentStat.fourthDownConversionPercentage ?? 0) / 100;
                const oppCombinedThirdFourth = (oppThirdDownPct + oppFourthDownPct) / 2;
                teamData.defenseThirdFourthDown.push(oppCombinedThirdFourth);
                
                // Success rate (offensive from team, defensive from opponent) - as decimal
                const passAttempts = teamStat.pass_attempts ?? teamStat.passAttempts ?? 0;
                const rushAttempts = teamStat.rush_attempts ?? teamStat.rushAttempts ?? 0;
                const totalAttempts = passAttempts + rushAttempts;
                if (totalAttempts > 0) {
                    const passSuccesses = teamStat.pass_successes ?? teamStat.passSuccesses ?? 0;
                    const rushSuccesses = teamStat.rush_successes ?? teamStat.rushSuccesses ?? 0;
                    const successRate = (passSuccesses + rushSuccesses) / totalAttempts;
                    teamData.offenseSuccessRate.push(successRate);
                }
                
                // Defensive success rate from opponent - as decimal
                const oppPassAttempts = opponentStat.pass_attempts ?? opponentStat.passAttempts ?? 0;
                const oppRushAttempts = opponentStat.rush_attempts ?? opponentStat.rushAttempts ?? 0;
                const oppTotalAttempts = oppPassAttempts + oppRushAttempts;
                if (oppTotalAttempts > 0) {
                    const oppPassSuccesses = opponentStat.pass_successes ?? opponentStat.passSuccesses ?? 0;
                    const oppRushSuccesses = opponentStat.rush_successes ?? opponentStat.rushSuccesses ?? 0;
                    const oppSuccessRate = (oppPassSuccesses + oppRushSuccesses) / oppTotalAttempts;
                    teamData.defenseSuccessRate.push(oppSuccessRate);
                }
            }
            
            // Calculate averages and create scatter plot points
            const scatterData = [];
            
            teamStatsMap.forEach((teamData, teamName) => {
                // Average Diff
                const avgOffenseDiff = teamData.offenseAvgDiff.length > 0
                    ? teamData.offenseAvgDiff.reduce((a, b) => a + b, 0) / teamData.offenseAvgDiff.length
                    : null;
                const avgDefenseDiff = teamData.defenseAvgDiff.length > 0
                    ? teamData.defenseAvgDiff.reduce((a, b) => a + b, 0) / teamData.defenseAvgDiff.length
                    : null;
                
                // 3rd/4th Down Success
                const avgThirdFourthDown = teamData.offenseThirdFourthDown.length > 0
                    ? teamData.offenseThirdFourthDown.reduce((a, b) => a + b, 0) / teamData.offenseThirdFourthDown.length
                    : null;
                const avgDefenseThirdFourthDown = teamData.defenseThirdFourthDown.length > 0
                    ? teamData.defenseThirdFourthDown.reduce((a, b) => a + b, 0) / teamData.defenseThirdFourthDown.length
                    : null;
                
                // Success Rate
                const avgSuccessRate = teamData.offenseSuccessRate.length > 0
                    ? teamData.offenseSuccessRate.reduce((a, b) => a + b, 0) / teamData.offenseSuccessRate.length
                    : null;
                const avgDefenseSuccessRate = teamData.defenseSuccessRate.length > 0
                    ? teamData.defenseSuccessRate.reduce((a, b) => a + b, 0) / teamData.defenseSuccessRate.length
                    : null;
                
                if (avgOffenseDiff != null && avgDefenseDiff != null) {
                    scatterData.push({
                        team: teamName,
                        offense: avgOffenseDiff,
                        defense: avgDefenseDiff,
                        thirdFourthDown: avgThirdFourthDown,
                        defenseThirdFourthDown: avgDefenseThirdFourthDown,
                        successRate: avgSuccessRate,
                        defenseSuccessRate: avgDefenseSuccessRate,
                    });
                }
            });
            
            return scatterData;
        }
    }, [gameStatsData, seasonStatsData, viewMode]);

    // Chart configurations
    const chartConfigs = [
        {
            title: 'Average Difference',
            xAxisLabel: 'Offense',
            yAxisLabel: 'Defense',
            xDataKey: 'offense',
            yDataKey: 'defense',
            reversedX: true, // Higher on left (offense decreases left to right)
            reversedY: false, // Higher on top (defense increases bottom to top)
        },
        {
            title: '3rd/4th Down Success Rates',
            xAxisLabel: 'Offense',
            yAxisLabel: 'Defense',
            xDataKey: 'thirdFourthDown',
            yDataKey: 'defenseThirdFourthDown',
        },
        {
            title: 'Success Rates',
            xAxisLabel: 'Offense',
            yAxisLabel: 'Defense',
            xDataKey: 'successRate',
            yDataKey: 'defenseSuccessRate',
        },
    ];

    return (
        <Box>
            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Season</InputLabel>
                            <Select
                                value={selectedSeason || ''}
                                label="Season"
                                onChange={(e) => {
                                    setSelectedSeason(e.target.value);
                                    setSelectedWeek(null);
                                }}
                                disabled={loading}
                            >
                                {seasons.map((season) => (
                                    <MenuItem key={season} value={season}>
                                        Season {season}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>View Mode</InputLabel>
                            <Select
                                value={viewMode}
                                label="View Mode"
                                onChange={(e) => {
                                    setViewMode(e.target.value);
                                    if (e.target.value === 'season') {
                                        setSelectedWeek(null);
                                    }
                                }}
                                disabled={loading || !selectedSeason}
                            >
                                <MenuItem value="season">Overall Season</MenuItem>
                                <MenuItem value="week">By Week</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    {viewMode === 'week' && (
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Week</InputLabel>
                                <Select
                                    value={selectedWeek || ''}
                                    label="Week"
                                    onChange={(e) => setSelectedWeek(e.target.value)}
                                    disabled={loading || !selectedSeason}
                                >
                                    {Array.from({ length: 16 }, (_, i) => i + 1).map((week) => (
                                        <MenuItem key={week} value={week}>
                                            Week {week}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    )}
                </Grid>
            </Paper>

            {/* Error Display */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Loading State */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={60} />
                </Box>
            )}

            {/* Chart Tabs */}
            {!loading && selectedSeason && (
                <Paper sx={{ mb: 3 }}>
                    <Tabs
                        value={activeChart}
                        onChange={(e, newValue) => setActiveChart(newValue)}
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        <Tab label="Average Difference" />
                        <Tab label="3rd/4th Down Success" />
                        <Tab label="Success Rate" />
                    </Tabs>
                </Paper>
            )}

            {/* Charts */}
            {!loading && !error && selectedSeason && scatterPlotData.length > 0 && (
                <Paper sx={{ p: 3 }}>
                    <ScatterPlotChart
                        key={`${activeChart}-${selectedSeason}-${selectedWeek}-${viewMode}`}
                        data={scatterPlotData.filter(d => {
                            // Filter out data points missing required values for the active chart
                            const config = chartConfigs[activeChart];
                            return d[config.xDataKey] != null && d[config.yDataKey] != null;
                        })}
                        teams={teams}
                        title={`Season ${selectedSeason}${viewMode === 'week' && selectedWeek ? ` - Week ${selectedWeek}` : ''} ${chartConfigs[activeChart].title}`}
                        xAxisLabel={chartConfigs[activeChart].xAxisLabel}
                        yAxisLabel={chartConfigs[activeChart].yAxisLabel}
                        xDataKey={chartConfigs[activeChart].xDataKey}
                        yDataKey={chartConfigs[activeChart].yDataKey}
                        reversedX={chartConfigs[activeChart].reversedX || false}
                        reversedY={chartConfigs[activeChart].reversedY || false}
                        resetZoomKey={`${activeChart}-${selectedSeason}-${selectedWeek}-${viewMode}`}
                    />
                </Paper>
            )}

            {/* No Data State */}
            {!loading && !error && selectedSeason && scatterPlotData.length === 0 && (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        No data available for Season {selectedSeason}
                        {viewMode === 'week' && selectedWeek && `, Week ${selectedWeek}`}
                    </Typography>
                </Paper>
            )}

            {/* Initial State */}
            {!loading && !error && !selectedSeason && (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        Please select a season to view performance charts
                    </Typography>
                </Paper>
            )}
        </Box>
    );
};

export default ScatterPlotsTab;
