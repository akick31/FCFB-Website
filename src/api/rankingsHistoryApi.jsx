import apiClient from './apiClient';

// Fetches games with rankings (home_team_rank and away_team_rank)
export const getRankingsHistory = async (team, season = null) => {
    try {
        const params = { team, ...(season && { season }) };
        const response = await apiClient.get('/game/rankings-history', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch rankings history:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch rankings history');
        }
        throw new Error('An unexpected error occurred while fetching rankings history');
    }
};
