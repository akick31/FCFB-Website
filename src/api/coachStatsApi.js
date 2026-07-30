import apiClient from './apiClient';

export const getCoachStats = async (coach) => {
    if (!coach) return [];
    try {
        const response = await apiClient.get('/coach-stats', { params: { coach } });
        return response.data || [];
    } catch (error) {
        console.error('Failed to fetch coach stats:', error);
        return [];
    }
};
