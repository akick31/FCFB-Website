import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Container,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    Avatar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Autocomplete,
    TextField,
    Grid,
    Card,
    CardContent
} from '@mui/material';
import { 
    getFilteredRecords,
} from '../../api/recordsApi';
import { getAllTeams } from '../../api/teamApi';

const Records = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Data states
    const [singleGameRecords, setSingleGameRecords] = useState([]);
    const [singleSeasonRecords, setSingleSeasonRecords] = useState([]);
    const [teams, setTeams] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [availableRecords, setAvailableRecords] = useState([]);
    
    // Filter states
    const [selectedRecord, setSelectedRecord] = useState(null);

    const formatStatName = (statName) => {
        if (!statName) return 'Unknown Stat';
        return statName
            .replace(/_/g, ' ')  // Replace underscores with spaces
            .split(' ')  // Split into words
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())  // Properly capitalize each word
            .join(' ');  // Join back with spaces
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [gameResponse, seasonResponse, teamsData] = await Promise.all([
                getFilteredRecords(null, null, 'SINGLE_GAME', null, 0, 1000), // Get all single game records
                getFilteredRecords(null, null, 'SINGLE_SEASON', null, 0, 1000), // Get all single season records
                getAllTeams()
            ]);
            
            // Extract content from paginated responses
            setSingleGameRecords(gameResponse.content || []);
            setSingleSeasonRecords(seasonResponse.content || []);
            setTeams(teamsData);
            
            // Extract unique seasons from records
            const allSeasons = [...new Set([...(gameResponse.content || []), ...(seasonResponse.content || [])].map(record => record.seasonNumber))].sort((a, b) => b - a);
            setSeasons(allSeasons);
            
            // Extract unique record names and format them
            const allRecordNames = [...new Set([...(gameResponse.content || []), ...(seasonResponse.content || [])].map(record => record.record_name))];
            const formattedRecords = allRecordNames.map(recordName => ({
                value: recordName,
                label: formatStatName(recordName)
            })).sort((a, b) => a.label.localeCompare(b.label));
            setAvailableRecords(formattedRecords);
        } catch (error) {
            console.error('Error fetching initial data:', error);
            setError('Failed to load records data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        setError('');
    };

    const handleRecordChange = (event, newValue) => {
        setSelectedRecord(newValue);
    };



    const renderSingleGameRecords = () => {
        if (!singleGameRecords.length) return null;

        // Filter records based on selected record
        const filteredRecords = selectedRecord 
            ? singleGameRecords.filter(record => record.record_name === selectedRecord.value)
            : singleGameRecords;

        const columns = [
            { id: 'stat', label: 'Statistic', width: 200 },
            { id: 'value', label: 'Record', width: 100 },
            { id: 'team', label: 'Team', width: 150 },
            { id: 'season', label: 'Season', width: 80 },
            { id: 'week', label: 'Week', width: 80 },
            { id: 'game', label: 'Game', width: 200 },
            { id: 'coach', label: 'Coach', width: 150 }
        ];

        return (
            <Box>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                    Single Game Records
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        sx={{
                                            backgroundColor: 'primary.main',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            minWidth: column.width
                                        }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredRecords.map((record, index) => (
                                <TableRow key={index} hover>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {formatStatName(record.record_name)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                            {record.record_value}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar
                                                src={getTeamInfo(record.record_team)?.logo}
                                                sx={{ width: 24, height: 24, mr: 1 }}
                                            >
                                                {getTeamInfo(record.record_team)?.abbreviation?.charAt(0) || 'T'}
                                            </Avatar>
                                            <Typography variant="body2">
                                                {record.record_team}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{record.season_number}</TableCell>
                                    <TableCell>{record.week || '-'}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {record.home_team} vs {record.away_team}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{record.coach || '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        );
    };

    const renderSingleSeasonRecords = () => {
        if (!singleSeasonRecords.length) return null;

        // Filter records based on selected record
        const filteredRecords = selectedRecord 
            ? singleSeasonRecords.filter(record => record.record_name === selectedRecord.value)
            : singleSeasonRecords;

        const columns = [
            { id: 'stat', label: 'Statistic', width: 200 },
            { id: 'value', label: 'Record', width: 100 },
            { id: 'team', label: 'Team', width: 150 },
            { id: 'season', label: 'Season', width: 80 },
            { id: 'coach', label: 'Coach', width: 150 }
        ];

        return (
            <Box>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                    Single Season Records
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        sx={{
                                            backgroundColor: 'primary.main',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            minWidth: column.width
                                        }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredRecords.map((record, index) => (
                                <TableRow key={index} hover>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {formatStatName(record.record_name)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                            {record.record_value}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar
                                                src={getTeamInfo(record.record_team)?.logo}
                                                sx={{ width: 24, height: 24, mr: 1 }}
                                            >
                                                {getTeamInfo(record.record_team)?.abbreviation?.charAt(0) || 'T'}
                                            </Avatar>
                                            <Typography variant="body2">
                                                {record.record_team}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{record.season_number}</TableCell>
                                    <TableCell>{record.coach || '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        );
    };

    const getTeamInfo = (teamName) => {
        return teams.find(team => team.name === teamName);
    };

    if (loading && !singleGameRecords.length && !singleSeasonRecords.length) {
        return (
            <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <CircularProgress size={60} />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2 } }}>
                <Box sx={{ mt: 4 }}>
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
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
                        Records
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: 'text.secondary',
                            mb: 3
                        }}
                    >
                        All-time records across games, seasons, and teams
                    </Typography>
                </Box>

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                    <Tabs value={activeTab} onChange={handleTabChange}>
                        <Tab label="Single Game Records" />
                        <Tab label="Single Season Records" />
                    </Tabs>
                </Box>

                {/* Record Filter */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Filter Records
                        </Typography>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={6}>
                                <Autocomplete
                                    options={availableRecords}
                                    getOptionLabel={(option) => option.label}
                                    value={selectedRecord}
                                    onChange={handleRecordChange}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Search Records"
                                            placeholder="Type to search records..."
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <Box component="li" {...props}>
                                            <Typography variant="body1">
                                                {option.label}
                                            </Typography>
                                        </Box>
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="body2" color="text.secondary">
                                    {selectedRecord 
                                        ? `Showing records for: ${selectedRecord.label}`
                                        : 'Showing all records'
                                    }
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Content */}
                {activeTab === 0 && renderSingleGameRecords()}
                {activeTab === 1 && renderSingleSeasonRecords()}
            </Box>
        </Container>
    );
};

export default Records;

