import apiClient from './apiClient';

export const getFilteredLeagueStats = async (subdivision = null, season = null, page = 0, size = 20, scope = 'regular') => {
    try {
        const params = { page, size };
        if (subdivision) params.subdivision = subdivision;
        if (season) params.season = season;

        const endpoint = scope === 'postseason' ? '/league-stats/postseason' : '/league-stats';
        const response = await apiClient.get(endpoint, { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch filtered league stats:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch filtered league stats');
        }
        throw new Error('An unexpected error occurred while fetching filtered league stats');
    }
};

export const generateAllLeagueStats = async () => {
    try {
        const response = await apiClient.post('/league-stats/generate/all');
        return response.data;
    } catch (error) {
        console.error('Failed to generate all league stats:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to generate all league stats');
        }
        throw new Error('An unexpected error occurred while generating all league stats');
    }
};
