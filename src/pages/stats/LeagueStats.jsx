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
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    CircularProgress,
    Alert,
    Button,
    Tabs,
    Tab
} from '@mui/material';
import { getFilteredConferenceStats } from '../../api/conferenceStatsApi';
import { getFilteredLeagueStats } from '../../api/leagueStatsApi';
import { getFilteredPlaybookStats } from '../../api/playbookStatsApi';
import { getCurrentSeason } from '../../api/seasonApi';
import { conferences } from '../../components/constants/conferences';
import { offensivePlaybooks } from '../../components/constants/offensivePlaybooks';
import { defensivePlaybooks } from '../../components/constants/defensivePlaybooks';
import { formatConference, formatOffensivePlaybook, formatDefensivePlaybook } from '../../utils/formatText';

const LeagueStats = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    
    // Data states
    const [conferenceStats, setConferenceStats] = useState([]);
    const [leagueStats, setLeagueStats] = useState([]);
    const [playbookStats, setPlaybookStats] = useState([]);
    
    // Filter states
    const [selectedSeason, setSelectedSeason] = useState(11);
    const [selectedConference, setSelectedConference] = useState('');
    const [selectedOffensivePlaybook, setSelectedOffensivePlaybook] = useState('');
    const [selectedDefensivePlaybook, setSelectedDefensivePlaybook] = useState('');
    
    // Sorting states
    const [conferenceSortField, setConferenceSortField] = useState('');
    const [conferenceSortDirection, setConferenceSortDirection] = useState('asc');
    const [leagueSortField, setLeagueSortField] = useState('');
    const [leagueSortDirection, setLeagueSortDirection] = useState('asc');
    const [playbookSortField, setPlaybookSortField] = useState('');
    const [playbookSortDirection, setPlaybookSortDirection] = useState('asc');

    // Available seasons
    const seasons = [11, 10];

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const currentSeason = await getCurrentSeason();
                
                // Set default season to 11 (most recent season)
                setSelectedSeason(11);
                
                // Load all data for the default season
                await fetchAllData(11);
            } catch (err) {
                setError('Failed to load initial data');
                console.error('Error fetching initial data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const fetchAllData = async (season) => {
        try {
            setLoading(true);
            setError(null);
            
            const [conferenceResponse, leagueResponse, playbookResponse] = await Promise.all([
                getFilteredConferenceStats(null, season, null, 0, 1000), // Get all records for the season
                getFilteredLeagueStats(null, season, 0, 1000), // Get all records for the season
                getFilteredPlaybookStats(null, null, season, 0, 1000) // Get all records for the season
            ]);
            
            // Extract content from paginated responses
            setConferenceStats(conferenceResponse.content || []);
            setLeagueStats(leagueResponse.content || []);
            setPlaybookStats(playbookResponse.content || []);
        } catch (err) {
            setError('Failed to fetch league stats data');
            console.error('Error fetching league stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSeasonChange = (event) => {
        const newSeason = event.target.value;
        setSelectedSeason(newSeason);
        fetchAllData(newSeason);
    };

    const handleConferenceFilter = (event) => {
        setSelectedConference(event.target.value);
    };

    const handleOffensivePlaybookFilter = (event) => {
        setSelectedOffensivePlaybook(event.target.value);
    };

    const handleDefensivePlaybookFilter = (event) => {
        setSelectedDefensivePlaybook(event.target.value);
    };

    const formatStatValue = (value) => {
        if (value === null || value === undefined) return 'N/A';
        if (typeof value === 'number') {
            return value.toLocaleString();
        }
        return value.toString();
    };

    const formatPercentage = (value) => {
        if (value === null || value === undefined) return 'N/A';
        // The values from the API are already in percentage format (e.g., 55.15 for 55.15%)
        return value.toFixed(1) + '%';
    };

    const handleSort = (field, type) => {
        if (type === 'conference') {
            if (conferenceSortField === field) {
                setConferenceSortDirection(conferenceSortDirection === 'asc' ? 'desc' : 'asc');
            } else {
                setConferenceSortField(field);
                setConferenceSortDirection('asc');
            }
        } else if (type === 'league') {
            if (leagueSortField === field) {
                setLeagueSortDirection(leagueSortDirection === 'asc' ? 'desc' : 'asc');
            } else {
                setLeagueSortField(field);
                setLeagueSortDirection('asc');
            }
        } else if (type === 'playbook') {
            if (playbookSortField === field) {
                setPlaybookSortDirection(playbookSortDirection === 'asc' ? 'desc' : 'asc');
            } else {
                setPlaybookSortField(field);
                setPlaybookSortDirection('asc');
            }
        }
    };

    const sortData = (data, field, direction) => {
        if (!field) return data;
        
        return [...data].sort((a, b) => {
            let aVal = a[field];
            let bVal = b[field];
            
            // Handle null/undefined values
            if (aVal === null || aVal === undefined) aVal = '';
            if (bVal === null || bVal === undefined) bVal = '';
            
            // Handle numeric values
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return direction === 'asc' ? aVal - bVal : bVal - aVal;
            }
            
            // Handle string values
            const aStr = String(aVal).toLowerCase();
            const bStr = String(bVal).toLowerCase();
            
            if (direction === 'asc') {
                return aStr.localeCompare(bStr);
            } else {
                return bStr.localeCompare(aStr);
            }
        });
    };

    const renderConferenceStats = () => {
        const filteredStats = selectedConference 
            ? conferenceStats.filter(stat => 
                (stat.conference?.name === selectedConference) || 
                (stat.conference === selectedConference)
              )
            : conferenceStats;

        if (!filteredStats.length) return null;

        const sortedStats = sortData(filteredStats, conferenceSortField, conferenceSortDirection);

        // Define stat categories
        const statCategories = [
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
                    { key: 'pass_completion_percentage', label: 'Pass Comp %', format: formatPercentage },
                    { key: 'rush_attempts', label: 'Rush Attempts' },
                    { key: 'rush_successes', label: 'Rush Successes' },
                    { key: 'rush_success_percentage', label: 'Rush Success %', format: formatPercentage },
                    { key: 'first_downs', label: 'First Downs' },
                    { key: 'average_yards_per_play', label: 'Avg Yds/Play' }
                ]
            },
            {
                title: 'Defense (Opponent Stats)',
                stats: [
                    { key: 'opponent_total_yards', label: 'Opp Total Yards' },
                    { key: 'opponent_pass_yards', label: 'Opp Pass Yards' },
                    { key: 'opponent_rush_yards', label: 'Opp Rush Yards' },
                    { key: 'opponent_touchdowns', label: 'Opp Touchdowns' },
                    { key: 'opponent_pass_touchdowns', label: 'Opp Pass TDs' },
                    { key: 'opponent_rush_touchdowns', label: 'Opp Rush TDs' },
                    { key: 'opponent_pass_attempts', label: 'Opp Pass Attempts' },
                    { key: 'opponent_pass_completions', label: 'Opp Pass Completions' },
                    { key: 'opponent_pass_completion_percentage', label: 'Opp Pass Comp %', format: formatPercentage },
                    { key: 'opponent_rush_attempts', label: 'Opp Rush Attempts' },
                    { key: 'opponent_rush_successes', label: 'Opp Rush Successes' },
                    { key: 'opponent_rush_success_percentage', label: 'Opp Rush Success %', format: formatPercentage },
                    { key: 'opponent_first_downs', label: 'Opp First Downs' },
                    { key: 'opponent_average_yards_per_play', label: 'Opp Avg Yds/Play' }
                ]
            },
            {
                title: 'Turnovers & Sacks',
                stats: [
                    { key: 'turnover_differential', label: 'Turnover Diff' },
                    { key: 'interceptions_lost', label: 'Int Lost' },
                    { key: 'interceptions_forced', label: 'Int Forced' },
                    { key: 'fumbles_lost', label: 'Fumbles Lost' },
                    { key: 'fumbles_forced', label: 'Fumbles Forced' },
                    { key: 'turnovers_lost', label: 'Turnovers Lost' },
                    { key: 'turnovers_forced', label: 'Turnovers Forced' },
                    { key: 'sacks_allowed', label: 'Sacks Allowed' },
                    { key: 'sacks_forced', label: 'Sacks Forced' }
                ]
            },
            {
                title: 'Special Teams',
                stats: [
                    { key: 'field_goal_made', label: 'FG Made' },
                    { key: 'field_goal_attempts', label: 'FG Attempts' },
                    { key: 'field_goal_percentage', label: 'FG %', format: formatPercentage },
                    { key: 'longest_field_goal', label: 'Longest FG' },
                    { key: 'blocked_opponent_field_goals', label: 'Blocked FGs' },
                    { key: 'punts_attempted', label: 'Punts' },
                    { key: 'longest_punt', label: 'Longest Punt' },
                    { key: 'average_punt_length', label: 'Avg Punt Length' },
                    { key: 'blocked_opponent_punt', label: 'Blocked Punts' },
                    { key: 'punt_return_td', label: 'Punt Return TDs' },
                    { key: 'kick_return_td', label: 'Kick Return TDs' }
                ]
            },
            {
                title: 'Down Conversions',
                stats: [
                    { key: 'third_down_conversion_success', label: '3rd Down Success' },
                    { key: 'third_down_conversion_attempts', label: '3rd Down Attempts' },
                    { key: 'third_down_conversion_percentage', label: '3rd Down %', format: formatPercentage },
                    { key: 'fourth_down_conversion_success', label: '4th Down Success' },
                    { key: 'fourth_down_conversion_attempts', label: '4th Down Attempts' },
                    { key: 'fourth_down_conversion_percentage', label: '4th Down %', format: formatPercentage },
                    { key: 'opponent_third_down_conversion_success', label: 'Opp 3rd Down Success' },
                    { key: 'opponent_third_down_conversion_attempts', label: 'Opp 3rd Down Attempts' },
                    { key: 'opponent_third_down_conversion_percentage', label: 'Opp 3rd Down %', format: formatPercentage },
                    { key: 'opponent_fourth_down_conversion_success', label: 'Opp 4th Down Success' },
                    { key: 'opponent_fourth_down_conversion_attempts', label: 'Opp 4th Down Attempts' },
                    { key: 'opponent_fourth_down_conversion_percentage', label: 'Opp 4th Down %', format: formatPercentage }
                ]
            },
            {
                title: 'Red Zone',
                stats: [
                    { key: 'red_zone_attempts', label: 'Red Zone Attempts' },
                    { key: 'red_zone_successes', label: 'Red Zone Successes' },
                    { key: 'red_zone_success_percentage', label: 'Red Zone Success %', format: formatPercentage },
                    { key: 'opponent_red_zone_attempts', label: 'Opp Red Zone Attempts' },
                    { key: 'opponent_red_zone_successes', label: 'Opp Red Zone Successes' },
                    { key: 'opponent_red_zone_success_percentage', label: 'Opp Red Zone Success %', format: formatPercentage }
                ]
            }
        ];

        return (
            <Box>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                    Conference Statistics - Season {selectedSeason}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary', fontStyle: 'italic' }}>
                    Offensive stats show what each conference did. Opponent stats show what opponents did against each conference (defensive perspective).
                </Typography>
                
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Filter by Conference</InputLabel>
                                    <Select
                                        value={selectedConference}
                                        label="Filter by Conference"
                                        onChange={handleConferenceFilter}
                                    >
                                        <MenuItem value="">All Conferences</MenuItem>
                                        {conferences.map((conference) => (
                                            <MenuItem key={conference.value} value={conference.value}>
                                                {conference.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {statCategories.map((category, categoryIndex) => (
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
                                                    cursor: 'pointer',
                                                    fontSize: '0.75rem',
                                                    minWidth: 120
                                                }}
                                                onClick={() => handleSort('conference', 'conference')}
                                            >
                                                Conference {conferenceSortField === 'conference' && (conferenceSortDirection === 'asc' ? '↑' : '↓')}
                                            </TableCell>
                                            {category.stats.map((stat) => (
                                                <TableCell
                                                    key={stat.key}
                                                    sx={{ 
                                                        fontWeight: 'bold', 
                                                        backgroundColor: 'primary.main', 
                                                        color: 'white', 
                                                        textAlign: 'center',
                                                        cursor: 'pointer',
                                                        fontSize: '0.75rem',
                                                        minWidth: 100
                                                    }}
                                                    onClick={() => handleSort(stat.key, 'conference')}
                                                >
                                                    {stat.label} {conferenceSortField === stat.key && (conferenceSortDirection === 'asc' ? '↑' : '↓')}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {sortedStats.map((stat, index) => (
                                            <TableRow key={index} hover>
                                                <TableCell sx={{ fontSize: '0.75rem' }}>
                                                    <Chip 
                                                        label={formatConference(stat.conference || 'Unknown')} 
                                                        color="primary"
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                </TableCell>
                                                {category.stats.map((statDef) => (
                                                    <TableCell key={statDef.key} sx={{ textAlign: 'center', fontSize: '0.75rem' }}>
                                                        {statDef.format 
                                                            ? statDef.format(stat[statDef.key])
                                                            : formatStatValue(stat[statDef.key])
                                                        }
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

    const renderLeagueStats = () => {
        if (!leagueStats.length) return null;

        const sortedStats = sortData(leagueStats, leagueSortField, leagueSortDirection);

        // Define stat categories for League Stats
        const statCategories = [
            {
                title: 'Offense',
                stats: [
                    { key: 'total_yards', label: 'Total Yards' },
                    { key: 'pass_yards', label: 'Pass Yards' },
                    { key: 'rush_yards', label: 'Rush Yards' },
                    { key: 'pass_touchdowns', label: 'Pass TDs' },
                    { key: 'rush_touchdowns', label: 'Rush TDs' },
                    { key: 'pass_attempts', label: 'Pass Attempts' },
                    { key: 'pass_completions', label: 'Pass Completions' },
                    { key: 'pass_completion_percentage', label: 'Pass Comp %', format: formatPercentage },
                    { key: 'pass_interceptions', label: 'Pass Int' },
                    { key: 'pass_successes', label: 'Pass Successes' },
                    { key: 'pass_success_percentage', label: 'Pass Success %', format: formatPercentage },
                    { key: 'longest_pass', label: 'Longest Pass' },
                    { key: 'rush_attempts', label: 'Rush Attempts' },
                    { key: 'rush_successes', label: 'Rush Successes' },
                    { key: 'rush_success_percentage', label: 'Rush Success %', format: formatPercentage },
                    { key: 'longest_run', label: 'Longest Run' },
                    { key: 'first_downs', label: 'First Downs' },
                    { key: 'average_yards_per_play', label: 'Avg Yds/Play' }
                ]
            },
            {
                title: 'Defense',
                stats: [
                    { key: 'sacks_allowed', label: 'Sacks Allowed' },
                    { key: 'sacks_forced', label: 'Sacks Forced' },
                    { key: 'interceptions_forced', label: 'Int Forced' },
                    { key: 'fumbles_forced', label: 'Fumbles Forced' },
                    { key: 'fumbles_recovered', label: 'Fumbles Recovered' },
                    { key: 'defensive_touchdowns', label: 'Def TDs' }
                ]
            },
            {
                title: 'Special Teams',
                stats: [
                    { key: 'field_goals_attempted', label: 'FG Attempts' },
                    { key: 'field_goals_made', label: 'FG Made' },
                    { key: 'field_goal_percentage', label: 'FG %', format: formatPercentage },
                    { key: 'longest_field_goal', label: 'Longest FG' },
                    { key: 'punts', label: 'Punts' },
                    { key: 'longest_punt', label: 'Longest Punt' },
                    { key: 'kickoff_return_touchdowns', label: 'Kick Return TDs' },
                    { key: 'punt_return_touchdowns', label: 'Punt Return TDs' }
                ]
            }
        ];

        return (
            <Box>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                    League Statistics by Season
                </Typography>
                
                {statCategories.map((category, categoryIndex) => (
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
                                                    cursor: 'pointer',
                                                    fontSize: '0.75rem',
                                                    minWidth: 120
                                                }}
                                                onClick={() => handleSort('season_number', 'league')}
                                            >
                                                Season {leagueSortField === 'season_number' && (leagueSortDirection === 'asc' ? '↑' : '↓')}
                                            </TableCell>
                                            {category.stats.map((stat) => (
                                                <TableCell
                                                    key={stat.key}
                                                    sx={{ 
                                                        fontWeight: 'bold', 
                                                        backgroundColor: 'primary.main', 
                                                        color: 'white', 
                                                        textAlign: 'center',
                                                        cursor: 'pointer',
                                                        fontSize: '0.75rem',
                                                        minWidth: 100
                                                    }}
                                                    onClick={() => handleSort(stat.key, 'league')}
                                                >
                                                    {stat.label} {leagueSortField === stat.key && (leagueSortDirection === 'asc' ? '↑' : '↓')}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {sortedStats.map((stat, index) => (
                                            <TableRow key={index} hover>
                                                <TableCell sx={{ fontSize: '0.75rem' }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                                                        Season {stat.season_number}
                                                    </Typography>
                                                </TableCell>
                                                {category.stats.map((statDef) => (
                                                    <TableCell key={statDef.key} sx={{ textAlign: 'center', fontSize: '0.75rem' }}>
                                                        {statDef.format 
                                                            ? statDef.format(stat[statDef.key])
                                                            : formatStatValue(stat[statDef.key])
                                                        }
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

    const renderPlaybookStats = () => {
        let filteredStats = playbookStats;
        
        if (selectedOffensivePlaybook) {
            filteredStats = filteredStats.filter(stat => 
                stat.offensive_playbook === selectedOffensivePlaybook
            );
        }
        
        if (selectedDefensivePlaybook) {
            filteredStats = filteredStats.filter(stat => 
                stat.defensive_playbook === selectedDefensivePlaybook
            );
        }

        if (!filteredStats.length) return null;

        const sortedStats = sortData(filteredStats, playbookSortField, playbookSortDirection);

        // Define stat categories for Playbook Stats
        const statCategories = [
            {
                title: 'Offense',
                stats: [
                    { key: 'total_yards', label: 'Total Yards' },
                    { key: 'pass_yards', label: 'Pass Yards' },
                    { key: 'rush_yards', label: 'Rush Yards' },
                    { key: 'pass_touchdowns', label: 'Pass TDs' },
                    { key: 'rush_touchdowns', label: 'Rush TDs' },
                    { key: 'pass_attempts', label: 'Pass Attempts' },
                    { key: 'pass_completions', label: 'Pass Completions' },
                    { key: 'pass_completion_percentage', label: 'Pass Comp %', format: formatPercentage },
                    { key: 'pass_interceptions', label: 'Pass Int' },
                    { key: 'pass_successes', label: 'Pass Successes' },
                    { key: 'pass_success_percentage', label: 'Pass Success %', format: formatPercentage },
                    { key: 'longest_pass', label: 'Longest Pass' },
                    { key: 'rush_attempts', label: 'Rush Attempts' },
                    { key: 'rush_successes', label: 'Rush Successes' },
                    { key: 'rush_success_percentage', label: 'Rush Success %', format: formatPercentage },
                    { key: 'longest_run', label: 'Longest Run' },
                    { key: 'first_downs', label: 'First Downs' },
                    { key: 'average_yards_per_play', label: 'Avg Yds/Play' }
                ]
            },
            {
                title: 'Defense',
                stats: [
                    { key: 'sacks_allowed', label: 'Sacks Allowed' },
                    { key: 'sacks_forced', label: 'Sacks Forced' },
                    { key: 'interceptions_forced', label: 'Int Forced' },
                    { key: 'fumbles_forced', label: 'Fumbles Forced' },
                    { key: 'fumbles_recovered', label: 'Fumbles Recovered' },
                    { key: 'defensive_touchdowns', label: 'Def TDs' }
                ]
            },
            {
                title: 'Special Teams',
                stats: [
                    { key: 'field_goals_attempted', label: 'FG Attempts' },
                    { key: 'field_goals_made', label: 'FG Made' },
                    { key: 'field_goal_percentage', label: 'FG %', format: formatPercentage },
                    { key: 'longest_field_goal', label: 'Longest FG' },
                    { key: 'punts', label: 'Punts' },
                    { key: 'longest_punt', label: 'Longest Punt' },
                    { key: 'kickoff_return_touchdowns', label: 'Kick Return TDs' },
                    { key: 'punt_return_touchdowns', label: 'Punt Return TDs' }
                ]
            }
        ];

        return (
            <Box>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                    Playbook Statistics
                </Typography>
                
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Offensive Playbook</InputLabel>
                                    <Select
                                        value={selectedOffensivePlaybook}
                                        label="Offensive Playbook"
                                        onChange={handleOffensivePlaybookFilter}
                                    >
                                        <MenuItem value="">All Offensive Playbooks</MenuItem>
                                        {offensivePlaybooks.map((playbook) => (
                                            <MenuItem key={playbook.value} value={playbook.value}>
                                                {playbook.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Defensive Playbook</InputLabel>
                                    <Select
                                        value={selectedDefensivePlaybook}
                                        label="Defensive Playbook"
                                        onChange={handleDefensivePlaybookFilter}
                                    >
                                        <MenuItem value="">All Defensive Playbooks</MenuItem>
                                        {defensivePlaybooks.map((playbook) => (
                                            <MenuItem key={playbook.value} value={playbook.value}>
                                                {playbook.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {statCategories.map((category, categoryIndex) => (
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
                                                    cursor: 'pointer',
                                                    fontSize: '0.75rem',
                                                    minWidth: 120
                                                }}
                                                onClick={() => handleSort('offensive_playbook', 'playbook')}
                                            >
                                                Offensive Playbook {playbookSortField === 'offensive_playbook' && (playbookSortDirection === 'asc' ? '↑' : '↓')}
                                            </TableCell>
                                            <TableCell 
                                                sx={{ 
                                                    fontWeight: 'bold', 
                                                    backgroundColor: 'primary.main', 
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    fontSize: '0.75rem',
                                                    minWidth: 120
                                                }}
                                                onClick={() => handleSort('defensive_playbook', 'playbook')}
                                            >
                                                Defensive Playbook {playbookSortField === 'defensive_playbook' && (playbookSortDirection === 'asc' ? '↑' : '↓')}
                                            </TableCell>
                                            {category.stats.map((stat) => (
                                                <TableCell
                                                    key={stat.key}
                                                    sx={{ 
                                                        fontWeight: 'bold', 
                                                        backgroundColor: 'primary.main', 
                                                        color: 'white', 
                                                        textAlign: 'center',
                                                        cursor: 'pointer',
                                                        fontSize: '0.75rem',
                                                        minWidth: 100
                                                    }}
                                                    onClick={() => handleSort(stat.key, 'playbook')}
                                                >
                                                    {stat.label} {playbookSortField === stat.key && (playbookSortDirection === 'asc' ? '↑' : '↓')}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {sortedStats.map((stat, index) => (
                                            <TableRow key={index} hover>
                                                <TableCell sx={{ fontSize: '0.75rem' }}>
                                                    <Chip 
                                                        label={formatOffensivePlaybook(stat.offensive_playbook?.name || stat.offensive_playbook || 'Unknown')} 
                                                        color="primary"
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ fontSize: '0.75rem' }}>
                                                    <Chip 
                                                        label={formatDefensivePlaybook(stat.defensive_playbook?.name || stat.defensive_playbook || 'Unknown')} 
                                                        color="secondary"
                                                        variant="outlined"
                                                        size="small"
                                                    />
                                                </TableCell>
                                                {category.stats.map((statDef) => (
                                                    <TableCell key={statDef.key} sx={{ textAlign: 'center', fontSize: '0.75rem' }}>
                                                        {statDef.format 
                                                            ? statDef.format(stat[statDef.key])
                                                            : formatStatValue(stat[statDef.key])
                                                        }
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

    if (loading && !conferenceStats.length) {
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
                        League Statistics
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: 'text.secondary',
                            mb: 3
                        }}
                    >
                        Conference, league, and playbook statistics across all seasons
                    </Typography>
                </Box>

                {/* Season Filter */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Filters
                        </Typography>
                        <Grid container spacing={2} alignItems="center">
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

                {/* Tabs */}
                <Card sx={{ mb: 3 }}>
                    <Tabs
                        value={activeTab}
                        onChange={(e, newValue) => setActiveTab(newValue)}
                        variant="fullWidth"
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                    >
                        <Tab label="Conference Stats" />
                        <Tab label="League Stats" />
                        <Tab label="Playbook Stats" />
                    </Tabs>
                </Card>

                {/* Tab Content */}
                {activeTab === 0 && renderConferenceStats()}
                {activeTab === 1 && renderLeagueStats()}
                {activeTab === 2 && renderPlaybookStats()}
            </Box>
        </Container>
    );
};

export default LeagueStats;
