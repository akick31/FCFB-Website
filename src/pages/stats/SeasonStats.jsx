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
                {renderStatCategory('Efficiency', efficiencyStats, 'info.main')}
                {renderStatCategory('Opponent Stats (What Opponents Did Against Us)', opponentStats, 'grey.600')}
            </Box>
        );
    };

    const renderTeamGameStats = () => {
        if (!teamGameStats.length) return null;

        // Define stat categories for game stats
        const gameStatCategories = [
            {
                title: 'Basic Game Info',
                stats: [
                    { key: 'week', label: 'Week' },
                    { key: 'opponent', label: 'Opponent', getValue: (game) => getOpponentName(game) },
                    { key: 'result', label: 'Result', getValue: (game) => {
                        let result = '-';
                        if (game.game_status === 'FINAL') {
                            result = game.score > 0 ? 'W' : 'L';
                        } else if (game.game_status === 'IN_PROGRESS') {
                            result = 'LIVE';
                        }
                        return result;
                    }},
                    { key: 'score', label: 'Score' },
                    { key: 'opponentScore', label: 'Opp Score', getValue: (game) => getOpponentScore(game) }
                ]
            },
            {
                title: 'Offense',
                stats: [
                    { key: 'total_yards', label: 'Total Yards' },
                    { key: 'pass_yards', label: 'Pass Yards' },
                    { key: 'rush_yards', label: 'Rush Yards' },
                    { key: 'touchdowns', label: 'Touchdowns' },
                    { key: 'pass_touchdowns', label: 'Pass TDs' },
                    { key: 'rush_touchdowns', label: 'Rush TDs' },
                    { key: 'pass_attempts', label: 'Pass Attempts' },
                    { key: 'pass_completions', label: 'Pass Completions' },
                    { key: 'pass_completion_percentage', label: 'Pass Comp %', format: (val) => val ? val.toFixed(1) + '%' : 'N/A' },
                    { key: 'rush_attempts', label: 'Rush Attempts' },
                    { key: 'rush_successes', label: 'Rush Successes' },
                    { key: 'pass_successes', label: 'Pass Successes' },
                    { key: 'first_downs', label: 'First Downs' },
                    { key: 'average_yards_per_play', label: 'Avg Yds/Play', format: (val) => val ? val.toFixed(1) : 'N/A' }
                ]
            },
            {
                title: 'Defense & Turnovers',
                stats: [
                    { key: 'sacks_allowed', label: 'Sacks Allowed' },
                    { key: 'sacks_forced', label: 'Sacks Forced' },
                    { key: 'interceptions_lost', label: 'INT Lost' },
                    { key: 'interceptions_forced', label: 'INT Forced' },
                    { key: 'fumbles_lost', label: 'Fumbles Lost' },
                    { key: 'fumbles_forced', label: 'Fumbles Forced' },
                    { key: 'turnover_differential', label: 'Turnover Diff' },
                    { key: 'turnovers_lost', label: 'Turnovers Lost' },
                    { key: 'turnovers_forced', label: 'Turnovers Forced' }
                ]
            },
            {
                title: 'Special Teams',
                stats: [
                    { key: 'field_goal_made', label: 'FG Made' },
                    { key: 'field_goal_attempts', label: 'FG Attempts' },
                    { key: 'field_goal_percentage', label: 'FG %', format: (val) => val ? val.toFixed(1) + '%' : 'N/A' },
                    { key: 'longest_field_goal', label: 'Longest FG' },
                    { key: 'punts_attempted', label: 'Punts' },
                    { key: 'longest_punt', label: 'Longest Punt' },
                    { key: 'average_punt_length', label: 'Avg Punt', format: (val) => val ? val.toFixed(1) : 'N/A' }
                ]
            },
            {
                title: 'Efficiency & Situational',
                stats: [
                    { key: 'third_down_conversion_success', label: '3rd Down Success' },
                    { key: 'third_down_conversion_attempts', label: '3rd Down Attempts' },
                    { key: 'third_down_conversion_percentage', label: '3rd Down %', format: (val) => val ? val.toFixed(1) + '%' : 'N/A' },
                    { key: 'fourth_down_conversion_success', label: '4th Down Success' },
                    { key: 'fourth_down_conversion_attempts', label: '4th Down Attempts' },
                    { key: 'fourth_down_conversion_percentage', label: '4th Down %', format: (val) => val ? val.toFixed(1) + '%' : 'N/A' },
                    { key: 'red_zone_successes', label: 'Red Zone Success' },
                    { key: 'red_zone_attempts', label: 'Red Zone Attempts' },
                    { key: 'red_zone_success_percentage', label: 'Red Zone %', format: (val) => val ? val.toFixed(1) + '%' : 'N/A' }
                ]
            },
            {
                title: 'Game Flow',
                stats: [
                    { key: 'time_of_possession', label: 'Time of Possession', format: (val) => val ? 
                        Math.floor(val / 60) + ':' + (val % 60).toString().padStart(2, '0') : 'N/A' },
                    { key: 'number_of_drives', label: 'Drives' },
                    { key: 'largest_lead', label: 'Largest Lead' },
                    { key: 'largest_deficit', label: 'Largest Deficit' }
                ]
            }
        ];

        return (
            <Box>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                    Game by Game Statistics
                </Typography>
                
                {gameStatCategories.map((category, categoryIndex) => (
                    <Card key={categoryIndex} sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                                {category.title}
                            </Typography>
                            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell 
                                                sx={{ 
                                                    fontWeight: 'bold', 
                                                    backgroundColor: 'primary.main', 
                                                    color: 'white',
                                                    fontSize: '0.75rem',
                                                    minWidth: 120
                                                }}
                                            >
                                                Game
                                            </TableCell>
                                            {category.stats.map((stat) => (
                                                <TableCell
                                                    key={stat.key}
                                                    sx={{ 
                                                        fontWeight: 'bold', 
                                                        backgroundColor: 'primary.main', 
                                                        color: 'white', 
                                                        textAlign: 'center',
                                                        fontSize: '0.75rem',
                                                        minWidth: 100
                                                    }}
                                                >
                                                    {stat.label}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {teamGameStats.map((game, index) => (
                                            <TableRow key={index} hover>
                                                <TableCell sx={{ fontSize: '0.75rem' }}>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            Week {game.week}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            vs {getOpponentName(game)}
                                                        </Typography>
                                                        <Box sx={{ mt: 0.5 }}>
                                                            <Chip 
                                                                label={(() => {
                                                                    let result = '-';
                                                                    if (game.game_status === 'FINAL') {
                                                                        result = game.score > 0 ? 'W' : 'L';
                                                                    } else if (game.game_status === 'IN_PROGRESS') {
                                                                        result = 'LIVE';
                                                                    }
                                                                    return result;
                                                                })()} 
                                                                color={(() => {
                                                                    let result = '-';
                                                                    if (game.game_status === 'FINAL') {
                                                                        result = game.score > 0 ? 'W' : 'L';
                                                                    } else if (game.game_status === 'IN_PROGRESS') {
                                                                        result = 'LIVE';
                                                                    }
                                                                    return result === 'W' ? 'success' : result === 'L' ? 'error' : 'warning';
                                                                })()}
                                                                size="small"
                                                            />
                                                        </Box>
                                                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                                            {game.score} - {getOpponentScore(game)}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                {category.stats.map((statDef) => (
                                                    <TableCell key={statDef.key} sx={{ textAlign: 'center', fontSize: '0.75rem' }}>
                                                        {(() => {
                                                            let value;
                                                            if (statDef.getValue) {
                                                                value = statDef.getValue(game);
                                                            } else {
                                                                value = game[statDef.key];
                                                            }
                                                            
                                                            if (statDef.format) {
                                                                return statDef.format(value);
                                                            }
                                                            return formatStatValue(value);
                                                        })()}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                ))}
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
                        {renderTeamGameStats()}
                    </Box>
                )}

            </Box>
        </Container>
    );
};

export default SeasonStats;
