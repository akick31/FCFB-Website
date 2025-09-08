import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete,
    TextField,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';
import { getFilteredSeasonStats } from '../../api/seasonStatsApi';
import { getAllTeams } from '../../api/teamApi';
import { getCurrentSeason } from '../../api/seasonApi';

const SeasonStats = ({ user }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Data states
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [teamSeasonStats, setTeamSeasonStats] = useState(null);

    // Available seasons
    const seasons = [11, 10];

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [teamsData, currentSeason] = await Promise.all([
                    getAllTeams(),
                    getCurrentSeason()
                ]);
                setTeams(teamsData);
                
                // Set default season to 11 (most recent season)
                setSelectedSeason(11);
                
                // Set default team: user's team if they're a coach, otherwise first team alphabetically
                let defaultTeam = null;
                if (user?.team) {
                    // User is a coach, find their team
                    defaultTeam = teamsData.find(team => team.name === user.team);
                }
                if (!defaultTeam && teamsData.length > 0) {
                    // Fallback to first team alphabetically
                    defaultTeam = teamsData.sort((a, b) => a.name.localeCompare(b.name))[0];
                }
                setSelectedTeam(defaultTeam);
                
                
                // If we have a default team, fetch their stats
                if (defaultTeam) {
                    await fetchTeamStats(defaultTeam, 11);
                }
            } catch (err) {
                setError('Failed to load initial data');
                console.error('Error fetching initial data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const fetchTeamStats = async (team, season) => {
        if (!team) return;
        
        try {
            setLoading(true);
            setError(null);
            
            const seasonStatsResponse = await getFilteredSeasonStats(team.name, null, season, null, 0, 1); // Get season stats for specific team and season
            
            // Extract the season stats from the paginated response
            const seasonStats = seasonStatsResponse.content && seasonStatsResponse.content.length > 0 
                ? seasonStatsResponse.content[0] 
                : null;
            
            setTeamSeasonStats(seasonStats);
        } catch (err) {
            setError('Failed to fetch team stats');
            console.error('Error fetching team stats:', err);
        } finally {
            setLoading(false);
        }
    };


    const handleTeamChange = (event, newValue) => {
        setSelectedTeam(newValue);
        if (newValue) {
            fetchTeamStats(newValue, selectedSeason);
        } else {
            setTeamSeasonStats(null);
        }
    };

    const handleSeasonChange = (event) => {
        const newSeason = event.target.value;
        setSelectedSeason(newSeason);
        
        
        // If a team is selected, fetch their stats for the new season
        if (selectedTeam) {
            fetchTeamStats(selectedTeam, newSeason);
        }
    };

    const formatStatValue = (value) => {
        if (value === null || value === undefined) return 'N/A';
        if (typeof value === 'number') {
            return value.toLocaleString();
        }
        return value.toString();
    };


    const renderTeamSeasonStats = () => {
        if (!teamSeasonStats) return null;

        // Organize stats into logical categories
        const recordStats = [
            { label: 'Wins', value: teamSeasonStats.wins },
            { label: 'Losses', value: teamSeasonStats.losses },
            { label: 'Win %', value: teamSeasonStats.wins + teamSeasonStats.losses > 0 ? 
                ((teamSeasonStats.wins / (teamSeasonStats.wins + teamSeasonStats.losses)) * 100).toFixed(1) + '%' : '0%' }
        ];

        const offensiveStats = [
            { label: 'Total Yards', value: teamSeasonStats.total_yards },
            { label: 'Passing Yards', value: teamSeasonStats.pass_yards },
            { label: 'Rushing Yards', value: teamSeasonStats.rush_yards },
            { label: 'Total Touchdowns', value: teamSeasonStats.touchdowns },
            { label: 'Passing TDs', value: teamSeasonStats.pass_touchdowns },
            { label: 'Rushing TDs', value: teamSeasonStats.rush_touchdowns },
            { label: 'Pass Attempts', value: teamSeasonStats.pass_attempts },
            { label: 'Pass Completions', value: teamSeasonStats.pass_completions },
            { label: 'Rush Attempts', value: teamSeasonStats.rush_attempts },
            { label: 'Rush Successes', value: teamSeasonStats.rush_successes },
            { label: 'First Downs', value: teamSeasonStats.first_downs },
            { label: 'Longest Pass', value: teamSeasonStats.longest_pass },
            { label: 'Longest Run', value: teamSeasonStats.longest_run }
        ];

        const turnoverStats = [
            { label: 'Interceptions Lost', value: teamSeasonStats.interceptions_lost },
            { label: 'Interceptions Forced', value: teamSeasonStats.interceptions_forced },
            { label: 'Fumbles Lost', value: teamSeasonStats.fumbles_lost },
            { label: 'Fumbles Forced', value: teamSeasonStats.fumbles_forced },
            { label: 'Turnover Differential', value: teamSeasonStats.turnover_differential },
            { label: 'Turnovers Lost', value: teamSeasonStats.turnovers_lost },
            { label: 'Turnovers Forced', value: teamSeasonStats.turnovers_forced },
            { label: 'Pick Sixes Thrown', value: teamSeasonStats.pick_sixes_thrown },
            { label: 'Pick Sixes Forced', value: teamSeasonStats.pick_sixes_forced },
            { label: 'Fumble Return TDs Committed', value: teamSeasonStats.fumble_return_tds_committed },
            { label: 'Fumble Return TDs Forced', value: teamSeasonStats.fumble_return_tds_forced }
        ];

        const efficiencyStats = [
            { label: 'Pass Completion %', value: teamSeasonStats.pass_completion_percentage ? 
                teamSeasonStats.pass_completion_percentage.toFixed(1) + '%' : 'N/A' },
            { label: 'Rush Success %', value: teamSeasonStats.rush_success_percentage ? 
                teamSeasonStats.rush_success_percentage.toFixed(1) + '%' : 'N/A' },
            { label: '3rd Down %', value: teamSeasonStats.third_down_conversion_percentage ? 
                teamSeasonStats.third_down_conversion_percentage.toFixed(1) + '%' : 'N/A' },
            { label: '4th Down %', value: teamSeasonStats.fourth_down_conversion_percentage ? 
                teamSeasonStats.fourth_down_conversion_percentage.toFixed(1) + '%' : 'N/A' },
            { label: 'Red Zone %', value: teamSeasonStats.red_zone_success_percentage ? 
                teamSeasonStats.red_zone_success_percentage.toFixed(1) + '%' : 'N/A' },
            { label: 'Avg Yards/Play', value: teamSeasonStats.average_yards_per_play ? 
                teamSeasonStats.average_yards_per_play.toFixed(1) : 'N/A' },
            { label: 'Pass Success %', value: teamSeasonStats.pass_success_percentage ? 
                teamSeasonStats.pass_success_percentage.toFixed(1) + '%' : 'N/A' },
            { label: '3rd Down Success', value: teamSeasonStats.third_down_conversion_success },
            { label: '3rd Down Attempts', value: teamSeasonStats.third_down_conversion_attempts },
            { label: '4th Down Success', value: teamSeasonStats.fourth_down_conversion_success },
            { label: '4th Down Attempts', value: teamSeasonStats.fourth_down_conversion_attempts },
            { label: 'Red Zone Attempts', value: teamSeasonStats.red_zone_attempts },
            { label: 'Red Zone Successes', value: teamSeasonStats.red_zone_successes }
        ];

        const specialTeamsStats = [
            { label: 'Field Goals Made', value: teamSeasonStats.field_goal_made },
            { label: 'Field Goal Attempts', value: teamSeasonStats.field_goal_attempts },
            { label: 'Field Goal %', value: teamSeasonStats.field_goal_percentage ? 
                teamSeasonStats.field_goal_percentage.toFixed(1) + '%' : 'N/A' },
            { label: 'Longest Field Goal', value: teamSeasonStats.longest_field_goal },
            { label: 'Punts Attempted', value: teamSeasonStats.punts_attempted },
            { label: 'Longest Punt', value: teamSeasonStats.longest_punt },
            { label: 'Avg Punt Length', value: teamSeasonStats.average_punt_length ? 
                teamSeasonStats.average_punt_length.toFixed(1) : 'N/A' },
            { label: 'Kickoffs', value: teamSeasonStats.number_of_kickoffs },
            { label: 'Touchbacks', value: teamSeasonStats.touchbacks },
            { label: 'Touchback %', value: teamSeasonStats.touchback_percentage ? 
                teamSeasonStats.touchback_percentage.toFixed(1) + '%' : 'N/A' },
            { label: 'Kick Return TDs', value: teamSeasonStats.kick_return_td },
            { label: 'Punt Return TDs', value: teamSeasonStats.punt_return_td }
        ];

        const defenseStats = [
            { label: 'Sacks Allowed', value: teamSeasonStats.sacks_allowed },
            { label: 'Sacks Forced', value: teamSeasonStats.sacks_forced },
            { label: 'Blocked Field Goals', value: teamSeasonStats.blocked_opponent_field_goals },
            { label: 'Blocked Punts', value: teamSeasonStats.blocked_opponent_punt },
            { label: 'Safeties Forced', value: teamSeasonStats.safeties_forced },
            { label: 'Safeties Committed', value: teamSeasonStats.safeties_committed },
            { label: 'Largest Lead', value: teamSeasonStats.largest_lead },
            { label: 'Largest Deficit', value: teamSeasonStats.largest_deficit },
            { label: 'Time of Possession', value: teamSeasonStats.time_of_possession ? 
                Math.floor(teamSeasonStats.time_of_possession / 60) + ':' + 
                (teamSeasonStats.time_of_possession % 60).toString().padStart(2, '0') : 'N/A' },
            { label: 'Number of Drives', value: teamSeasonStats.number_of_drives }
        ];

        const opponentStats = [
            { label: 'Opponent Total Yards', value: teamSeasonStats.opponent_total_yards },
            { label: 'Opponent Pass Yards', value: teamSeasonStats.opponent_pass_yards },
            { label: 'Opponent Rush Yards', value: teamSeasonStats.opponent_rush_yards },
            { label: 'Opponent Touchdowns', value: teamSeasonStats.opponent_touchdowns },
            { label: 'Opponent Pass TDs', value: teamSeasonStats.opponent_pass_touchdowns },
            { label: 'Opponent Rush TDs', value: teamSeasonStats.opponent_rush_touchdowns },
            { label: 'Opponent Pass Attempts', value: teamSeasonStats.opponent_pass_attempts },
            { label: 'Opponent Pass Completions', value: teamSeasonStats.opponent_pass_completions },
            { label: 'Opponent Pass Comp %', value: teamSeasonStats.opponent_pass_completion_percentage ? 
                teamSeasonStats.opponent_pass_completion_percentage.toFixed(1) + '%' : 'N/A' },
            { label: 'Opponent Rush Attempts', value: teamSeasonStats.opponent_rush_attempts },
            { label: 'Opponent Rush Successes', value: teamSeasonStats.opponent_rush_successes },
            { label: 'Opponent Rush Success %', value: teamSeasonStats.opponent_rush_success_percentage ? 
                teamSeasonStats.opponent_rush_success_percentage.toFixed(1) + '%' : 'N/A' },
            { label: 'Opponent First Downs', value: teamSeasonStats.opponent_first_downs },
            { label: 'Opponent Avg Yds/Play', value: teamSeasonStats.opponent_average_yards_per_play ? 
                teamSeasonStats.opponent_average_yards_per_play.toFixed(1) : 'N/A' },
            { label: 'Opponent 3rd Down %', value: teamSeasonStats.opponent_third_down_conversion_percentage ? 
                teamSeasonStats.opponent_third_down_conversion_percentage.toFixed(1) + '%' : 'N/A' },
            { label: 'Opponent 4th Down %', value: teamSeasonStats.opponent_fourth_down_conversion_percentage ? 
                teamSeasonStats.opponent_fourth_down_conversion_percentage.toFixed(1) + '%' : 'N/A' },
            { label: 'Opponent Red Zone %', value: teamSeasonStats.opponent_red_zone_success_percentage ? 
                teamSeasonStats.opponent_red_zone_success_percentage.toFixed(1) + '%' : 'N/A' },
            { label: 'Opponent FG %', value: teamSeasonStats.opponent_field_goal_percentage ? 
                teamSeasonStats.opponent_field_goal_percentage.toFixed(1) + '%' : 'N/A' },
            { label: 'Opponent Time of Possession', value: teamSeasonStats.opponent_time_of_possession ? 
                Math.floor(teamSeasonStats.opponent_time_of_possession / 60) + ':' + 
                (teamSeasonStats.opponent_time_of_possession % 60).toString().padStart(2, '0') : 'N/A' },
            { label: 'Opponent Drives', value: teamSeasonStats.opponent_number_of_drives }
        ];

        const renderStatCategory = (title, stats, color = 'primary.main') => (
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color, fontWeight: 600 }}>
                        {title}
                    </Typography>
                    <Grid container spacing={2}>
                        {stats.map((stat, index) => (
                            <Grid item xs={6} sm={4} md={3} key={index}>
                                <Box sx={{ textAlign: 'center', p: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {stat.label}
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color }}>
                                        {formatStatValue(stat.value)}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>
        );

        return (
            <Box>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                    {selectedTeam?.name} - Season {selectedSeason} Statistics
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', fontStyle: 'italic' }}>
                    Offensive stats show what {selectedTeam?.name} did. Opponent stats show what opponents did against {selectedTeam?.name} (defensive perspective).
                </Typography>
                
                {renderStatCategory('Record', recordStats, 'success.main')}
                {renderStatCategory('Offense', offensiveStats, 'primary.main')}
                {renderStatCategory('Defense', defenseStats, 'error.main')}
                {renderStatCategory('Special Teams', specialTeamsStats, 'secondary.main')}
                {renderStatCategory('Turnovers', turnoverStats, 'warning.main')}
                {renderStatCategory('Defensive Stats', opponentStats, 'grey.600')}
            </Box>
        );
    };



    if (loading && !teams.length) {
        return (
            <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <CircularProgress size={60} />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2 } }}>
            <Box sx={{ 
                pt: { xs: 8, md: 10 },
                pb: { xs: 4, md: 6 }
            }}>
                {/* Page Header */}
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography
                        variant="h3"
                        component="h1"
                        sx={{
                            fontWeight: 'bold',
                            color: 'primary.main',
                            mb: 2
                        }}
                    >
                        Season Statistics
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: 'text.secondary',
                            mb: 3
                        }}
                    >
                        Team and league statistics for the current season
                    </Typography>
                </Box>

                {/* Filters */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Filters
                        </Typography>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6} md={4}>
                                <Autocomplete
                                    options={teams}
                                    getOptionLabel={(option) => option.name}
                                    value={selectedTeam}
                                    onChange={handleTeamChange}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Select Team"
                                            placeholder="Type to search teams..."
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <Box component="li" {...props}>
                                            <Avatar
                                                src={option.logo}
                                                sx={{ width: 24, height: 24, mr: 2 }}
                                            >
                                                {option.abbreviation?.charAt(0) || 'T'}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body1">
                                                    {option.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {option.abbreviation}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
                                />
                            </Grid>
                            
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth>
                                    <InputLabel>Season</InputLabel>
                                    <Select
                                        value={selectedSeason}
                                        label="Season"
                                        onChange={handleSeasonChange}
                                    >
                                        {seasons.map((season) => (
                                            <MenuItem key={season} value={season}>
                                                Season {season}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Error Display */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {/* Loading State */}
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={60} />
                    </Box>
                )}

                {/* Team Stats Section */}
                {selectedTeam && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                            Team Statistics
                        </Typography>
                        {renderTeamSeasonStats()}
                    </Box>
                )}

            </Box>
        </Container>
    );
};

export default SeasonStats;
