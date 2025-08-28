import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, CircularProgress, Alert, FormControl, Select, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RankingsTable from '../../components/team/RankingsTable';
import { getAllTeams } from '../../api/teamApi';

const Rankings = () => {
    const theme = useTheme();
    const [teams, setTeams] = useState([]);
    const [filteredTeams, setFilteredTeams] = useState([]);
    const [selectedRanking, setSelectedRanking] = useState('');
    const [availableRankings, setAvailableRankings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTeams();
    }, []);

    useEffect(() => {
        if (teams.length > 0) {
            determineAvailableRankings();
        }
    }, [teams]);

    useEffect(() => {
        if (availableRankings.length > 0 && !selectedRanking) {
            setSelectedRanking(availableRankings[0]);
        }
    }, [availableRankings, selectedRanking]);

    useEffect(() => {
        filterTeamsByRanking();
    }, [teams, selectedRanking]);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            const teamsData = await getAllTeams();
            setTeams(teamsData);
        } catch (error) {
            console.error('Error fetching teams:', error);
            setError('Failed to load rankings data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const determineAvailableRankings = () => {
        const rankings = [];
        
        // Check if any teams have coaches poll rankings
        const hasCoachesPoll = teams.some(team => team.coaches_poll_ranking !== null && team.coaches_poll_ranking !== undefined);
        if (hasCoachesPoll) {
            rankings.push('COACHES_POLL');
        }
        
        // Check if any teams have playoff committee rankings
        const hasPlayoffRankings = teams.some(team => team.playoff_committee_ranking !== null && team.playoff_committee_ranking !== undefined);
        if (hasPlayoffRankings) {
            rankings.push('PLAYOFF_RANKINGS');
        }
        
        setAvailableRankings(rankings);
    };

    const filterTeamsByRanking = () => {
        if (!selectedRanking) return;

        let filtered = [];
        
        if (selectedRanking === 'COACHES_POLL') {
            filtered = teams
                .filter(team => team.coaches_poll_ranking !== null && team.coaches_poll_ranking !== undefined)
                .sort((a, b) => a.coaches_poll_ranking - b.coaches_poll_ranking)
                .slice(0, 25);
        } else if (selectedRanking === 'PLAYOFF_RANKINGS') {
            filtered = teams
                .filter(team => team.playoff_committee_ranking !== null && team.playoff_committee_ranking !== undefined)
                .sort((a, b) => a.playoff_committee_ranking - b.playoff_committee_ranking)
                .slice(0, 25);
        }
        
        setFilteredTeams(filtered);
    };

    const handleRankingChange = (ranking) => {
        setSelectedRanking(ranking);
    };

    const getRankingDisplayName = (ranking) => {
        switch (ranking) {
            case 'COACHES_POLL':
                return 'Coaches Poll';
            case 'PLAYOFF_RANKINGS':
                return 'Playoff Rankings';
            default:
                return '';
        }
    };

    if (loading) {
        return (
            <Container maxWidth="xl">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <CircularProgress size={60} />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="xl">
                <Box sx={{ mt: 4 }}>
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                </Box>
            </Container>
        );
    }

    if (availableRankings.length === 0) {
        return (
            <Container maxWidth="xl">
                <Box sx={{ 
                    pt: { xs: 8, md: 10 },
                    pb: { xs: 4, md: 6 }
                }}>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h4" color="text.secondary">
                            No rankings available at this time.
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                            Check back later for updated rankings.
                        </Typography>
                    </Box>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl">
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
                        College Football Rankings
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: 'text.secondary',
                            mb: 3
                        }}
                    >
                        Top 25 teams in the latest rankings
                    </Typography>
                </Box>

                {/* Rankings Type Selector */}
                <Box sx={{ 
                    mb: 4,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 2
                }}>
                    <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                        Ranking Type:
                    </Typography>
                    <FormControl sx={{ minWidth: 200 }}>
                        <Select
                            value={selectedRanking}
                            onChange={(e) => handleRankingChange(e.target.value)}
                            displayEmpty
                        >
                            {availableRankings.map((ranking) => (
                                <MenuItem key={ranking} value={ranking}>
                                    {getRankingDisplayName(ranking)}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {/* Rankings Table */}
                {filteredTeams.length > 0 ? (
                    <RankingsTable 
                        teams={filteredTeams}
                        rankingType={selectedRanking}
                    />
                ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" color="text.secondary">
                            No teams found for the selected ranking.
                        </Typography>
                    </Box>
                )}
            </Box>
        </Container>
    );
};

export default Rankings; 