import apiClient from './apiClient';

export const getTeamResumeMetrics = async (season, week) => {
    try {
        const response = await apiClient.get('/team-resume-metric', { params: { season, week } });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch team resume metrics:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch team resume metrics');
        }
        throw new Error('An unexpected error occurred while fetching team resume metrics');
    }
};
