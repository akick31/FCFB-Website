import apiClient from './apiClient';

export const getEloHistory = async (team, season = null) => {
    try {
        const params = { team };
        if (season !== null && season !== undefined) {
            params.season = season;
        }

        const response = await apiClient.get('/elo/history', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch ELO history:');
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch ELO history');
        }
        throw new Error('An unexpected error occurred while fetching ELO history');
    }
};

export const getEloHistoryForTeams = async (teams) => {
    try {
        const response = await apiClient.get('/elo/history/teams', { params: { teams: teams.join(',') } });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch ELO history for teams:');
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch ELO history for teams');
        }
        throw new Error('An unexpected error occurred while fetching ELO history for teams');
    }
};
