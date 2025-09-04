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
import { getAllConferenceStats, getConferenceStatsBySeason } from '../../api/conferenceStatsApi';
import { getAllLeagueStats, getLeagueStatsBySeason } from '../../api/leagueStatsApi';
import { getAllPlaybookStats, getPlaybookStatsBySeason } from '../../api/playbookStatsApi';
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
            
            const [conferenceData, leagueData, playbookData] = await Promise.all([
                getConferenceStatsBySeason(season),
                getLeagueStatsBySeason(season),
                getPlaybookStatsBySeason(season)
            ]);
            
            setConferenceStats(conferenceData);
            setLeagueStats(leagueData);
            setPlaybookStats(playbookData);
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

        // Get all unique stat names from the data
        const statColumns = [
            { key: 'total_teams', label: 'Teams' },
            { key: 'total_games', label: 'Games' },
            { key: 'total_yards', label: 'Total Yards' },
            { key: 'pass_yards', label: 'Pass Yards' },
            { key: 'rush_yards', label: 'Rush Yards' },
            { key: 'touchdowns', label: 'Touchdowns' },
            { key: 'pass_touchdowns', label: 'Pass TDs' },
            { key: 'rush_touchdowns', label: 'Rush TDs' },
            { key: 'turnover_differential', label: 'Turnover Diff' },
            { key: 'pass_attempts', label: 'Pass Attempts' },
            { key: 'pass_completions', label: 'Pass Completions' },
            { key: 'pass_completion_percentage', label: 'Pass Comp %', format: formatPercentage },
            { key: 'rush_attempts', label: 'Rush Attempts' },
            { key: 'rush_successes', label: 'Rush Successes' },
            { key: 'rush_success_percentage', label: 'Rush Success %', format: formatPercentage },
            { key: 'third_down_conversion_percentage', label: '3rd Down %', format: formatPercentage },
            { key: 'fourth_down_conversion_percentage', label: '4th Down %', format: formatPercentage },
            { key: 'red_zone_success_percentage', label: 'Red Zone %', format: formatPercentage },
            { key: 'field_goal_percentage', label: 'FG %', format: formatPercentage },
            { key: 'interceptions_lost', label: 'Int Lost' },
            { key: 'interceptions_forced', label: 'Int Forced' },
            { key: 'fumbles_lost', label: 'Fumbles Lost' },
            { key: 'fumbles_forced', label: 'Fumbles Forced' }
        ];

        return (
            <Box>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                    Conference Statistics - Season {selectedSeason}
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

                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600, overflow: 'auto' }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell 
                                    sx={{ 
                                        fontWeight: 'bold', 
                                        backgroundColor: 'primary.main', 
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                        minWidth: 100
                                    }}
                                    onClick={() => handleSort('conference', 'conference')}
                                >
                                    Conference {conferenceSortField === 'conference' && (conferenceSortDirection === 'asc' ? '↑' : '↓')}
                                </TableCell>
                                {statColumns.map((column) => (
                                    <TableCell
                                        key={column.key}
                                        sx={{ 
                                            fontWeight: 'bold', 
                                            backgroundColor: 'primary.main', 
                                            color: 'white', 
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem',
                                            minWidth: 80
                                        }}
                                        onClick={() => handleSort(column.key, 'conference')}
                                    >
                                        {column.label} {conferenceSortField === column.key && (conferenceSortDirection === 'asc' ? '↑' : '↓')}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedStats.map((stat, index) => (
                                <TableRow key={index} hover>
                                    <TableCell sx={{ fontSize: '0.75rem' }}>
                                        <Chip 
                                            label={formatConference(stat.conference?.name || stat.conference || 'Unknown')} 
                                            color="primary"
                                            variant="outlined"
                                            size="small"
                                        />
                                    </TableCell>
                                    {statColumns.map((column) => (
                                        <TableCell key={column.key} sx={{ textAlign: 'center', fontSize: '0.75rem' }}>
                                            {column.format 
                                                ? column.format(stat[column.key])
                                                : formatStatValue(stat[column.key])
                                            }
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        );
    };

    const renderLeagueStats = () => {
        if (!leagueStats.length) return null;

        const sortedStats = sortData(leagueStats, leagueSortField, leagueSortDirection);

        const statColumns = [
            { key: 'subdivision', label: 'Subdivision' },
            { key: 'total_teams', label: 'Teams' },
            { key: 'total_games', label: 'Games' },
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
            { key: 'third_down_conversion_percentage', label: '3rd Down %', format: formatPercentage },
            { key: 'fourth_down_conversion_percentage', label: '4th Down %', format: formatPercentage },
            { key: 'red_zone_success_percentage', label: 'Red Zone %', format: formatPercentage },
            { key: 'field_goal_percentage', label: 'FG %', format: formatPercentage },
            { key: 'interceptions_lost', label: 'Int Lost' },
            { key: 'interceptions_forced', label: 'Int Forced' },
            { key: 'fumbles_lost', label: 'Fumbles Lost' },
            { key: 'fumbles_forced', label: 'Fumbles Forced' },
            { key: 'turnover_differential', label: 'Turnover Diff' },
            { key: 'average_yards_per_play', label: 'Avg Yds/Play' }
        ];

        return (
            <Box>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                    League Statistics by Season
                </Typography>
                
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600, overflow: 'auto' }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell 
                                    sx={{ 
                                        fontWeight: 'bold', 
                                        backgroundColor: 'primary.main', 
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                        minWidth: 100
                                    }}
                                    onClick={() => handleSort('season_number', 'league')}
                                >
                                    Season {leagueSortField === 'season_number' && (leagueSortDirection === 'asc' ? '↑' : '↓')}
                                </TableCell>
                                {statColumns.map((column) => (
                                    <TableCell
                                        key={column.key}
                                        sx={{ 
                                            fontWeight: 'bold', 
                                            backgroundColor: 'primary.main', 
                                            color: 'white', 
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem',
                                            minWidth: 80
                                        }}
                                        onClick={() => handleSort(column.key, 'league')}
                                    >
                                        {column.label} {leagueSortField === column.key && (leagueSortDirection === 'asc' ? '↑' : '↓')}
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
                                    {statColumns.map((column) => (
                                        <TableCell key={column.key} sx={{ textAlign: 'center', fontSize: '0.75rem' }}>
                                            {column.format 
                                                ? column.format(stat[column.key])
                                                : formatStatValue(stat[column.key])
                                            }
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        );
    };

    const renderPlaybookStats = () => {
        let filteredStats = playbookStats;
        
        if (selectedOffensivePlaybook) {
            filteredStats = filteredStats.filter(stat => 
                stat.offensive_playbook?.name === selectedOffensivePlaybook || 
                stat.offensive_playbook === selectedOffensivePlaybook
            );
        }
        
        if (selectedDefensivePlaybook) {
            filteredStats = filteredStats.filter(stat => 
                stat.defensive_playbook?.name === selectedDefensivePlaybook || 
                stat.defensive_playbook === selectedDefensivePlaybook
            );
        }

        if (!filteredStats.length) return null;

        const sortedStats = sortData(filteredStats, playbookSortField, playbookSortDirection);

        const statColumns = [
            { key: 'season_number', label: 'Season' },
            { key: 'total_teams', label: 'Teams' },
            { key: 'total_games', label: 'Games' },
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
            { key: 'interceptions_forced', label: 'Int Forced' },
            { key: 'fumbles_forced', label: 'Fumbles Forced' },
            { key: 'defensive_touchdowns', label: 'Def TDs' },
            { key: 'field_goal_percentage', label: 'FG %', format: formatPercentage },
            { key: 'average_yards_per_play', label: 'Avg Yds/Play' }
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

                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 600, overflow: 'auto' }}>
                    <Table stickyHeader size="small">
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
                                {statColumns.map((column) => (
                                    <TableCell
                                        key={column.key}
                                        sx={{ 
                                            fontWeight: 'bold', 
                                            backgroundColor: 'primary.main', 
                                            color: 'white', 
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem',
                                            minWidth: 80
                                        }}
                                        onClick={() => handleSort(column.key, 'playbook')}
                                    >
                                        {column.label} {playbookSortField === column.key && (playbookSortDirection === 'asc' ? '↑' : '↓')}
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
                                    {statColumns.map((column) => (
                                        <TableCell key={column.key} sx={{ textAlign: 'center', fontSize: '0.75rem' }}>
                                            {column.format 
                                                ? column.format(stat[column.key])
                                                : formatStatValue(stat[column.key])
                                            }
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
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
