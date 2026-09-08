import apiClient from './apiClient';

export const getVegasOdds = async (homeTeamName, awayTeamName) => {
    try {
        const response = await apiClient.get('/vegas-odds', { params: { homeTeamName, awayTeamName } });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch vegas odds:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch vegas odds');
        }
        throw new Error('An unexpected error occurred while fetching vegas odds');
    }
};
