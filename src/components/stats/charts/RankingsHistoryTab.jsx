import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Paper,
} from '@mui/material';
import { getAllTeams } from '../../../api/teamApi';
import { getAllSeasons } from '../../../api/seasonApi';
import { getCurrentSeason } from '../../../api/seasonApi';
import { getRankingsHistory } from '../../../api/rankingsHistoryApi.jsx';
import RankingsHistoryChart from '../RankingsHistoryChart';
import RankingsHistoryFilters from '../RankingsHistoryFilters';

/**
 * Rankings History Tab Component
 * Displays coaches poll ranking history for teams
 */
const RankingsHistoryTab = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rankingsData, setRankingsData] = useState([]);
    
    // Filter states
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [selectedSeason, setSelectedSeason] = useState('all-time');
    const [viewMode, setViewMode] = useState('all-time');
    const [showAllTeams, setShowAllTeams] = useState(true);
    
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
                
                if (currentSeasonData && seasonNumbers.includes(currentSeasonData)) {
                    setSelectedSeason(currentSeasonData);
                }
            } catch (err) {
                console.error('Error initializing rankings history:', err);
                setError('Failed to load initial data');
            } finally {
                setLoading(false);
            }
        };
        
        initData();
    }, []);

    // Fetch rankings history
    const fetchRankingsHistory = async () => {
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
            const data = await getRankingsHistory(teamParam, season);
            setRankingsData(data);
        } catch (err) {
            console.error('Error fetching rankings history:', err);
            setError(err.message || 'Failed to fetch rankings history');
            setRankingsData([]);
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch when team/season changes (after initial load)
    useEffect(() => {
        if ((showAllTeams || selectedTeam) && !loading && teams.length > 0) {
            fetchRankingsHistory();
        }
    }, [selectedTeam, selectedSeason, viewMode, showAllTeams, teams.length]);

    const handleApplyFilters = () => {
        fetchRankingsHistory();
    };

    return (
        <Box>
            {/* Filters */}
            <RankingsHistoryFilters
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
            {!loading && !error && rankingsData.length > 0 && (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        {showAllTeams ? 'All Teams' : selectedTeam?.name} - Rankings History
                        {viewMode === 'season' && selectedSeason !== 'all-time' && ` (Season ${selectedSeason})`}
                        {viewMode === 'all-time' && ' (All Time)'}
                    </Typography>
                    <RankingsHistoryChart 
                        data={rankingsData} 
                        teams={showAllTeams ? teams : (selectedTeam ? [selectedTeam] : [])}
                        showAllTeams={showAllTeams}
                    />
                </Paper>
            )}

            {/* No Data State */}
            {!loading && !error && rankingsData.length === 0 && (showAllTeams || selectedTeam) && (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        No rankings history data available
                        {!showAllTeams && selectedTeam && ` for ${selectedTeam.name}`}
                        {viewMode === 'season' && selectedSeason !== 'all-time' && ` in Season ${selectedSeason}`}
                    </Typography>
                </Paper>
            )}

            {/* Initial State */}
            {!loading && !error && !showAllTeams && !selectedTeam && (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        Please select a team or enable "Show All Teams" to view rankings history
                    </Typography>
                </Paper>
            )}
        </Box>
    );
};

export default RankingsHistoryTab;
