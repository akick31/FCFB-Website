import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, CircularProgress, Alert } from '@mui/material';
import ConferenceDropdown from '../../components/dropdown/ConferenceDropdown';
import StandingsTable from '../../components/team/StandingsTable';
import { getAllTeams } from '../../api/teamApi';
import { formatTeamStats } from '../../utils/teamDataUtils';

const Standings = () => {
    const [teams, setTeams] = useState([]);
    const [filteredTeams, setFilteredTeams] = useState([]);
    const [selectedConference, setSelectedConference] = useState('ACC');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTeams();
    }, []);

    useEffect(() => {
        filterTeamsByConference();
    }, [teams, selectedConference]);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            const teamsData = await getAllTeams();
            
            // Add formatted stats to each team
            const teamsWithStats = teamsData.map(team => ({
                ...team,
                stats: formatTeamStats(team)
            }));
            
            setTeams(teamsWithStats);
        } catch (error) {
            console.error('Error fetching teams:', error);
            setError('Failed to load standings data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filterTeamsByConference = () => {
        const filtered = teams.filter(team => team.conference === selectedConference);
        setFilteredTeams(filtered);
    };

    const handleConferenceChange = (conference) => {
        setSelectedConference(conference);
    };

    const sortTeamsByStandings = (teamsToSort) => {
        return teamsToSort.sort((a, b) => {
            // First sort by conference win percentage
            const aConfWins = a.current_conference_wins || 0;
            const aConfLosses = a.current_conference_losses || 0;
            const bConfWins = b.current_conference_wins || 0;
            const bConfLosses = b.current_conference_losses || 0;
            
            const aConfWinPct = aConfWins + aConfLosses > 0 ? aConfWins / (aConfWins + aConfLosses) : 0;
            const bConfWinPct = bConfWins + bConfLosses > 0 ? bConfWins / (bConfWins + bConfLosses) : 0;
            
            if (bConfWinPct !== aConfWinPct) {
                return bConfWinPct - aConfWinPct;
            }
            
            // If win percentage is tied, sort alphabetically by team name
            return a.name.localeCompare(b.name);
        });
    };

    const sortedTeams = sortTeamsByStandings(filteredTeams);

    if (loading) {
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
                        Conference Standings
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            color: 'text.secondary',
                            mb: 3
                        }}
                    >
                        Current conference standings based on conference win/loss records
                    </Typography>
                </Box>

                {/* Conference Filter */}
                <Box sx={{ 
                    mb: 4,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <ConferenceDropdown
                        value={selectedConference}
                        onChange={handleConferenceChange}
                        sx={{ minWidth: 200 }}
                    />
                </Box>

                {/* Standings Table */}
                {sortedTeams.length > 0 ? (
                    <StandingsTable 
                        teams={sortedTeams}
                        conference={selectedConference}
                    />
                ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" color="text.secondary">
                            No teams found for the selected conference.
                        </Typography>
                    </Box>
                )}
            </Box>
        </Container>
    );
};

export default Standings; 