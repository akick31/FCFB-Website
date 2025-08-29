import { useState, useEffect } from 'react';
import { getTeamByName } from '../../../../api/teamApi';

export const useTeamData = (games) => {
    const [teamsData, setTeamsData] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchTeamData = async () => {
            if (!games || games.length === 0) return;
            
            setLoading(true);
            
            const teamNames = new Set();
            games.forEach(game => {
                if (game.awayTeam || game.away_team) teamNames.add(game.awayTeam || game.away_team);
                if (game.homeTeam || game.home_team) teamNames.add(game.homeTeam || game.home_team);
            });

            // Only fetch teams we don't already have
            const teamsToFetch = Array.from(teamNames).filter(teamName => !teamsData[teamName]);
            
            if (teamsToFetch.length === 0) {
                setLoading(false);
                return;
            }

            const teams = {};
            try {
                // Fetch all teams in parallel for better performance
                const teamPromises = teamsToFetch.map(async (teamName) => {
                    try {
                        const response = await getTeamByName(teamName);
                        return { teamName, data: response };
                    } catch (err) {
                        console.warn(`Failed to fetch team data for ${teamName}:`, err);
                        return { teamName, data: null };
                    }
                });

                const results = await Promise.all(teamPromises);
                
                results.forEach(({ teamName, data }) => {
                    if (data) {
                        teams[teamName] = data;
                    }
                });

                if (Object.keys(teams).length > 0) {
                    setTeamsData(prev => ({ ...prev, ...teams }));
                }
            } catch (err) {
                console.error('Error fetching team data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTeamData();
    }, [games, teamsData]);

    return { teamsData, loading };
}; 