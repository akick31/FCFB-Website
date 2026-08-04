import apiClient from './apiClient';

export const getTeamSeasonConference = async (season) => {
    try {
        const response = await apiClient.get('/team-season-conference', { params: { season } });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch team season conference:', error);
        return {};
    }
};
