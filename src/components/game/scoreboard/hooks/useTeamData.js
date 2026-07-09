import { useState, useEffect, useRef } from 'react';
import { getTeamByName } from '../../../../api/teamApi';

export const useTeamData = (games) => {
    const [teamsData, setTeamsData] = useState({});
    const [loading, setLoading] = useState(false);
    const teamsDataRef = useRef(teamsData);
    teamsDataRef.current = teamsData;

    useEffect(() => {
        const fetchTeamData = async () => {
            if (!games || games.length === 0) return;

            const teamNames = new Set();
            games.forEach(game => {
                if (game.awayTeam || game.away_team) teamNames.add(game.awayTeam || game.away_team);
                if (game.homeTeam || game.home_team) teamNames.add(game.homeTeam || game.home_team);
            });

            const teamsToFetch = Array.from(teamNames).filter(teamName => !(teamName in teamsDataRef.current));

            if (teamsToFetch.length === 0) return;

            setLoading(true);
            const teams = {};
            try {
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
                    teams[teamName] = data;
                });

                setTeamsData(prev => ({ ...prev, ...teams }));
            } catch (err) {
                console.error('Error fetching team data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTeamData();
    }, [games]);

    return { teamsData, loading };
};