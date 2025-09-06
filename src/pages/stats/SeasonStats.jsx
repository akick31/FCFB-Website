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
import { getGameStatsByTeamAndSeason } from '../../api/gameStatsApi';
import { getAllTeams } from '../../api/teamApi';
import { getCurrentSeason } from '../../api/seasonApi';
import { getGameById } from '../../api/gameApi';

const SeasonStats = ({ user }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Data states
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [teamSeasonStats, setTeamSeasonStats] = useState(null);
    const [teamGameStats, setTeamGameStats] = useState([]);
    const [gameDetails, setGameDetails] = useState({});

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
            
            const [seasonStatsResponse, gameStats] = await Promise.all([
                getFilteredSeasonStats(team.name, null, season, null, 0, 1), // Get season stats for specific team and season
                getGameStatsByTeamAndSeason(team.name, season)
            ]);
            
            // Extract the season stats from the paginated response
            const seasonStats = seasonStatsResponse.content && seasonStatsResponse.content.length > 0 
                ? seasonStatsResponse.content[0] 
                : null;
            
            // Fetch game details for each game to get opponent names
            const gameDetailsMap = {};
            const gameDetailPromises = gameStats.map(async (gameStat) => {
                try {
                    const gameDetail = await getGameById(gameStat.game_id);
                    gameDetailsMap[gameStat.game_id] = gameDetail;
                } catch (err) {
                    console.error(`Failed to fetch game details for game ${gameStat.game_id}:`, err);
                    gameDetailsMap[gameStat.game_id] = null;
                }
            });
            
            await Promise.all(gameDetailPromises);
            
            setTeamSeasonStats(seasonStats);
            setTeamGameStats(gameStats);
            setGameDetails(gameDetailsMap);
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
            setTeamGameStats([]);
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

    const getOpponentName = (gameStat) => {
        const gameDetail = gameDetails[gameStat.game_id];
        if (!gameDetail) return 'TBD';
        
        // Find the opponent team (the team that is not the current team)
        if (gameDetail.home_team === gameStat.team) {
            return gameDetail.away_team || 'TBD';
        } else if (gameDetail.away_team === gameStat.team) {
            return gameDetail.home_team || 'TBD';
        }
        
        return 'TBD';
    };

    const getOpponentScore = (gameStat) => {
        const gameDetail = gameDetails[gameStat.game_id];
        if (!gameDetail) return '-';
        
        // Find the opponent's score
        if (gameDetail.home_team === gameStat.team) {
            return gameDetail.away_score || '-';
        } else if (gameDetail.away_team === gameStat.team) {
            return gameDetail.home_score || '-';
        }
        
        return '-';
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
                
                {renderStatCategory('Record', recordStats, 'success.main')}
                {renderStatCategory('Offense', offensiveStats, 'primary.main')}
                {renderStatCategory('Defense', defenseStats, 'error.main')}
                {renderStatCategory('Special Teams', specialTeamsStats, 'secondary.main')}
                {renderStatCategory('Turnovers', turnoverStats, 'warning.main')}
                {renderStatCategory('Efficiency', efficiencyStats, 'info.main')}
            </Box>
        );
    };

    const renderTeamGameStats = () => {
        if (!teamGameStats.length) return null;

        const columns = [
            { id: 'week', label: 'Week', width: 50 },
            { id: 'opponent', label: 'Opponent', width: 100 },
            { id: 'result', label: 'Result', width: 50 },
            { id: 'score', label: 'Score', width: 60 },
            { id: 'opponentScore', label: 'Opp Score', width: 70 },
            { id: 'totalYards', label: 'Total Yds', width: 70 },
            { id: 'passYards', label: 'Pass Yds', width: 70 },
            { id: 'rushYards', label: 'Rush Yds', width: 70 },
            { id: 'touchdowns', label: 'TDs', width: 40 },
            { id: 'passTds', label: 'Pass TDs', width: 60 },
            { id: 'rushTds', label: 'Rush TDs', width: 60 },
            { id: 'completion', label: 'Comp %', width: 60 },
            { id: 'thirdDown', label: '3rd %', width: 60 },
            { id: 'fourthDown', label: '4th %', width: 60 },
            { id: 'turnovers', label: 'TOs', width: 40 },
            { id: 'firstDowns', label: '1st Downs', width: 60 },
            { id: 'avgYards', label: 'Avg Yds/Play', width: 70 },
            { id: 'passAttempts', label: 'Pass Att', width: 60 },
            { id: 'passCompletions', label: 'Pass Comp', width: 60 },
            { id: 'rushAttempts', label: 'Rush Att', width: 60 },
            { id: 'rushSuccesses', label: 'Rush Success', width: 70 },
            { id: 'passSuccesses', label: 'Pass Success', width: 70 },
            { id: 'longestPass', label: 'Long Pass', width: 60 },
            { id: 'longestRun', label: 'Long Run', width: 60 },
            { id: 'sacksAllowed', label: 'Sacks Allowed', width: 70 },
            { id: 'sacksForced', label: 'Sacks Forced', width: 70 },
            { id: 'interceptionsLost', label: 'INT Lost', width: 60 },
            { id: 'interceptionsForced', label: 'INT Forced', width: 60 },
            { id: 'fumblesLost', label: 'Fumbles Lost', width: 70 },
            { id: 'fumblesForced', label: 'Fumbles Forced', width: 70 },
            { id: 'turnoverDiff', label: 'TO Diff', width: 60 },
            { id: 'fieldGoals', label: 'FG Made/Att', width: 70 },
            { id: 'fieldGoalPct', label: 'FG %', width: 50 },
            { id: 'longestFG', label: 'Long FG', width: 60 },
            { id: 'punts', label: 'Punts', width: 50 },
            { id: 'longestPunt', label: 'Long Punt', width: 60 },
            { id: 'avgPunt', label: 'Avg Punt', width: 60 },
            { id: 'redZone', label: 'Red Zone', width: 60 },
            { id: 'redZonePct', label: 'RZ %', width: 50 },
            { id: 'timeOfPossession', label: 'TOP (min)', width: 70 },
            { id: 'drives', label: 'Drives', width: 50 },
            { id: 'largestLead', label: 'Largest Lead', width: 70 },
            { id: 'largestDeficit', label: 'Largest Deficit', width: 80 }
        ];

        return (
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                        Game by Game Statistics
                    </Typography>
                    <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableCell
                                            key={column.id}
                                            sx={{
                                                backgroundColor: 'primary.main',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                minWidth: column.width,
                                                textAlign: 'center',
                                                fontSize: '0.75rem'
                                            }}
                                        >
                                            {column.label}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {teamGameStats.map((game, index) => {
                                    // Determine result based on score and game status
                                    let result = '-';
                                    if (game.game_status === 'FINAL') {
                                        result = game.score > 0 ? 'W' : 'L';
                                    } else if (game.game_status === 'IN_PROGRESS') {
                                        result = 'LIVE';
                                    }
                                    
                                    return (
                                        <TableRow key={index} hover>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                                                    {game.week}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ fontSize: '0.75rem' }}>
                                                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                                    {getOpponentName(game)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <Chip 
                                                    label={result} 
                                                    size="small"
                                                    color={result === 'W' ? 'success' : result === 'L' ? 'error' : 'default'}
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                                                    {game.score || '-'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                                                    {getOpponentScore(game)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>{formatStatValue(game.total_yards)}</TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>{formatStatValue(game.pass_yards)}</TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>{formatStatValue(game.rush_yards)}</TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>{formatStatValue(game.touchdowns)}</TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>{formatStatValue(game.pass_touchdowns)}</TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>{formatStatValue(game.rush_touchdowns)}</TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>
                                                {game.pass_completion_percentage ? 
                                                    game.pass_completion_percentage.toFixed(1) + '%' : '-'}
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>
                                                {game.third_down_conversion_percentage ? 
                                                    game.third_down_conversion_percentage.toFixed(1) + '%' : '-'}
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>
                                                {game.fourth_down_conversion_percentage ? 
                                                    game.fourth_down_conversion_percentage.toFixed(1) + '%' : '-'}
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>{formatStatValue(game.turnovers_lost)}</TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>{formatStatValue(game.first_downs)}</TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>
                                                {game.average_yards_per_play ? 
                                                    game.average_yards_per_play.toFixed(1) : '-'}
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>{formatStatValue(game.pass_attempts)}</TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>{formatStatValue(game.pass_completions)}</TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>{formatStatValue(game.rush_attempts)}</TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>{formatStatValue(game.rush_successes)}</TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>{formatStatValue(game.pass_successes)}</TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>{formatStatValue(game.longest_pass)}</TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>{formatStatValue(game.longest_run)}</TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>{formatStatValue(game.sacks_allowed)}</TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>{formatStatValue(game.sacks_forced)}</TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>{formatStatValue(game.interceptions_lost)}</TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>{formatStatValue(game.interceptions_forced)}</TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>{formatStatValue(game.fumbles_lost)}</TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>{formatStatValue(game.fumbles_forced)}</TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>{formatStatValue(game.turnover_differential)}</TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>
                                                {game.field_goal_made}/{game.field_goal_attempts}
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>
                                                {game.field_goal_percentage ? 
                                                    game.field_goal_percentage.toFixed(1) + '%' : '-'}
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>{formatStatValue(game.longest_field_goal)}</TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>{formatStatValue(game.punts_attempted)}</TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>{formatStatValue(game.longest_punt)}</TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>
                                                {game.average_punt_length ? 
                                                    game.average_punt_length.toFixed(1) : '-'}
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>
                                                {game.red_zone_successes}/{game.red_zone_attempts}
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>
                                                {game.red_zone_success_percentage ? 
                                                    game.red_zone_success_percentage.toFixed(1) + '%' : '-'}
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>
                                                {game.time_of_possession ? 
                                                    Math.round(game.time_of_possession / 60) : '-'}
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>{formatStatValue(game.number_of_drives)}</TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>{formatStatValue(game.largest_lead)}</TableCell>
                                            <TableCell sx={{ textAlign: 'center', fontSize: '0.75rem' }}>{formatStatValue(game.largest_deficit)}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
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
                        {renderTeamGameStats()}
                    </Box>
                )}

            </Box>
        </Container>
    );
};

export default SeasonStats;
