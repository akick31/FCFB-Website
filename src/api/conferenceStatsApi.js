import apiClient from './apiClient';

// Conference Stats API functions
export const getFilteredConferenceStats = async (conference = null, season = null, subdivision = null, page = 0, size = 20) => {
    try {
        const params = { page, size };
        if (conference) params.conference = conference;
        if (season) params.season = season;
        if (subdivision) params.subdivision = subdivision;
        
        const response = await apiClient.get('/conference-stats', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch filtered conference stats:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch filtered conference stats');
        }
        throw new Error('An unexpected error occurred while fetching filtered conference stats');
    }
};

export const generateAllConferenceStats = async () => {
    try {
        const response = await apiClient.post('/conference-stats/generate/all');
        return response.data;
    } catch (error) {
        console.error('Failed to generate all conference stats:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to generate all conference stats');
        }
        throw new Error('An unexpected error occurred while generating all conference stats');
    }
};
