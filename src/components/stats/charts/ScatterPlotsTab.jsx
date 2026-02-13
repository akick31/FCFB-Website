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
 * 
 * NOTE: Success rate is calculated as (successes / attempts)
 * Example: 5 successful conversions out of 10 attempts = 5/10 = 0.50 = 50% success rate
 */
const ScatterPlotsTab = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [gameStatsData, setGameStatsData] = useState([]);
    const [seasonStatsData, setSeasonStatsData] = useState([]);
    
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [selectedWeek, setSelectedWeek] = useState(null);
    const [viewMode, setViewMode] = useState('season');
    const [activeChart, setActiveChart] = useState(0);
    
    const [teams, setTeams] = useState([]);
    const [seasons, setSeasons] = useState([]);

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

    const fetchStats = async () => {
        if (!selectedSeason) {
            setError('Please select a season');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            if (viewMode === 'season') {
                const response = await getFilteredSeasonStats(null, null, selectedSeason, null, 0, 1000);
                setSeasonStatsData(response.content || []);
                setGameStatsData([]);
            } else {
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

    useEffect(() => {
        if (selectedSeason && (viewMode === 'season' || selectedWeek)) {
            fetchStats();
        }
    }, [selectedSeason, selectedWeek, viewMode]);

    const scatterPlotData = useMemo(() => {
        if (viewMode === 'season') {
            if (!seasonStatsData || seasonStatsData.length === 0) return [];
            
            return seasonStatsData
                .filter(stat => {
                    const avgOffDiff = stat.average_offensive_diff ?? stat.averageOffensiveDiff;
                    const avgDefDiff = stat.average_defensive_diff ?? stat.averageDefensiveDiff;
                    return avgOffDiff != null && avgDefDiff != null;
                })
                .map(stat => {
                    const avgOffDiff = stat.average_offensive_diff ?? stat.averageOffensiveDiff;
                    const avgDefDiff = stat.average_defensive_diff ?? stat.averageDefensiveDiff;
                    
                    // Success Rate Formula: successes / attempts
                    // Example: 7 conversions out of 10 attempts = 7/10 = 0.70 = 70%
                    const thirdDownSuccess = stat.third_down_conversion_success ?? stat.thirdDownConversionSuccess ?? 0;
                    const thirdDownAttempts = stat.third_down_conversion_attempts ?? stat.thirdDownConversionAttempts ?? 0;
                    const fourthDownSuccess = stat.fourth_down_conversion_success ?? stat.fourthDownConversionSuccess ?? 0;
                    const fourthDownAttempts = stat.fourth_down_conversion_attempts ?? stat.fourthDownConversionAttempts ?? 0;
                    const totalSuccess = thirdDownSuccess + fourthDownSuccess;
                    const totalAttempts = thirdDownAttempts + fourthDownAttempts;
                    const offenseThirdFourthDown = totalAttempts > 0 ? totalSuccess / totalAttempts : null;
                    
                    // Defensive 3rd/4th down from opponent stats
                    const oppThirdDownSuccess = stat.opponent_third_down_conversion_success ?? stat.opponentThirdDownConversionSuccess ?? 0;
                    const oppThirdDownAttempts = stat.opponent_third_down_conversion_attempts ?? stat.opponentThirdDownConversionAttempts ?? 0;
                    const oppFourthDownSuccess = stat.opponent_fourth_down_conversion_success ?? stat.opponentFourthDownConversionSuccess ?? 0;
                    const oppFourthDownAttempts = stat.opponent_fourth_down_conversion_attempts ?? stat.opponentFourthDownConversionAttempts ?? 0;
                    const oppTotalSuccess = oppThirdDownSuccess + oppFourthDownSuccess;
                    const oppTotalAttempts = oppThirdDownAttempts + oppFourthDownAttempts;
                    const defenseThirdFourthDown = oppTotalAttempts > 0 ? oppTotalSuccess / oppTotalAttempts : null;
                    
                    // Overall success rate (pass + rush)
                    const passAttempts = stat.pass_attempts ?? stat.passAttempts ?? 0;
                    const rushAttempts = stat.rush_attempts ?? stat.rushAttempts ?? 0;
                    const totalPlayAttempts = passAttempts + rushAttempts;
                    const passSuccesses = stat.pass_successes ?? stat.passSuccesses ?? 0;
                    const rushSuccesses = stat.rush_successes ?? stat.rushSuccesses ?? 0;
                    const offenseSuccessRate = totalPlayAttempts > 0
                        ? (passSuccesses + rushSuccesses) / totalPlayAttempts
                        : null;
                    
                    // Defensive success rate from opponent stats
                    const oppPassAttempts = stat.opponent_pass_attempts ?? stat.opponentPassAttempts ?? 0;
                    const oppRushAttempts = stat.opponent_rush_attempts ?? stat.opponentRushAttempts ?? 0;
                    const oppTotalPlayAttempts = oppPassAttempts + oppRushAttempts;
                    const oppPassSuccesses = stat.opponent_pass_successes ?? stat.opponentPassSuccesses ?? 0;
                    const oppRushSuccesses = stat.opponent_rush_successes ?? stat.opponentRushSuccesses ?? 0;
                    const defenseSuccessRate = oppTotalPlayAttempts > 0
                        ? (oppPassSuccesses + oppRushSuccesses) / oppTotalPlayAttempts
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
            // Week-by-week view - not implemented yet
            return [];
        }
    }, [gameStatsData, seasonStatsData, viewMode]);

    const chartConfigs = [
        {
            title: 'Average Difference',
            xAxisLabel: 'Offense',
            yAxisLabel: 'Defense',
            xDataKey: 'offense',
            yDataKey: 'defense',
            reversedX: true,
            reversedY: false,
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

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={60} />
                </Box>
            )}

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

            {!loading && !error && selectedSeason && scatterPlotData.length > 0 && (
                <Paper sx={{ p: 3 }}>
                    <ScatterPlotChart
                        key={`${activeChart}-${selectedSeason}-${selectedWeek}-${viewMode}`}
                        data={scatterPlotData.filter(d => {
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

            {!loading && !error && selectedSeason && scatterPlotData.length === 0 && (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        No data available for Season {selectedSeason}
                        {viewMode === 'week' && selectedWeek && `, Week ${selectedWeek}`}
                    </Typography>
                </Paper>
            )}

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