import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    CircularProgress,
    Alert,
    Paper,
} from '@mui/material';
import { getEloHistory } from '../../api/eloHistoryApi';
import { getAllTeams } from '../../api/teamApi';
import { getAllSeasons } from '../../api/seasonApi';
import { getCurrentSeason } from '../../api/seasonApi';
import EloHistoryChart from '../../components/stats/EloHistoryChart';
import EloHistoryFilters from '../../components/stats/EloHistoryFilters';

/**
 * ELO History Page
 * Displays ELO rating history for teams with interactive charts
 */
const EloHistory = () => {
    useEffect(() => { document.title = 'FCFB | ELO History'; }, []);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [eloData, setEloData] = useState([]);
    
    // Filter states
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [selectedSeason, setSelectedSeason] = useState('all-time');
    const [viewMode, setViewMode] = useState('all-time');
    const [showAllTeams, setShowAllTeams] = useState(true); // Default to showing all teams
    
    // Data states
    const [teams, setTeams] = useState([]);
    const [seasons, setSeasons] = useState([]);

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
                
                // Set default season to current season
                if (currentSeasonData && seasonNumbers.includes(currentSeasonData)) {
                    setSelectedSeason(currentSeasonData);
                }
            } catch (err) {
                console.error('Error initializing ELO history page:', err);
                setError('Failed to load initial data');
            } finally {
                setLoading(false);
            }
        };
        
        initData();
    }, []);

    // Fetch ELO history
    const fetchEloHistory = async () => {
        if (!showAllTeams && !selectedTeam) {
            setError('Please select a team or enable "Show All Teams"');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const season = viewMode === 'all-time' || selectedSeason === 'all-time' 
                ? null 
                : parseInt(selectedSeason);
            
            const teamParam = showAllTeams ? 'all' : selectedTeam.name;
            const data = await getEloHistory(teamParam, season);
            setEloData(data);
        } catch (err) {
            console.error('Error fetching ELO history:', err);
            setError(err.message || 'Failed to fetch ELO history');
            setEloData([]);
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch when team/season changes (after initial load)
    useEffect(() => {
        if ((showAllTeams || selectedTeam) && !loading && teams.length > 0) {
            fetchEloHistory();
        }
    }, [selectedTeam, selectedSeason, viewMode, showAllTeams, teams.length]);

    const handleApplyFilters = () => {
        fetchEloHistory();
    };

    return (
        <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2 }, py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{ fontWeight: 'bold', color: 'primary.main' }}
                >
                    ELO History
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                    Track ELO rating changes for teams over time. View all teams or select a specific team to see their ELO progression.
                </Typography>
            </Box>

            {/* Filters */}
            <EloHistoryFilters
                selectedTeam={selectedTeam}
                setSelectedTeam={setSelectedTeam}
                selectedSeason={selectedSeason}
                setSelectedSeason={setSelectedSeason}
                viewMode={viewMode}
                setViewMode={setViewMode}
                showAllTeams={showAllTeams}
                setShowAllTeams={setShowAllTeams}
                onApplyFilters={handleApplyFilters}
                teams={teams}
                seasons={seasons}
                loading={loading}
            />

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

            {/* Chart */}
            {!loading && !error && eloData.length > 0 && (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        {showAllTeams ? 'All Teams' : selectedTeam?.name} - ELO History
                        {viewMode === 'season' && selectedSeason !== 'all-time' && ` (Season ${selectedSeason})`}
                        {viewMode === 'all-time' && ' (All Time)'}
                    </Typography>
                    <EloHistoryChart 
                        data={eloData} 
                        teams={teams}
                        showAllTeams={showAllTeams}
                    />
                </Paper>
            )}

            {/* No Data State */}
            {!loading && !error && eloData.length === 0 && (showAllTeams || selectedTeam) && (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        No ELO history data available
                        {!showAllTeams && selectedTeam && ` for ${selectedTeam.name}`}
                        {viewMode === 'season' && selectedSeason !== 'all-time' && ` in Season ${selectedSeason}`}
                    </Typography>
                </Paper>
            )}

            {/* Initial State */}
            {!loading && !error && !showAllTeams && !selectedTeam && (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        Please select a team or enable "Show All Teams" to view ELO history
                    </Typography>
                </Paper>
            )}
        </Container>
    );
};

export default EloHistory;
