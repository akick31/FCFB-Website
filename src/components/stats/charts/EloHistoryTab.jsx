import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Paper,
} from '@mui/material';
import { getEloHistory } from '../../../api/eloHistoryApi.jsx';
import { getAllTeams } from '../../../api/teamApi';
import { getAllSeasons } from '../../../api/seasonApi';
import { getCurrentSeasonOrLatest } from '../../../api/seasonApi';
import { isRealTeam } from '../../../utils/teamDataUtils';
import EloHistoryChart from '../EloHistoryChart';
import EloHistoryFilters from '../EloHistoryFilters';

const EloHistoryTab = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [eloData, setEloData] = useState([]);

    const [selectedTeam, setSelectedTeam] = useState(null);
    const [selectedSeason, setSelectedSeason] = useState('all-time');
    const [viewMode, setViewMode] = useState('all-time');
    const [showAllTeams, setShowAllTeams] = useState(true);

    const [teams, setTeams] = useState([]);
    const [seasons, setSeasons] = useState([]);

    useEffect(() => {
        const initData = async () => {
            try {
                setLoading(true);
                const [teamsData, seasonsData, currentSeasonData] = await Promise.all([
                    getAllTeams(),
                    getAllSeasons(),
                    getCurrentSeasonOrLatest(),
                ]);
                
                setTeams(teamsData.filter(t => t.active && isRealTeam(t)).sort((a, b) => (a.name || '').localeCompare(b.name || '')));
                const seasonNumbers = seasonsData.map(s => s.season_number || s.seasonNumber).sort((a, b) => b - a);
                setSeasons(seasonNumbers);

                if (currentSeasonData && seasonNumbers.includes(currentSeasonData)) {
                    setSelectedSeason(currentSeasonData);
                }
            } catch (err) {
                console.error('Error initializing ELO history:', err);
                setError('Failed to load initial data');
            } finally {
                setLoading(false);
            }
        };
        
        initData();
    }, []);

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
            const eloHistory = await getEloHistory(teamParam, season);
            setEloData(eloHistory);
        } catch (err) {
            console.error('Error fetching ELO history:', err);
            setError(err.message || 'Failed to fetch ELO history');
            setEloData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if ((showAllTeams || selectedTeam) && !loading && teams.length > 0) {
            fetchEloHistory();
        }
    }, [selectedTeam, selectedSeason, viewMode, showAllTeams, teams.length]);

    const handleApplyFilters = () => {
        fetchEloHistory();
    };

    return (
        <Box>
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

            {!loading && !error && eloData.length === 0 && (showAllTeams || selectedTeam) && (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        No ELO history data available
                        {!showAllTeams && selectedTeam && ` for ${selectedTeam.name}`}
                        {viewMode === 'season' && selectedSeason !== 'all-time' && ` in Season ${selectedSeason}`}
                    </Typography>
                </Paper>
            )}

            {!loading && !error && !showAllTeams && !selectedTeam && (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        Please select a team or enable "Show All Teams" to view ELO history
                    </Typography>
                </Paper>
            )}
        </Box>
    );
};

export default EloHistoryTab;
