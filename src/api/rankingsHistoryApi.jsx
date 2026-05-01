import apiClient from './apiClient';

/**
 * Get rankings history for teams
 * Fetches games with rankings (home_team_rank and away_team_rank)
 * @param {string} team - Team name or 'all' for all teams
 * @param {number|null} season - Season number or null for all-time
 * @returns {Promise<Array>} Array of games with ranking data
 */
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
