import apiClient from './apiClient';

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
