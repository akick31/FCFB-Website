import apiClient from './apiClient';

/**
 * Get ELO history for a team
 * @param {string} team - Team name
 * @param {number|null} season - Season number (optional, null for all-time)
 * @returns {Promise<Array>} Array of ELO history entries
 */
export const getEloHistory = async (team, season = null) => {
    try {
        const params = { team };
        if (season !== null && season !== undefined) {
            params.season = season;
        }
        
        const response = await apiClient.get('/game-stats/elo-history', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch ELO history:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch ELO history');
        }
        throw new Error('An unexpected error occurred while fetching ELO history');
    }
};
