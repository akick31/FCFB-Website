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
    Avatar,
    Chip,
    CircularProgress,
    Alert,
    Button,
    Switch,
    FormControlLabel
} from '@mui/material';
import { getLeaderboard } from '../../api/seasonStatsApi';
import { getAllTeams } from '../../api/teamApi';
import { getCurrentSeason } from '../../api/seasonApi';
import { conferences } from '../../components/constants/conferences';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [allStatsLeaderboard, setAllStatsLeaderboard] = useState({});
    const [teams, setTeams] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Filter states
    const [selectedSeason, setSelectedSeason] = useState(11);
    const [selectedConference, setSelectedConference] = useState('');
    const [selectedStat, setSelectedStat] = useState('');
    const [limit, setLimit] = useState(10);
    const [ascending, setAscending] = useState(false);
    const [showAllStats, setShowAllStats] = useState(true);

    // Available stats for leaderboard
    const availableStats = [
        { value: 'wins', label: 'Wins' },
        { value: 'losses', label: 'Losses' },
        { value: 'total_yards', label: 'Total Yards' },
        { value: 'pass_yards', label: 'Passing Yards' },
        { value: 'rush_yards', label: 'Rushing Yards' },
        { value: 'touchdowns', label: 'Total Touchdowns' },
        { value: 'pass_touchdowns', label: 'Passing Touchdowns' },
        { value: 'rush_touchdowns', label: 'Rushing Touchdowns' },
        { value: 'interceptions_lost', label: 'Interceptions Lost' },
        { value: 'fumbles_lost', label: 'Fumbles Lost' },
        { value: 'turnover_differential', label: 'Turnover Differential' },
        { value: 'points_for', label: 'Points For' },
        { value: 'points_against', label: 'Points Against' },
        { value: 'point_differential', label: 'Point Differential' }
    ];

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const [teamsData, currentSeason] = await Promise.all([
                    getAllTeams(),
                    getCurrentSeason()
                ]);
                setTeams(teamsData);
                
                // Create seasons array (only seasons 10 and 11)
                const seasonsArray = [11, 10];
                setSeasons(seasonsArray);
                
                // Set default season to the current season, but ensure it's 11 if current is 10
                if (currentSeason && currentSeason === 11) {
                    setSelectedSeason(11);
                } else {
                    // Default to Season 11 (most recent)
                    setSelectedSeason(11);
                }
                
                // Load all stats by default
                await fetchLeaderboard();
            } catch (err) {
                setError('Failed to load initial data');
                console.error('Error fetching initial data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const fetchLeaderboard = async () => {
        if (showAllStats) {
            // Fetch all stats
            try {
                setLoading(true);
                setError(null);
                const allStatsData = {};
                
                for (const stat of availableStats) {
                    const data = await getLeaderboard(
                        stat.value,
                        selectedSeason || null,
                        null, // subdivision parameter (not used in this component)
                        selectedConference || null,
                        limit,
                        ascending
                    );
                    allStatsData[stat.value] = data;
                }
                
                setAllStatsLeaderboard(allStatsData);
            } catch (err) {
                setError('Failed to fetch leaderboard data');
                console.error('Error fetching leaderboard:', err);
            } finally {
                setLoading(false);
            }
        } else {
            // Fetch single stat
            if (!selectedStat) {
                setError('Please select a stat to view leaderboard');
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const data = await getLeaderboard(
                    selectedStat,
                    selectedSeason || null,
                    null, // subdivision parameter (not used in this component)
                    selectedConference || null,
                    limit,
                    ascending
                );
                setLeaderboard(data);
            } catch (err) {
                setError('Failed to fetch leaderboard data');
                console.error('Error fetching leaderboard:', err);
            } finally {
                setLoading(false);
            }
        }
    };

    const formatStatValue = (statName, value) => {
        if (value === null || value === undefined) return 'N/A';
        
        // Format based on stat type
        switch (statName) {
            case 'total_yards':
            case 'pass_yards':
            case 'rush_yards':
            case 'points_for':
            case 'points_against':
            case 'point_differential':
                return value.toLocaleString();
            case 'turnover_differential':
                return value > 0 ? `+${value}` : value.toString();
            default:
                return value.toString();
        }
    };

    const getTeamInfo = (teamName) => {
        return teams.find(team => team.name === teamName);
    };

    const handleSearch = () => {
        fetchLeaderboard();
    };

    const handleClear = () => {
        setSelectedSeason(11);
        setSelectedConference('');
        setSelectedStat('');
        setLimit(10);
        setAscending(false);
        setShowAllStats(true);
        setLeaderboard([]);
        setAllStatsLeaderboard({});
        setError(null);
    };

    return (
        <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2 } }}>
            <Box sx={{ py: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Season Stats Leaderboard
                </Typography>
                
                <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                    View leaderboards for various season statistics across teams and conferences.
                </Typography>

                {/* Filters */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Filters
                        </Typography>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Season</InputLabel>
                                    <Select
                                        value={selectedSeason}
                                        label="Season"
                                        onChange={(e) => setSelectedSeason(e.target.value)}
                                    >
                                        {seasons.map((season) => (
                                            <MenuItem key={season} value={season}>
                                                Season {season}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Conference</InputLabel>
                                    <Select
                                        value={selectedConference}
                                        label="Conference"
                                        onChange={(e) => setSelectedConference(e.target.value)}
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
                            
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Stat</InputLabel>
                                    <Select
                                        value={selectedStat}
                                        label="Stat"
                                        onChange={(e) => setSelectedStat(e.target.value)}
                                    >
                                        {availableStats.map((stat) => (
                                            <MenuItem key={stat.value} value={stat.value}>
                                                {stat.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Limit</InputLabel>
                                    <Select
                                        value={limit}
                                        label="Limit"
                                        onChange={(e) => setLimit(e.target.value)}
                                    >
                                        <MenuItem value={5}>Top 5</MenuItem>
                                        <MenuItem value={10}>Top 10</MenuItem>
                                        <MenuItem value={25}>Top 25</MenuItem>
                                        <MenuItem value={50}>Top 50</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Order</InputLabel>
                                    <Select
                                        value={ascending}
                                        label="Order"
                                        onChange={(e) => setAscending(e.target.value)}
                                    >
                                        <MenuItem value={false}>Descending</MenuItem>
                                        <MenuItem value={true}>Ascending</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={showAllStats}
                                            onChange={(e) => setShowAllStats(e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label="Show All Stats"
                                    sx={{ color: 'primary.main' }}
                                />
                            </Grid>
                            
                            <Grid item xs={12} sm={6} md={2}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button 
                                        variant="contained" 
                                        onClick={handleSearch}
                                        disabled={loading || (!showAllStats && !selectedStat)}
                                        size="small"
                                    >
                                        Search
                                    </Button>
                                    <Button 
                                        variant="outlined" 
                                        onClick={handleClear}
                                        size="small"
                                    >
                                        Clear
                                    </Button>
                                </Box>
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

                {/* All Stats Leaderboard Results */}
                {!loading && showAllStats && Object.keys(allStatsLeaderboard).length > 0 && (
                    <Box>
                        {Object.entries(allStatsLeaderboard).map(([statKey, statData]) => {
                            const statInfo = availableStats.find(stat => stat.value === statKey);
                            return (
                                <Card key={statKey} sx={{ mb: 3 }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {statInfo?.label} Leaderboard
                                            {selectedSeason && ` - Season ${selectedSeason}`}
                                            {selectedConference && ` - ${selectedConference}`}
                                        </Typography>
                                        
                                        <TableContainer component={Paper} variant="outlined">
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>Rank</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>Team</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>Conference</TableCell>
                                                        <TableCell sx={{ fontWeight: 'bold' }}>Value</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {statData.slice(0, 5).map((entry, index) => {
                                                        const team = getTeamInfo(entry.team);
                                                        return (
                                                            <TableRow key={index} hover>
                                                                <TableCell>
                                                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                                        #{index + 1}
                                                                    </Typography>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                        <Avatar
                                                                            src={team?.logo}
                                                                            sx={{ width: 24, height: 24, mr: 1 }}
                                                                        >
                                                                            {team?.abbreviation?.charAt(0) || 'T'}
                                                                        </Avatar>
                                                                        <Box>
                                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                                {entry.team}
                                                                            </Typography>
                                                                        </Box>
                                                                    </Box>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Chip 
                                                                        label={entry.conference || entry.subdivision?.name || 'Independent'} 
                                                                        size="small"
                                                                        color="primary"
                                                                        variant="outlined"
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                                        {formatStatValue(statKey, entry[statKey])}
                                                                    </Typography>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Box>
                )}

                {/* Single Stat Leaderboard Results */}
                {!loading && !showAllStats && leaderboard.length > 0 && (
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                {availableStats.find(stat => stat.value === selectedStat)?.label} Leaderboard
                                {selectedSeason && ` - Season ${selectedSeason}`}
                                {selectedConference && ` - ${selectedConference}`}
                            </Typography>
                            
                            <TableContainer component={Paper} variant="outlined">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Rank</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Team</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Conference</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Season</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Value</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {leaderboard.map((entry, index) => {
                                            const team = getTeamInfo(entry.team);
                                            return (
                                                <TableRow key={index} hover>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                            #{index + 1}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <Avatar
                                                                src={team?.logo}
                                                                sx={{ width: 32, height: 32, mr: 2 }}
                                                            >
                                                                {team?.abbreviation?.charAt(0) || 'T'}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                    {entry.team}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {team?.abbreviation || 'N/A'}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={entry.conference || entry.subdivision?.name || 'Independent'} 
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            Season {entry.seasonNumber}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                            {formatStatValue(selectedStat, entry[selectedStat])}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                )}

                {/* No Results */}
                {!loading && !error && selectedStat && leaderboard.length === 0 && (
                    <Card>
                        <CardContent>
                            <Typography variant="body1" sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                                No leaderboard data found for the selected criteria.
                            </Typography>
                        </CardContent>
                    </Card>
                )}
            </Box>
        </Container>
    );
};

export default Leaderboard;
