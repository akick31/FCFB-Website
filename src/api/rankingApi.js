import apiClient from './apiClient';

export const getRankings = async (season, week, pollType) => {
    try {
        const response = await apiClient.get('/ranking', { params: { season, week, pollType } });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch rankings:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch rankings');
        }
        throw new Error('An unexpected error occurred while fetching rankings');
    }
};

export const getRankingWeeks = async (season, pollType) => {
    try {
        const response = await apiClient.get('/ranking/weeks', { params: { season, pollType } });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch ranking weeks:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch ranking weeks');
        }
        throw new Error('An unexpected error occurred while fetching ranking weeks');
    }
};

export const uploadRankings = async ({ season, week, pollType, teams }) => {
    try {
        const response = await apiClient.post('/ranking', { season, week, pollType, teams });
        return response.data;
    } catch (error) {
        console.error('Failed to upload rankings:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to upload rankings');
        }
        throw new Error('An unexpected error occurred while uploading rankings');
    }
};
