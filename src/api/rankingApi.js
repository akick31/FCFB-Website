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

export const getTeamRankings = async (teamId, pollType) => {
    try {
        const response = await apiClient.get('/ranking/team', { params: { teamId, pollType } });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch team rankings:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch team rankings');
        }
        throw new Error('An unexpected error occurred while fetching team rankings');
    }
};

export const getRankedGames = async (team, season = null) => {
    try {
        const params = { team, ...(season && { season }) };
        const response = await apiClient.get('/ranking/games', { params });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch ranked games:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch ranked games');
        }
        throw new Error('An unexpected error occurred while fetching ranked games');
    }
};

export const getLatestRankings = async (pollType) => {
    try {
        const response = await apiClient.get('/ranking/latest', { params: { pollType } });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch latest rankings:', error);
        if (error.response) {
            throw new Error(error.response.data.error || 'Failed to fetch latest rankings');
        }
        throw new Error('An unexpected error occurred while fetching latest rankings');
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
